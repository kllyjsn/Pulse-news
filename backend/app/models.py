"""Pydantic models for API responses."""

from pydantic import BaseModel
from datetime import datetime


class Article(BaseModel):
    id: str
    title: str
    summary: str
    url: str
    source: str
    source_icon: str
    category: str
    published: datetime | None = None
    image_url: str | None = None
    reading_time: int = 3  # minutes


class NewsResponse(BaseModel):
    articles: list[Article]
    category: str
    updated_at: datetime
    total: int


class BriefingResponse(BaseModel):
    category: str
    briefing: str
    key_themes: list[str]
    updated_at: datetime


class HealthResponse(BaseModel):
    status: str
    version: str
