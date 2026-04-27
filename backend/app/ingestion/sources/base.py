from abc import ABC, abstractmethod

from app.ingestion.models.raw_job import RawJob


class BaseJobFetcher(ABC):
    source_name: str

    @abstractmethod
    def fetch(self) -> list[RawJob]:
        """Return a flat list of RawJob objects. Never raise — log and return []."""
        ...
