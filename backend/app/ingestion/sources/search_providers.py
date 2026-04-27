"""All 21 web search / discovery providers for job URL discovery.

Each provider implements BaseSearchProvider:
  - is_configured() → bool  (check env keys)
  - search(query, num_results) → list[SearchResult]  (never raises)

Usage:
    providers = [p for p in ALL_PROVIDERS if p.is_configured()]
"""

from __future__ import annotations

import logging
import xml.etree.ElementTree as ET

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.ingestion.sources.base_search import BaseSearchProvider, SearchResult

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Shared HTTP helpers
# ---------------------------------------------------------------------------

_TIMEOUT = httpx.Timeout(15.0)


def _retry_decorator():
    return retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        reraise=False,
    )


# ---------------------------------------------------------------------------
# 1. Tavily
# ---------------------------------------------------------------------------


class TavilyProvider(BaseSearchProvider):
    provider_name = "tavily"

    def is_configured(self) -> bool:
        return bool(settings.tavily_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("TavilyProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.post(
            "https://api.tavily.com/search",
            json={"api_key": settings.tavily_api_key, "query": query, "max_results": num_results},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["url"], title=r.get("title", ""), snippet=r.get("content", ""))
            for r in resp.json().get("results", [])
        ]


# ---------------------------------------------------------------------------
# 2. Brave Search
# ---------------------------------------------------------------------------


class BraveProvider(BaseSearchProvider):
    provider_name = "brave"

    def is_configured(self) -> bool:
        return bool(settings.brave_search_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("BraveProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://api.search.brave.com/res/v1/web/search",
            params={"q": query, "count": num_results},
            headers={"X-Subscription-Token": settings.brave_search_api_key, "Accept": "application/json"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["url"], title=r.get("title", ""), snippet=r.get("description", ""))
            for r in resp.json().get("web", {}).get("results", [])
        ]


# ---------------------------------------------------------------------------
# 3. Exa
# ---------------------------------------------------------------------------


class ExaProvider(BaseSearchProvider):
    provider_name = "exa"

    def is_configured(self) -> bool:
        return bool(settings.exa_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("ExaProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.post(
            "https://api.exa.ai/search",
            json={"query": query, "numResults": num_results, "type": "neural"},
            headers={"x-api-key": settings.exa_api_key},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["url"], title=r.get("title", ""), snippet=r.get("text", "")[:300])
            for r in resp.json().get("results", [])
        ]


# ---------------------------------------------------------------------------
# 4. Bing / Azure Cognitive Search
# ---------------------------------------------------------------------------


class BingProvider(BaseSearchProvider):
    provider_name = "bing"

    def is_configured(self) -> bool:
        return bool(settings.bing_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("BingProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://api.bing.microsoft.com/v7.0/search",
            params={"q": query, "count": num_results},
            headers={"Ocp-Apim-Subscription-Key": settings.bing_api_key},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["url"], title=r.get("name", ""), snippet=r.get("snippet", ""))
            for r in resp.json().get("webPages", {}).get("value", [])
        ]


# ---------------------------------------------------------------------------
# 5. Google Programmable Search Engine (PSE)
# ---------------------------------------------------------------------------


class GooglePSEProvider(BaseSearchProvider):
    provider_name = "google_pse"

    def is_configured(self) -> bool:
        return bool(settings.google_pse_api_key and settings.google_pse_cx)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, min(num_results, 10))
        except Exception as exc:
            logger.warning("GooglePSEProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://customsearch.googleapis.com/customsearch/v1",
            params={"key": settings.google_pse_api_key, "cx": settings.google_pse_cx, "q": query, "num": num_results},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["link"], title=r.get("title", ""), snippet=r.get("snippet", ""))
            for r in resp.json().get("items", [])
        ]


# ---------------------------------------------------------------------------
# 6. Serper (Google SERP)
# ---------------------------------------------------------------------------


class SerperProvider(BaseSearchProvider):
    provider_name = "serper"

    def is_configured(self) -> bool:
        return bool(settings.serper_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("SerperProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.post(
            "https://google.serper.dev/search",
            json={"q": query, "num": num_results},
            headers={"X-API-KEY": settings.serper_api_key, "Content-Type": "application/json"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["link"], title=r.get("title", ""), snippet=r.get("snippet", ""))
            for r in resp.json().get("organic", [])
        ]


# ---------------------------------------------------------------------------
# 7. SerpAPI
# ---------------------------------------------------------------------------


class SerpApiProvider(BaseSearchProvider):
    provider_name = "serpapi"

    def is_configured(self) -> bool:
        return bool(settings.serpapi_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("SerpApiProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://serpapi.com/search",
            params={"q": query, "num": num_results, "api_key": settings.serpapi_api_key, "engine": "google"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["link"], title=r.get("title", ""), snippet=r.get("snippet", ""))
            for r in resp.json().get("organic_results", [])
        ]


# ---------------------------------------------------------------------------
# 8. SerpStack
# ---------------------------------------------------------------------------


class SerpStackProvider(BaseSearchProvider):
    provider_name = "serpstack"

    def is_configured(self) -> bool:
        return bool(settings.serpstack_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("SerpStackProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://api.serpstack.com/search",
            params={"access_key": settings.serpstack_api_key, "query": query, "num": num_results},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["url"], title=r.get("title", ""), snippet=r.get("snippet", ""))
            for r in resp.json().get("organic_results", [])
        ]


# ---------------------------------------------------------------------------
# 9. Serply
# ---------------------------------------------------------------------------


class SerplyProvider(BaseSearchProvider):
    provider_name = "serply"

    def is_configured(self) -> bool:
        return bool(settings.serply_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("SerplyProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        import urllib.parse

        resp = httpx.get(
            f"https://api.serply.io/v1/search/{urllib.parse.quote(query)}",
            params={"num": num_results},
            headers={"X-Api-Key": settings.serply_api_key},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["link"], title=r.get("title", ""), snippet=r.get("description", ""))
            for r in resp.json().get("results", [])
        ]


# ---------------------------------------------------------------------------
# 10. SearchAPI.io
# ---------------------------------------------------------------------------


class SearchAPIProvider(BaseSearchProvider):
    provider_name = "searchapi"

    def is_configured(self) -> bool:
        return bool(settings.searchapi_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("SearchAPIProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://www.searchapi.io/api/v1/search",
            params={"q": query, "num": num_results, "api_key": settings.searchapi_api_key, "engine": "google"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["link"], title=r.get("title", ""), snippet=r.get("snippet", ""))
            for r in resp.json().get("organic_results", [])
        ]


# ---------------------------------------------------------------------------
# 11. Kagi
# ---------------------------------------------------------------------------


class KagiProvider(BaseSearchProvider):
    provider_name = "kagi"

    def is_configured(self) -> bool:
        return bool(settings.kagi_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("KagiProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://kagi.com/api/v0/search",
            params={"q": query, "limit": num_results},
            headers={"Authorization": f"Bot {settings.kagi_api_key}"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        results = []
        for item in resp.json().get("data", []):
            # t=0 is web result type
            if item.get("t") == 0:
                results.append(
                    SearchResult(
                        url=item.get("url", ""),
                        title=item.get("title", ""),
                        snippet=item.get("snippet", ""),
                    )
                )
        return results[:num_results]


# ---------------------------------------------------------------------------
# 12. Mojeek
# ---------------------------------------------------------------------------


class MojeekProvider(BaseSearchProvider):
    provider_name = "mojeek"

    def is_configured(self) -> bool:
        return bool(settings.mojeek_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("MojeekProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://www.mojeek.com/search",
            params={"q": query, "fmt": "json", "api_key": settings.mojeek_api_key, "s": num_results},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["url"], title=r.get("title", ""), snippet=r.get("desc", ""))
            for r in resp.json().get("response", {}).get("results", [])
        ]


# ---------------------------------------------------------------------------
# 13. Jina Search (s.jina.ai)
# ---------------------------------------------------------------------------


class JinaSearchProvider(BaseSearchProvider):
    provider_name = "jina_search"
    requires_key = False  # Optional — works without a key (rate-limited)

    def is_configured(self) -> bool:
        return True  # Always available; key just raises limits

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("JinaSearchProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        import urllib.parse

        headers = {"Accept": "application/json"}
        if settings.jina_api_key:
            headers["Authorization"] = f"Bearer {settings.jina_api_key}"
        resp = httpx.get(
            f"https://s.jina.ai/{urllib.parse.quote(query)}",
            headers=headers,
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        items = data.get("data", []) if isinstance(data, dict) else data
        return [
            SearchResult(url=r.get("url", ""), title=r.get("title", ""), snippet=r.get("description", "")[:300])
            for r in items[:num_results]
            if r.get("url")
        ]


# ---------------------------------------------------------------------------
# 14. Perplexity (sonar model)
# ---------------------------------------------------------------------------


class PerplexityProvider(BaseSearchProvider):
    provider_name = "perplexity"

    def is_configured(self) -> bool:
        return bool(settings.perplexity_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("PerplexityProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        import json as _json

        resp = httpx.post(
            "https://api.perplexity.ai/chat/completions",
            json={
                "model": "sonar",
                "messages": [
                    {
                        "role": "user",
                        "content": (
                            f'Search: "{query}". '
                            f"Return a JSON array of up to {num_results} objects with keys "
                            '"url", "title", "snippet". Only include real job posting URLs.'
                        ),
                    }
                ],
                "return_citations": True,
            },
            headers={"Authorization": f"Bearer {settings.perplexity_api_key}"},
            timeout=httpx.Timeout(30.0),
        )
        resp.raise_for_status()
        payload = resp.json()
        content = payload["choices"][0]["message"]["content"]

        # Try to parse as JSON array first
        try:
            start = content.index("[")
            end = content.rindex("]") + 1
            items = _json.loads(content[start:end])
            return [
                SearchResult(url=r.get("url", ""), title=r.get("title", ""), snippet=r.get("snippet", ""))
                for r in items
                if isinstance(r, dict) and r.get("url")
            ][:num_results]
        except (ValueError, _json.JSONDecodeError):
            pass

        # Fallback: pull citations list (plain URLs)
        citations = payload.get("citations", [])
        return [SearchResult(url=url, title="", snippet="") for url in citations[:num_results] if url]


# ---------------------------------------------------------------------------
# 15. You.com (YDC)
# ---------------------------------------------------------------------------


class YDCProvider(BaseSearchProvider):
    provider_name = "ydc"

    def is_configured(self) -> bool:
        return bool(settings.ydc_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("YDCProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://api.ydc-index.io/search",
            params={"query": query},
            headers={"X-API-Key": settings.ydc_api_key},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        results = []
        for hit in resp.json().get("hits", [])[:num_results]:
            snippets = hit.get("snippets", [])
            results.append(
                SearchResult(
                    url=hit.get("url", ""),
                    title=hit.get("title", ""),
                    snippet=snippets[0] if snippets else "",
                )
            )
        return results


# ---------------------------------------------------------------------------
# 16. Yandex XML Search
# ---------------------------------------------------------------------------


class YandexProvider(BaseSearchProvider):
    provider_name = "yandex"

    def is_configured(self) -> bool:
        return bool(settings.yandex_user and settings.yandex_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("YandexProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://yandex.com/search/xml",
            params={"user": settings.yandex_user, "key": settings.yandex_api_key, "query": query, "l10n": "en", "page": 0},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        root = ET.fromstring(resp.text)
        results = []
        for doc in root.findall(".//doc")[:num_results]:
            url_el = doc.find("url")
            title_el = doc.find("title")
            snippet_el = doc.find("headline") or doc.find("passages/passage")
            results.append(
                SearchResult(
                    url=url_el.text if url_el is not None else "",
                    title=title_el.text if title_el is not None else "",
                    snippet=snippet_el.text if snippet_el is not None else "",
                )
            )
        return results


# ---------------------------------------------------------------------------
# 17. SearXNG (self-hosted)
# ---------------------------------------------------------------------------


class SearXNGProvider(BaseSearchProvider):
    provider_name = "searxng"
    requires_key = False

    def is_configured(self) -> bool:
        return bool(settings.searxng_base_url)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("SearXNGProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        base = settings.searxng_base_url.rstrip("/")
        resp = httpx.get(
            f"{base}/search",
            params={"q": query, "format": "json", "categories": "general", "engines": "google,bing"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["url"], title=r.get("title", ""), snippet=r.get("content", ""))
            for r in resp.json().get("results", [])[:num_results]
        ]


# ---------------------------------------------------------------------------
# 18. YaCy (self-hosted P2P)
# ---------------------------------------------------------------------------


class YaCyProvider(BaseSearchProvider):
    provider_name = "yacy"
    requires_key = False

    def is_configured(self) -> bool:
        return bool(settings.yacy_base_url)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("YaCyProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        base = settings.yacy_base_url.rstrip("/")
        resp = httpx.get(
            f"{base}/yacysearch.json",
            params={"query": query, "maximumRecords": num_results, "contentdom": "text"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        items = resp.json().get("channels", [{}])[0].get("items", [])
        return [
            SearchResult(url=r.get("link", ""), title=r.get("title", ""), snippet=r.get("description", ""))
            for r in items[:num_results]
        ]


# ---------------------------------------------------------------------------
# 19. Bocha AI
# ---------------------------------------------------------------------------


class BochaProvider(BaseSearchProvider):
    provider_name = "bocha"

    def is_configured(self) -> bool:
        return bool(settings.bocha_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("BochaProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.post(
            "https://api.bochaai.com/v1/web-search",
            json={"query": query, "count": num_results, "summary": False},
            headers={"Authorization": f"Bearer {settings.bocha_api_key}", "Content-Type": "application/json"},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r["url"], title=r.get("name", ""), snippet=r.get("snippet", ""))
            for r in resp.json().get("data", {}).get("webPages", {}).get("value", [])
        ]


# ---------------------------------------------------------------------------
# 20. Sogou
# ---------------------------------------------------------------------------


class SougouProvider(BaseSearchProvider):
    provider_name = "sougou"

    def is_configured(self) -> bool:
        return bool(settings.sogou_api_key)

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            return self._do_search(query, num_results)
        except Exception as exc:
            logger.warning("SougouProvider error: %s", exc)
            return []

    @_retry_decorator()
    def _do_search(self, query: str, num_results: int) -> list[SearchResult]:
        resp = httpx.get(
            "https://open.sogou.com/api/search",
            params={"appid": settings.sogou_api_key, "query": query, "num": num_results},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return [
            SearchResult(url=r.get("url", ""), title=r.get("title", ""), snippet=r.get("snippet", ""))
            for r in resp.json().get("results", [])[:num_results]
        ]


# ---------------------------------------------------------------------------
# 21. DuckDuckGo (free, no key, uses duckduckgo-search library)
# ---------------------------------------------------------------------------


class DuckDuckGoProvider(BaseSearchProvider):
    provider_name = "duckduckgo"
    requires_key = False

    def is_configured(self) -> bool:
        try:
            from duckduckgo_search import DDGS  # noqa: F401
            return True
        except ImportError:
            return False

    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        try:
            from duckduckgo_search import DDGS

            results = []
            with DDGS() as ddgs:
                for r in ddgs.text(query, max_results=num_results):
                    results.append(
                        SearchResult(
                            url=r.get("href", ""),
                            title=r.get("title", ""),
                            snippet=r.get("body", ""),
                        )
                    )
            return results
        except Exception as exc:
            logger.warning("DuckDuckGoProvider error: %s", exc)
            return []


# ---------------------------------------------------------------------------
# Convenience list — import this to iterate all providers
# ---------------------------------------------------------------------------

ALL_PROVIDERS: list[BaseSearchProvider] = [
    TavilyProvider(),
    BraveProvider(),
    ExaProvider(),
    BingProvider(),
    GooglePSEProvider(),
    SerperProvider(),
    SerpApiProvider(),
    SerpStackProvider(),
    SerplyProvider(),
    SearchAPIProvider(),
    KagiProvider(),
    MojeekProvider(),
    JinaSearchProvider(),
    PerplexityProvider(),
    YDCProvider(),
    YandexProvider(),
    SearXNGProvider(),
    YaCyProvider(),
    BochaProvider(),
    SougouProvider(),
    DuckDuckGoProvider(),
]
