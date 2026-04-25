# PULSE — Real-Time News Intelligence

A world-class news aggregation app delivering to-the-minute updates across **Tech**, **AI**, **Business**, **Money & Markets**, and **Geopolitics** — with AI-powered briefings and an elegant dark-first interface.

## Features

- **Live News Feeds** — Aggregates 20+ RSS sources (TechCrunch, Reuters, BBC, CNBC, etc.) with 60-second refresh
- **AI Briefings** — Perplexity-powered real-time trend summaries per category
- **Featured Stories** — Curated hero grid with one top story per category
- **Category Filtering** — Smooth tab navigation across 5 news verticals
- **Instant Search** — Filter articles by title, summary, or source
- **Auto-Refresh** — Background polling with "Updated X min ago" indicator
- **Elegant UI** — Glassmorphism dark theme, serif headlines, Framer Motion animations

## Architecture

```
frontend/   → React 19 + TypeScript + Vite + Tailwind CSS v4
backend/    → FastAPI + feedparser + Perplexity API
```

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
PERPLEXITY_API_KEY=your_key uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PERPLEXITY_API_KEY` | Optional | Enables AI briefings (falls back gracefully) |

## Data Sources

| Category | Sources |
|---|---|
| Tech | TechCrunch, The Verge, Ars Technica, Wired, Hacker News |
| AI | MIT Tech Review, VentureBeat, The Verge AI, OpenAI Blog |
| Business | Reuters, CNBC, Bloomberg, Financial Times |
| Markets | MarketWatch, CoinDesk, CNBC Markets, Investopedia |
| Geopolitics | Reuters World, BBC World, AP News, Al Jazeera, NPR |

## Deployment

- **Frontend**: Static build (`npm run build`) → deploy `dist/` anywhere
- **Backend**: Docker container → Fly.io or any container host

## License

MIT
