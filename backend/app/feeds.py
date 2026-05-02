"""RSS feed configuration and categories."""

from dataclasses import dataclass

@dataclass(frozen=True)
class FeedSource:
    name: str
    url: str
    category: str
    icon: str = ""


FEEDS: list[FeedSource] = [
    # ── Tech ──────────────────────────────────────────────
    FeedSource("TechCrunch",         "https://techcrunch.com/feed/",                          "tech",    "TC"),
    FeedSource("The Verge",          "https://www.theverge.com/rss/index.xml",                "tech",    "VG"),
    FeedSource("Ars Technica",       "https://feeds.arstechnica.com/arstechnica/index",       "tech",    "AT"),
    FeedSource("Wired",              "https://www.wired.com/feed/rss",                        "tech",    "WR"),
    FeedSource("Hacker News",        "https://hnrss.org/frontpage",                           "tech",    "HN"),

    # ── AI ────────────────────────────────────────────────
    FeedSource("MIT Tech Review",    "https://www.technologyreview.com/feed/",                "ai",      "MT"),
    FeedSource("VentureBeat",        "https://venturebeat.com/feed/",                         "ai",      "VB"),
    FeedSource("The Verge AI",       "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "ai", "VG"),
    FeedSource("OpenAI Blog",        "https://openai.com/blog/rss.xml",                       "ai",      "OA"),

    # ── Business ──────────────────────────────────────────
    FeedSource("Reuters Business",   "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best", "business", "RT"),
    FeedSource("CNBC",               "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147", "business", "CN"),
    FeedSource("Bloomberg",          "https://feeds.bloomberg.com/markets/news.rss",          "business", "BL"),
    FeedSource("Financial Times",    "https://www.ft.com/rss/home",                           "business", "FT"),

    # ── Money & Markets ───────────────────────────────────
    FeedSource("MarketWatch",        "https://feeds.marketwatch.com/marketwatch/topstories/",  "money",   "MW"),
    FeedSource("CoinDesk",           "https://www.coindesk.com/arc/outboundfeeds/rss/",       "money",   "CD"),
    FeedSource("CNBC Markets",       "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", "money", "CN"),
    FeedSource("Investopedia",       "https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline", "money", "IV"),

    # ── Geopolitics ───────────────────────────────────────
    FeedSource("Reuters World",      "https://www.reutersagency.com/feed/?best-topics=world&post_type=best", "geopolitics", "RT"),
    FeedSource("BBC World",          "https://feeds.bbci.co.uk/news/world/rss.xml",           "geopolitics", "BB"),
    FeedSource("AP News",            "https://rsshub.app/apnews/topics/world-news",           "geopolitics", "AP"),
    FeedSource("Al Jazeera",         "https://www.aljazeera.com/xml/rss/all.xml",             "geopolitics", "AJ"),
    FeedSource("NPR World",          "https://feeds.npr.org/1004/rss.xml",                    "geopolitics", "NP"),
]

CATEGORIES = {
    "tech":        {"label": "Tech",             "color": "#6366f1"},
    "ai":          {"label": "AI",               "color": "#8b5cf6"},
    "business":    {"label": "Business",         "color": "#0ea5e9"},
    "money":       {"label": "Money & Markets",  "color": "#10b981"},
    "geopolitics": {"label": "Geopolitics",      "color": "#f59e0b"},
}
