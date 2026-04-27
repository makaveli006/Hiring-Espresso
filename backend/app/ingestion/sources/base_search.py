from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class SearchResult:
    url: str
    title: str
    snippet: str = ""


class BaseSearchProvider(ABC):
    """Abstract base for all web search / discovery providers.

    Implementations should:
    - Set ``provider_name`` as a class variable
    - Override ``is_configured()`` to check required env vars
    - Override ``search()`` to query the API; NEVER raise — return [] on failure
    """

    provider_name: str
    requires_key: bool = True

    @abstractmethod
    def search(self, query: str, num_results: int = 10) -> list[SearchResult]:
        """Query the provider. Return up to num_results SearchResult objects."""
        ...

    def is_configured(self) -> bool:
        """Return True if all required credentials are set."""
        return True
