# 🎪 Pujo Pathfinder

The ultimate high-performance, mobile-first mapping engine for Durga Puja in Kolkata. Pujo Pathfinder provides real-time crowd intelligence, verified pandal locations, and late-night food spot curation powered by a fast Astro frontend and Fastify backend.

## 🚀 Features

- **Blazing Fast Canvas:** Hardware-accelerated 60fps MapLibre GL 3D vector map rendering with Leaflet fallback.
- **Smart Zoning:** Geofenced polygon boundaries classifying Kolkata into North, South, Central, East, and West.
- **Real-time Crowd Matrix:** Heuristic-driven crowd intelligence (Golden Window, Family Window, Peak Crush, Midnight Hopper).
- **Sub-15ms Spatial Backend:** Fastify API using in-memory Haversine distance calculations and data indexes.
- **Trending Algorithm:** Reactive trending score decay engine prioritizing spots based on live outbound navigation clicks.
- **Outbound Deep-links:** Verified one-tap Google Maps Navigation (Transit/Driving/Walking) right from the UI drawer.

---

## 🛠️ Tech Stack

- **Frontend:** Astro 4.x, React, Tailwind CSS, Zustand
- **Backend:** Fastify 4.x, Zod
- **Map Engine:** MapLibre GL JS, Supercluster (Clustering)
- **Deployment:** Netlify (Static + Edge Functions)

---

## 💻 Local Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-org/pujo-pathfinder.git
cd pujo-pathfinder
npm install
```

### 3. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Add your optional API keys (e.g., `GOOGLE_PLACES_API_KEY` for the data enrichment scripts).

### 4. Run Development Server
Start both the Astro frontend (port 4321) and the Fastify backend (port 4000) concurrently:
```bash
npm run dev
```

---

## 📂 Directory Structure

```text
├── server/
│   ├── index.ts              # Fastify Server Entry
│   ├── routes/               # API endpoints (pandals, food, nearby, trending)
│   └── lib/                  # Backend utilities (Data loader, Haversine, Trending algorithm)
├── src/
│   ├── components/           # React UI Components (Cards, Drawers, Search, Filters)
│   ├── data/                 # JSON seed data and GeoJSON boundaries
│   ├── lib/                  # Shared utilities (Zod schemas, MapEngineAdapter, Telemetry)
│   ├── store/                # Zustand State Management
│   └── pages/                # Astro routing
├── scripts/                  # Data ETL Pipelines (Python Reddit Scraper, JS Places Enrichment)
└── data/templates/           # Contribution guidelines & Markdown templates
```

---

## 🤝 Contribution Guide

We rely on crowdsourced intelligence to keep the map updated. 

### Adding Data Manually
1. Go to `data/templates/curation_sheet.md`.
2. Copy the YAML template for the entity (Pandal or Food).
3. Open a PR modifying the JSON payloads in `src/data/`.
4. Ensure your coordinates are exact and backed by social proof.

### Running Automated ETL Pipelines
- **Reddit Scraping:** Extract live crowd data and hidden gems from r/kolkata.
  ```bash
  export REDDIT_CLIENT_ID="xxx"
  export REDDIT_CLIENT_SECRET="xxx"
  python scripts/reddit_curation.py
  ```
- **Google Places Enrichment:** Automatically fix missing coordinates and operational hours in the database.
  ```bash
  node scripts/places_enrichment.js
  ```

---

## 🌐 Deployment (Netlify)

The project is pre-configured with a `netlify.toml` file to deploy the static frontend to a CDN and the API to Edge/Serverless functions.

1. Connect your GitHub repository to Netlify.
2. Netlify will automatically detect the build command (`npm run build`) and publish directory (`dist`).
3. For the backend, ensure your Fastify server is wrapped using a serverless adapter (like `@fastify/aws-lambda`) within `netlify/functions/api.js`.

---

**Built with ❤️ for Kolkata.**
