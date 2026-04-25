"""PULSE — Real-Time News Intelligence API."""

import asyncio
import hashlib
import os
import re
import time
from datetime import datetime, timezone
from html import unescape

import feedparser
import httpx
from cachetools import TTLCache
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .feeds import CATEGORIES, FEEDS, FeedSource
from .models import Article, ArticleContent, BriefingResponse, HealthResponse, NewsResponse

app = FastAPI(title="Pulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Caches ────────────────────────────────────────────────
_article_cache: TTLCache[str, list[Article]] = TTLCache(maxsize=64, ttl=90)
_briefing_cache: TTLCache[str, BriefingResponse] = TTLCache(maxsize=16, ttl=300)
_content_cache: TTLCache[str, ArticleContent] = TTLCache(maxsize=128, ttl=600)
_fetch_lock = asyncio.Lock()

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", os.getenv("Perplexity_API_KEY", ""))

# ── Helpers ───────────────────────────────────────────────

_TAG_RE = re.compile(r"<[^>]+>")
_WHITESPACE_RE = re.compile(r"\s+")

def _strip_html(text: str) -> str:
    text = _TAG_RE.sub(" ", unescape(text))
    return _WHITESPACE_RE.sub(" ", text).strip()


def _estimate_reading_time(text: str) -> int:
    words = len(text.split())
    return max(1, round(words / 220))


def _extract_image(entry: dict) -> str | None:
    # Try media:content
    media = entry.get("media_content", [])
    if media:
        for m in media:
            url = m.get("url", "")
            if url:
                return url
    # Try media:thumbnail
    thumb = entry.get("media_thumbnail", [])
    if thumb:
        for t in thumb:
            url = t.get("url", "")
            if url:
                return url
    # Try enclosure
    for enc in entry.get("enclosures", []):
        if enc.get("type", "").startswith("image"):
            return enc.get("href") or enc.get("url")
    # Try og:image in content
    content = entry.get("content", [{}])
    if content:
        val = content[0].get("value", "") if isinstance(content, list) else ""
        match = re.search(r'<img[^>]+src=["\']([^"\']+)', val)
        if match:
            return match.group(1)
    # Try summary for img tag
    summary = entry.get("summary", "")
    match = re.search(r'<img[^>]+src=["\']([^"\']+)', summary)
    if match:
        return match.group(1)
    return None


def _parse_date(entry: dict) -> datetime | None:
    for field in ("published_parsed", "updated_parsed"):
        t = entry.get(field)
        if t:
            try:
                from calendar import timegm
                return datetime.fromtimestamp(timegm(t), tz=timezone.utc)
            except Exception:
                pass
    return None


async def _fetch_feed(client: httpx.AsyncClient, source: FeedSource) -> list[Article]:
    """Fetch and parse a single RSS feed."""
    try:
        resp = await client.get(source.url, timeout=12.0)
        resp.raise_for_status()
        feed = feedparser.parse(resp.text)
    except Exception:
        return []

    articles: list[Article] = []
    for entry in feed.entries[:15]:
        title = _strip_html(entry.get("title", ""))
        if not title:
            continue
        summary_raw = entry.get("summary", entry.get("description", ""))
        summary = _strip_html(summary_raw)[:500]
        url = entry.get("link", "")
        uid = hashlib.md5(f"{source.name}:{url}".encode()).hexdigest()[:12]
        published = _parse_date(entry)
        image = _extract_image(entry)

        articles.append(Article(
            id=uid,
            title=title,
            summary=summary if len(summary) > 20 else title,
            url=url,
            source=source.name,
            source_icon=source.icon,
            category=source.category,
            published=published,
            image_url=image,
            reading_time=_estimate_reading_time(summary),
        ))
    return articles


async def _fetch_category_inner(category: str) -> list[Article]:
    """Fetch and deduplicate feeds for a single category (no locking)."""
    sources = [f for f in FEEDS if f.category == category]
    async with httpx.AsyncClient(
        follow_redirects=True,
        headers={"User-Agent": "Pulse/1.0 (News Aggregator)"},
    ) as client:
        results = await asyncio.gather(
            *[_fetch_feed(client, s) for s in sources],
            return_exceptions=True,
        )

    articles: list[Article] = []
    for r in results:
        if isinstance(r, list):
            articles.extend(r)

    articles.sort(key=lambda a: a.published or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

    seen_titles: set[str] = set()
    unique: list[Article] = []
    for a in articles:
        key = a.title.lower()[:60]
        if key not in seen_titles:
            seen_titles.add(key)
            unique.append(a)

    return unique


async def _fetch_category(category: str) -> list[Article]:
    """Fetch all feeds for a category, with caching and thundering-herd protection."""
    if category in _article_cache:
        return _article_cache[category]

    async with _fetch_lock:
        if category in _article_cache:
            return _article_cache[category]

        unique = await _fetch_category_inner(category)
        _article_cache[category] = unique
        return unique


async def _fetch_all_categories() -> list[Article]:
    """Fetch articles from all categories."""
    if "all" in _article_cache:
        return _article_cache["all"]

    async with _fetch_lock:
        if "all" in _article_cache:
            return _article_cache["all"]

        results = await asyncio.gather(
            *[_fetch_category_inner(cat) for cat in CATEGORIES]
        )
        all_articles: list[Article] = []
        for r in results:
            all_articles.extend(r)
        all_articles.sort(key=lambda a: a.published or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

        # Cache individual categories too
        for cat, cat_articles in zip(CATEGORIES, results):
            if cat not in _article_cache:
                _article_cache[cat] = cat_articles

        _article_cache["all"] = all_articles
        return all_articles


# ── Routes ────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", version="1.0.0")


@app.get("/api/categories")
async def get_categories():
    return CATEGORIES


@app.get("/api/news", response_model=NewsResponse)
async def get_news(
    category: str = Query("all", description="Category filter"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    if category == "all":
        articles = await _fetch_all_categories()
    elif category in CATEGORIES:
        articles = await _fetch_category(category)
    else:
        articles = []

    sliced = articles[offset : offset + limit]
    return NewsResponse(
        articles=sliced,
        category=category,
        updated_at=datetime.now(timezone.utc),
        total=len(articles),
    )


@app.get("/api/news/featured", response_model=NewsResponse)
async def get_featured(limit: int = Query(6, ge=1, le=20)):
    """Top stories across all categories — picks one per category then fills."""
    all_articles = await _fetch_all_categories()

    featured: list[Article] = []
    seen_cats: set[str] = set()

    # One from each category (newest with an image preferred)
    for cat in CATEGORIES:
        cat_articles = [a for a in all_articles if a.category == cat]
        with_img = [a for a in cat_articles if a.image_url]
        pick = (with_img or cat_articles or [None])[0]
        if pick:
            featured.append(pick)
            seen_cats.add(pick.id)

    # Fill remaining slots with top articles that have images
    for a in all_articles:
        if len(featured) >= limit:
            break
        if a.id not in seen_cats and a.image_url:
            featured.append(a)
            seen_cats.add(a.id)

    return NewsResponse(
        articles=featured[:limit],
        category="featured",
        updated_at=datetime.now(timezone.utc),
        total=len(featured),
    )


@app.get("/api/briefing", response_model=BriefingResponse)
async def get_briefing(category: str = Query("all")):
    """AI-powered briefing using Perplexity API."""
    cache_key = f"briefing:{category}"
    if cache_key in _briefing_cache:
        return _briefing_cache[cache_key]

    if not PERPLEXITY_API_KEY:
        return BriefingResponse(
            category=category,
            briefing="Configure PERPLEXITY_API_KEY for AI-powered briefings.",
            key_themes=["Tech", "AI", "Business", "Markets", "Geopolitics"],
            updated_at=datetime.now(timezone.utc),
        )

    cat_label = CATEGORIES.get(category, {}).get("label", "all news topics")
    if category == "all":
        cat_label = "technology, AI, business, financial markets, and geopolitics"

    prompt = (
        f"Give me a concise 3-4 sentence briefing on the most important {cat_label} "
        f"news happening right now (as of {datetime.now(timezone.utc).strftime('%B %d, %Y')}). "
        f"Also list 3-5 key themes or trending topics as short phrases. "
        f"Format: start with the briefing paragraph, then on a new line write "
        f"'KEY_THEMES:' followed by a comma-separated list."
    )

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers={
                    "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "sonar",
                    "messages": [
                        {"role": "system", "content": "You are a concise, authoritative news analyst. Be specific with names, numbers, and events."},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 400,
                },
                timeout=15.0,
            )
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]

            # Parse out key themes
            if "KEY_THEMES:" in text:
                parts = text.split("KEY_THEMES:")
                briefing_text = parts[0].strip()
                themes = [t.strip().strip("- ") for t in parts[1].split(",")]
            else:
                briefing_text = text.strip()
                themes = ["Breaking News", "Markets", "Technology"]

            result = BriefingResponse(
                category=category,
                briefing=briefing_text,
                key_themes=themes[:5],
                updated_at=datetime.now(timezone.utc),
            )
            _briefing_cache[cache_key] = result
            return result

    except Exception:
        return BriefingResponse(
            category=category,
            briefing="Unable to generate briefing at this time.",
            key_themes=["News", "Updates", "Analysis"],
            updated_at=datetime.now(timezone.utc),
        )


def _validate_url(url: str) -> str | None:
    """Validate URL to prevent SSRF. Returns error message or None if valid."""
    import ipaddress
    import socket
    from urllib.parse import urlparse

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return "Only http and https URLs are allowed"

    hostname = parsed.hostname
    if not hostname:
        return "Invalid URL"

    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for family, _type, _proto, _canonname, sockaddr in addr_info:
            ip = ipaddress.ip_address(sockaddr[0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                return "URLs pointing to internal networks are not allowed"
    except (socket.gaierror, ValueError):
        return "Could not resolve hostname"

    return None


@app.get("/api/article", response_model=ArticleContent)
async def get_article_content(url: str = Query(..., description="Article URL to fetch")):
    """Fetch and extract readable content from an article URL."""
    from html import escape as html_escape

    validation_error = _validate_url(url)
    if validation_error:
        safe_url = html_escape(url, quote=True)
        return ArticleContent(
            url=url,
            title="Invalid URL",
            content=f"<p>{html_escape(validation_error)}. <a href=\"{safe_url}\" target=\"_blank\" rel=\"noopener\">Try the original site →</a></p>",
            text=validation_error,
            reading_time=0,
            source="",
        )

    if url in _content_cache:
        return _content_cache[url]

    try:
        from readability import Document
        from lxml.html.clean import Cleaner
        import lxml.html

        async with httpx.AsyncClient(
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
        ) as client:
            resp = await client.get(url, timeout=15.0)
            resp.raise_for_status()
            html_text = resp.text

        doc = Document(html_text)
        title = doc.title()
        content_html = doc.summary(html_partial=True)

        # Clean the HTML for safe rendering
        cleaner = Cleaner(
            scripts=True, javascript=True, embedded=True, meta=True,
            page_structure=False, processing_instructions=True, remove_unknown_tags=False,
            safe_attrs_only=True, safe_attrs=frozenset([
                "src", "href", "alt", "title", "class", "width", "height",
            ]),
            forms=True, annoying_tags=True, frames=True,
        )
        cleaned_html = cleaner.clean_html(content_html)
        # Remove the wrapper elements the cleaner adds
        if cleaned_html.startswith("<div>"):
            cleaned_html = cleaned_html[5:]
            if cleaned_html.endswith("</div>"):
                cleaned_html = cleaned_html[:-6]

        # Extract plain text for reading time
        text_content = _strip_html(content_html)
        reading_time = max(1, round(len(text_content.split()) / 220))

        # Try to find hero image
        tree = lxml.html.fromstring(html_text)
        image_url = None
        for meta in tree.xpath('//meta[@property="og:image"]'):
            image_url = meta.get("content")
            break
        if not image_url:
            for meta in tree.xpath('//meta[@name="twitter:image"]'):
                image_url = meta.get("content")
                break

        # Extract source domain
        from urllib.parse import urlparse
        source = urlparse(url).netloc.replace("www.", "")

        result = ArticleContent(
            url=url,
            title=title,
            content=cleaned_html,
            text=text_content,
            image_url=image_url,
            reading_time=reading_time,
            source=source,
        )
        _content_cache[url] = result
        return result

    except Exception:
        safe_url = html_escape(url, quote=True)
        return ArticleContent(
            url=url,
            title="Unable to load article",
            content=f"<p>Could not extract content from this article. <a href=\"{safe_url}\" target=\"_blank\" rel=\"noopener\">Read on the original site →</a></p>",
            text="Could not extract content from this article.",
            reading_time=0,
            source="",
        )
