"""SearchDiscoveryFetcher — queries multiple search/discovery APIs to find job posting URLs,
then scrapes each URL to build RawJob objects.

Flow per pipeline run:
  1. For each configured provider × _JOB_QUERIES → collect SearchResult list
  2. Filter URLs via _is_job_url() (keep known ATS patterns, reject aggregators)
  3. Deduplicate; cap at settings.search_discovery_max_urls
  4. Scrape each URL via Jina reader API first, then httpx+BS4 as fallback
  5. Build RawJob for normalizer
"""

from __future__ import annotations

import hashlib
import logging
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx

from app.core.config import settings
from app.ingestion.models.raw_job import RawJob
from app.ingestion.sources.base import BaseJobFetcher
from app.ingestion.sources.base_search import BaseSearchProvider, SearchResult

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(20.0)

# ---------------------------------------------------------------------------
# Default queries — targeted to hit direct job posting pages, not aggregators
# ---------------------------------------------------------------------------
_JOB_QUERIES: list[str] = [
    "software engineer jobs apply now 2026",
    "data scientist positions hiring 2026",
    "product manager jobs open apply 2026",
    "devops engineer jobs site:greenhouse.io",
    "machine learning engineer remote jobs 2026",
    "backend engineer jobs site:lever.co",
    "frontend developer openings apply 2026",
    "data engineer jobs hiring 2026",
]

# ---------------------------------------------------------------------------
# URL classification
# ---------------------------------------------------------------------------

_ACCEPT_PATTERNS = (
    "greenhouse.io/jobs",
    "greenhouse.io/embed",
    "lever.co/postings",
    "/careers/",
    "/jobs/",
    "/job/",
    "/openings/",
    "/apply/",
    "/positions/",
    "/vacancies/",
    "workday.com",
    "ashbyhq.com",
    "jobs.ashbyhq.com",
    "apply.workable.com",
    "boards.eu.greenhouse.io",
)

_REJECT_DOMAINS = (
    "linkedin.com",
    "indeed.com",
    "glassdoor.com",
    "monster.com",
    "ziprecruiter.com",
    "simplyhired.com",
    "careerbuilder.com",
    "dice.com",
    "wellfound.com",
    "ycombinator.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "reddit.com",
    "youtube.com",
    "wikipedia.org",
)


def _is_job_url(url: str) -> bool:
    if not url or not url.startswith(("http://", "https://")):
        return False
    parsed = urlparse(url)
    host = (parsed.netloc or "").lower()
    path = (parsed.path or "").lower()
    full = (host + path).lower()

    if any(reject in host for reject in _REJECT_DOMAINS):
        return False

    return any(pattern in full for pattern in _ACCEPT_PATTERNS)


def _extract_company_from_url(url: str) -> str:
    """Best-effort company name extraction from known ATS URL patterns."""
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        path = parsed.path.strip("/")
        segments = [s for s in path.split("/") if s]

        if "greenhouse.io" in host:
            # boards.greenhouse.io/{company}/jobs/{id}
            if segments:
                return segments[0].replace("-", " ").replace("_", " ").title()

        if "lever.co" in host:
            # jobs.lever.co/{company}/{id}
            if segments:
                return segments[0].replace("-", " ").replace("_", " ").title()

        if "ashbyhq.com" in host:
            if segments:
                return segments[0].replace("-", " ").title()

        # Generic: strip common TLDs and use main hostname part
        parts = host.split(".")
        # Skip www, jobs, careers subdomains
        meaningful = [p for p in parts if p not in ("www", "jobs", "careers", "apply", "boards")]
        if meaningful:
            return meaningful[0].replace("-", " ").title()
    except Exception:
        pass
    return "Unknown Company"


# ---------------------------------------------------------------------------
# Scraping helpers
# ---------------------------------------------------------------------------


def _fetch_via_jina(url: str) -> str:
    """Fetch page content via Jina Reader API (free tier, returns clean markdown)."""
    headers = {"Accept": "text/plain"}
    if settings.jina_api_key:
        headers["Authorization"] = f"Bearer {settings.jina_api_key}"
    resp = httpx.get(f"https://r.jina.ai/{url}", headers=headers, timeout=_TIMEOUT)
    resp.raise_for_status()
    return resp.text[:8000]


def _fetch_via_httpx(url: str) -> str:
    """Fallback: plain httpx + BeautifulSoup stripped to text."""
    from bs4 import BeautifulSoup

    resp = httpx.get(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; HiringEspresso/1.0)"},
        follow_redirects=True,
        timeout=_TIMEOUT,
    )
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    # Remove noise
    for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)[:8000]


def _fetch_via_firecrawl(url: str) -> str:
    """Optional: use Firecrawl for richer extraction if API key is set."""
    resp = httpx.post(
        "https://api.firecrawl.dev/v0/scrape",
        json={"url": url, "formats": ["markdown"]},
        headers={"Authorization": f"Bearer {settings.firecrawl_api_key}"},
        timeout=_TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json().get("data", {}).get("markdown", "")[:8000]


def _scrape_url(url: str) -> str | None:
    """Try Jina → Firecrawl → httpx+BS4. Return None if all fail."""
    # Prefer Firecrawl when key is set (richer extraction)
    if settings.firecrawl_api_key:
        try:
            return _fetch_via_firecrawl(url)
        except Exception as exc:
            logger.debug("Firecrawl failed for %s: %s", url, exc)

    try:
        return _fetch_via_jina(url)
    except Exception as exc:
        logger.debug("Jina failed for %s: %s", url, exc)

    try:
        return _fetch_via_httpx(url)
    except Exception as exc:
        logger.debug("httpx fallback failed for %s: %s", url, exc)

    return None


# ---------------------------------------------------------------------------
# The fetcher itself
# ---------------------------------------------------------------------------


class SearchDiscoveryFetcher(BaseJobFetcher):
    source_name = "search_discovery"

    def __init__(
        self,
        providers: list[BaseSearchProvider],
        queries: list[str] | None = None,
    ) -> None:
        self._providers = [p for p in providers if p.is_configured()]
        self._queries = queries or _JOB_QUERIES

        configured_names = [p.provider_name for p in self._providers]
        logger.info(
            "SearchDiscoveryFetcher: %d/%d providers configured: %s",
            len(self._providers),
            len(providers),
            configured_names,
        )

    def fetch(self) -> list[RawJob]:
        if not settings.search_discovery_enabled:
            logger.info("SearchDiscoveryFetcher: disabled via SEARCH_DISCOVERY_ENABLED=false")
            return []

        if not self._providers:
            logger.warning("SearchDiscoveryFetcher: no providers configured — add at least one API key")
            return []

        # Step 1 — collect URLs from all providers × queries
        url_map: dict[str, SearchResult] = {}  # url → best SearchResult (for title/snippet)

        for provider in self._providers:
            for query in self._queries:
                try:
                    results = provider.search(query, num_results=10)
                    for result in results:
                        if _is_job_url(result.url) and result.url not in url_map:
                            url_map[result.url] = result
                    time.sleep(0.3)
                except Exception as exc:
                    logger.warning("Provider %s query %r failed: %s", provider.provider_name, query, exc)

        logger.info("SearchDiscoveryFetcher: %d candidate URLs before cap", len(url_map))

        # Step 2 — cap at configured max
        max_urls = settings.search_discovery_max_urls
        selected = dict(list(url_map.items())[:max_urls])
        logger.info("SearchDiscoveryFetcher: scraping %d URLs (max=%d)", len(selected), max_urls)

        # Step 3 — scrape each URL and build RawJob
        jobs: list[RawJob] = []
        for url, result in selected.items():
            content = _scrape_url(url)
            if not content or len(content.strip()) < 100:
                logger.debug("SearchDiscoveryFetcher: skipping %s (no useful content)", url)
                continue

            # Derive a stable external ID from the URL
            external_id = hashlib.sha256(url.encode()).hexdigest()[:16]
            company_name = _extract_company_from_url(url)

            jobs.append(
                RawJob(
                    source=self.source_name,
                    external_id=external_id,
                    title=result.title or "Job Posting",
                    company_name=company_name,
                    job_posting_url=url,
                    description_html=content,
                    location_raw=None,
                    remote_flag=None,
                    tags=[],
                    posted_at=datetime.now(tz=timezone.utc),
                    salary_raw=None,
                    commitment_raw=None,
                )
            )
            time.sleep(0.2)  # Gentle rate-limit on scraping

        logger.info("SearchDiscoveryFetcher: built %d RawJob objects", len(jobs))
        return jobs
