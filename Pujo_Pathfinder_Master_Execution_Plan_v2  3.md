# Pujo Pathfinder (v2.0 Master Plan)

## Unified AI-Executable Blueprint & Token-Safe Implementation Roadmap

**Document Status:** Production Handoff  
**Architecture:** Monorepo (Astro Frontend \+ Fastify/Netlify Serverless Backend)  
**Target Environments:** DeepSeek V3 / R1, Claude 3.5 / 3.7 Sonnet, Gemini 1.5 / 2.0 Pro  
**Core Mission:** Build an ultra-resilient, community-driven, 5-zone Kolkata Durga Puja & Food navigation app with zero-crash WebGL/2D fallback, Kolkata Metro line overlays, and one-tap Google Maps outbound links.

---

## 1\. Architectural & Token Budget Audit (Critical Gap Analysis)

A rigorous audit of PRD v1.1 against your core requirements reveals four major architectural gaps that would derail AI execution if unaddressed:

| Audit Dimension | Issue in v1.1 | Solution in v2.0 Master Plan |
| :---- | :---- | :---- |
| **Transit Layer** | **Kolkata Metro was completely omitted.** Visual overlays for Blue, Green, Purple, and Orange lines shown in Pujo Atlas are essential for realistic Kolkata transit routing. | Added dedicated task **T-02B** for GeoJSON Metro alignments and **T-14B** for toggleable transit vector layers. |
| **Token Budget Drift** | Tasks like **T-17** and **T-18** (7,000 tokens) approach output limits and risk truncation, markdown breaks, and lost state. | Sliced all component tasks to **≤ 4,000 total tokens** (maximum 2,500 output tokens) so models complete clean code in a single generation. |
| **Fallback Cohesion** | v1.1 kept Leaflet (T-16) separate from MapLibre (T-13), which causes divergent state logic and marker click bugs across renderers. | Unified map interface using an abstraction bridge pattern (`MapEngineAdapter`), switching between MapLibre GL and Leaflet dynamically without duplicating marker handlers. |
| **Data Realism** | Seed tasks (T-03 to T-07) lacked strict station-linking, exact midnight food categorisation, and explicit geo-bounding limits. | Embedded strict structural fixtures and coordinates across all 5 zones into the task specs. |

---

## 2\. Global Execution Matrix & Token Budgets

Every task is strictly capped at **≤ 2,500 generation tokens** (well below the 8,192 hard ceiling of DeepSeek/Claude/Gemini).

Phase 0: Architecture & Schemas (T-00 to T-02B)      ──\> 14,000 Tokens

Phase 1: Seed Data & Metro Topography (T-03 to T-07) ──\> 17,000 Tokens

Phase 2: High-Performance Backend (T-08 to T-12)     ──\> 18,000 Tokens

Phase 3: Resilient Map Engine (T-13 to T-16B)        ──\> 21,000 Tokens

Phase 4: Mobile Cards & Google Nav (T-17A to T-19)   ──\> 19,000 Tokens

Phase 5: Search, Filters & Trending (T-20 to T-24)   ──\> 20,000 Tokens

Phase 6: Curation & Deployment (T-25 to T-29)        ──\> 17,000 Tokens

──────────────────────────────────────────────────────────────────────

TOTAL LIFECYCLE TOKEN BUDGET:                       126,000 Tokens (+15% Buffer \= \~145k)

### Model Allocation Guide

* **DeepSeek V3 / R1 (Cheap, fast, structured)**: T-00, T-01, T-03, T-04, T-05, T-06, T-07, T-08, T-09, T-10, T-11, T-19, T-24, T-28, T-29.  
* **Claude 3.5 / 3.7 Sonnet (Complex UI logic, state, hooks)**: T-12, T-13, T-14A, T-14B, T-15, T-16, T-17A, T-17B, T-18A, T-18B, T-20, T-21, T-22, T-23.  
* **Gemini 1.5 / 2.0 Pro (Spatial data, large context synthesis)**: T-02A, T-02B, T-25, T-26, T-27.

---

## 3\. Step-by-Step AI-Executable Task Specifications

### Phase 0: Foundation & Spatial Schemas

#### `[T-00]` Monorepo & Dependencies Setup

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,200 | **Out:** 1,200 | **Total:** 2,400  
* **Goal:** Initialize an Astro 4.x \+ Fastify monorepo with TypeScript strict mode and Tailwind CSS.  
* **Output:** `package.json`, `tsconfig.json`, `tailwind.config.mjs`, `.env.example`, monorepo directory tree.  
* **Acceptance Criteria:** `npm install` and `npm run dev` start clean without dependency collisions.

#### `[T-01]` Strict TypeScript Schemas & Zod Contracts

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,500 | **Out:** 1,500 | **Total:** 3,000  
* **Goal:** Define canonical interfaces and Zod validators for Pandals, Food, Metro Lines, and Zones.  
* **File:** `/src/lib/schemas.ts`  
* **Schema Requirements:**  
    
  export type Zone \= 'NORTH' | 'SOUTH' | 'CENTRAL' | 'EAST' | 'WEST';  
    
  export type FoodCategory \= 'RESTAURANT' | 'CAFE' | 'DHABA' | 'STREET\_FOOD' | 'SWEETS';  
    
  export type PriceRange \= 'BUDGET' | 'MID\_RANGE' | 'PREMIUM';  
    
  export interface PandalEntity {  
    
    id: string;  
    
    name: string;  
    
    zone: Zone;  
    
    address: string;  
    
    lat: number;  
    
    lng: number;  
    
    nearestMetroStationId: string;  
    
    bestTimeToVisit: string\[\]; // e.g. \["Saptami 4 AM \- 7 AM (Low Crowd)", "Ashtami Sandhi Puja (Peak)"\]  
    
    bestDays: ('Chaturthi' | 'Panchami' | 'Shashthi' | 'Saptami' | 'Ashtami' | 'Navami' | 'Dashami')\[\];  
    
    isFamous: boolean;  
    
    tags: string\[\];  
    
    sourceUrls: { platform: 'reddit' | 'instagram' | 'google' | 'facebook'; url: string }\[\];  
    
  }  
    
* **Acceptance Criteria:** Zod schemas pass zero-error TypeScript check; invalid mock inputs fail validation.

#### `[T-02A]` 5-Zone GeoJSON Polygons

* **Priority:** P0 | **Model:** Gemini Pro | **In:** 1,800 | **Out:** 2,200 | **Total:** 4,000  
* **Goal:** Deliver mathematically valid GeoJSON boundary polygons for North, South, Central, East, and West Kolkata.  
* **File:** `/src/data/zones.geojson`  
* **Boundaries:**  
  * **North:** North of Beadon St / Shyambazar up to BT Road / Baranagar.  
  * **Central:** South of Beadon St, North of Park St / AJC Bose Rd flyover, West of EM Bypass.  
  * **South:** South of Park St / Rashbehari to Tollygunge / Jadavpur / Garia.  
  * **East:** East of AJC Bose / EM Bypass encompassing Salt Lake, Kankurgachi, New Town.  
  * **West:** West of Diamond Harbour Road including Behala, New Alipore, Thakurpukur.  
* **Acceptance Criteria:** Valid RFC 7946 GeoJSON format. Polygons tile the city without erratic gaps.

#### `[T-02B]` Kolkata Metro System GeoJSON Alignment

* **Priority:** P0 | **Model:** Gemini Pro | **In:** 1,600 | **Out:** 2,400 | **Total:** 4,000  
* **Goal:** Generate accurate GeoJSON FeatureCollections for Kolkata Metro Line polylines and station points.  
* **File:** `/src/data/metro-lines.geojson`  
* **Network Features:**  
  * **Blue Line (Line 1):** Dakshineswar ↔ Kavi Subhash (Dum Dum, Shyambazar, Girish Park, MG Road, Central, Esplanade, Park Street, Kalighat, Rabindra Sarobar, etc.).  
  * **Green Line (Line 2):** Howrah Maidan ↔ Esplanade ↔ Sealdah ↔ Salt Lake Sector V.  
  * **Purple Line (Line 3):** Joka ↔ Taratala ↔ Majerhat.  
  * **Orange Line (Line 6):** Kavi Subhash ↔ Hemanta Mukhopadhyay (Ruby).  
* **Acceptance Criteria:** Clean GeoJSON featuring line station names, station coordinates, and line color hex attributes.

---

### Phase 1: Curated Seed Data

#### `[T-03]` North Kolkata Seed Dataset

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,200 | **Out:** 2,200 | **Total:** 3,400  
* **Goal:** 20 verified North Kolkata pandals with nearest Metro link and curated Reddit/Instagram sources.  
* **File:** `/src/data/pandals-north.json`  
* **Included Hubs:** Bagbazar Sarbojanin, Kumartuli Park, Ahiritola Sarbojanin, Tala Prattay, Kashi Bose Lane, Hatibagan Sarbojanin, Sovabazar Rajbari, Chaltabagan Lohapatty.  
* **Acceptance Criteria:** Exact coordinates, specific time windows (e.g. "04:00 \- 07:30 AM to bypass queues"), and verified nearest stations (e.g., Shyambazar, Sovabazar).

#### `[T-04]` South Kolkata Seed Dataset

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,200 | **Out:** 2,200 | **Total:** 3,400  
* **Goal:** 20 verified South Kolkata pandals with timing heuristics.  
* **File:** `/src/data/pandals-south.json`  
* **Included Hubs:** Ekdalia Evergreen, Singhi Park, Deshapriya Park, Tridhara Sammilani, Mudiali Club, Ballygunge Cultural, Badamtala Ashar Sangha, Chetla Agrani, Suruchi Sangha.  
* **Acceptance Criteria:** All 20 items match `PandalSchema` with exact lat/lng and station mappings (Kalighat, Jatin Das Park, Rabindra Sarobar).

#### `[T-05]` Central Kolkata Seed Dataset

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,100 | **Out:** 2,000 | **Total:** 3,100  
* **Goal:** 15 verified Central Kolkata pandals with historical and theme context.  
* **File:** `/src/data/pandals-central.json`  
* **Included Hubs:** College Square, Mohammad Ali Park, Santosh Mitra Square (Lebutala), Subodh Mallick Square, Sealdah Railway Athletic Club.  
* **Acceptance Criteria:** Exact lat/lng, nearest station mappings (MG Road, Central, Esplanade, Sealdah).

#### `[T-06]` East & West Kolkata Seed Dataset

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,200 | **Out:** 2,200 | **Total:** 3,400  
* **Goal:** 20 pandals (10 East Kolkata \+ 10 West Kolkata/Behala).  
* **Files:** `/src/data/pandals-east.json`, `/src/data/pandals-west.json`  
* **Included Hubs:**  
  * *East:* Sreebhumi Sporting Club, Dum Dum Park Tarun Sangha, Dum Dum Park Bharat Chakra, Beleghata 33 Palli, Salt Lake FD & BJ Block.  
  * *West:* Behala Nutan Dal, Barisha Club, Behala Players Corner, Ajeya Sanghati, Haridevpur 41 Pally.  
* **Acceptance Criteria:** 100% schema compliance, precise geo-tags along VIP Road, EM Bypass, and Diamond Harbour Road.

#### `[T-07]` Kolkata Food & Late-Night Dhabas Dataset (All 5 Zones)

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,400 | **Out:** 2,400 | **Total:** 3,800  
* **Goal:** 35 curated food hubs (7 per zone) covering restaurants, cafes, late-night dhabas, street food, and heritage sweets.  
* **File:** `/src/data/food.json`  
* **Key Inclusions:**  
  * *North:* Mitra Cafe (Kabiraji), Golbari (Kosha Mangsho), Adi Haridas Modak, Paramount Sherbet.  
  * *South:* Jai Hind Dhaba (late night), Azad Hind Dhaba, Dilip Da's Phuchka (Vivekananda Park), Maharaj / Maharani (Hing Kachori), Bhojohari Manna.  
  * *Central:* Zakaria Street kebab points, Dacres Lane (Chitto Babur Dokan), Anadi Cabin, Putiram.  
  * *East:* Salt Lake Sector 1 & City Centre cafes, VIP Road Dhabas, Kaafila.  
  * *West:* Diamond Harbour Road roll counters, Behala Thana phuchka spots, local chops hubs.  
* **Acceptance Criteria:** Every entry contains `mustTryDishes`, `openHours` (flagging 24/7 or post-midnight status), and `associatedPandals`.

---

### Phase 2: High-Performance Backend API

#### `[T-08]` Fastify Server Core & Middleware

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,000 | **Out:** 1,200 | **Total:** 2,200  
* **Goal:** Configure low-overhead Fastify API instance with CORS, compression, error handlers, and `/health`.  
* **File:** `/server/index.ts`  
* **Acceptance Criteria:** Starts under 50ms locally; passes unit health test with status `ok`.

#### `[T-09]` GET `/api/pandals` Filter Route

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,200 | **Out:** 1,600 | **Total:** 2,800  
* **Goal:** Query pandals by `zone`, `metroStation`, `bestDay`, `isFamous`, and search query.  
* **File:** `/server/routes/pandals.ts`  
* **Acceptance Criteria:** Responds in \< 15ms using in-memory indexed structures.

#### `[T-10]` GET `/api/food` Category & Late-Night Route

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,200 | **Out:** 1,600 | **Total:** 2,800  
* **Goal:** Query food spots with filters for `zone`, `category`, `priceRange`, and `isMidnightOpen`.  
* **File:** `/server/routes/food.ts`  
* **Acceptance Criteria:** Proper query validation using Zod.

#### `[T-11]` GET `/api/nearby` Spatial Proximity Engine

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,400 | **Out:** 1,800 | **Total:** 3,200  
* **Goal:** Implement fast Haversine spherical distance calculation returning pandals, food spots, and metro stations within radius `r` of `[lat, lng]`.  
* **File:** `/server/routes/nearby.ts`  
* **Acceptance Criteria:** Calculates straight-line distance in meters, sorted ascending; responds under 20ms for 1,000 entities.

#### `[T-12]` Trending Algorithm & Click Logging (Pujo Atlas Heuristic)

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,600 | **Out:** 2,400 | **Total:** 4,000  
* **Goal:** Dynamic real-time popularity scoring based on user interactions.  
* **Files:** `/server/routes/navigate.ts`, `/server/lib/trending.ts`  
* **Scoring Rules:**  
  * Base baseline: `score = 100`.  
  * Outbound navigate click: `+3` points.  
  * Search result click: `+2` points to target, `-1` to others in view.  
  * Time-decay worker: Decrement scores without positive actions over sliding 6-hour windows (floor at 0).  
* **Acceptance Criteria:** In-memory score cache updates atomically and exposes `GET /api/trending`.

---

### Phase 3: Resilient Map Canvas Engine

#### `[T-13]` MapEngineAdapter (Unified MapLibre \+ Leaflet Contract)

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,500 | **Out:** 2,200 | **Total:** 3,700  
* **Goal:** Create an abstract map controller so UI code talks to a single API regardless of whether WebGL2 is active.  
* **File:** `/src/lib/map/MapEngineAdapter.ts`  
* **Interface Specification:**  
    
  export interface IMapAdapter {  
    
    init(container: HTMLElement, options: { center: \[number, number\]; zoom: number }): Promise\<void\>;  
    
    renderMarkers(items: MarkerItem\[\], onClick: (id: string, type: 'pandal' | 'food') \=\> void): void;  
    
    renderMetroLines(geoJson: any): void;  
    
    highlightZone(zone: Zone): void;  
    
    flyTo(coords: \[number, number\], zoom?: number): void;  
    
  }  
    
* **Acceptance Criteria:** Seamless swapping between MapLibre and Leaflet without rewriting markers or event hooks.

#### `[T-14A]` MapLibre 3D Vector Implementation

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,600 | **Out:** 2,400 | **Total:** 4,000  
* **Goal:** High-performance Dark Matter vector map renderer with zone color codes.  
* **File:** `/src/lib/map/MapLibreDriver.ts`  
* **Zone Palette:**  
  * North: `#3B82F6` (Electric Blue)  
  * South: `#10B981` (Emerald Green)  
  * Central: `#EF4444` (Crimson Red)  
  * East: `#F59E0B` (Amber Orange)  
  * West: `#8B5CF6` (Purple)  
* **Acceptance Criteria:** 60fps panning on modern mobile screens; hardware-accelerated token-light styling.

#### `[T-14B]` Kolkata Metro Interactive Overlay Layer

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,400 | **Out:** 2,000 | **Total:** 3,400  
* **Goal:** Render Kolkata Metro lines with genuine line identity colors and station icons over the canvas.  
* **Line Styles:**  
  * Blue Line: `#0072BC`  
  * Green Line: `#00A651`  
  * Purple Line: `#80276C`  
  * Orange Line: `#F37023`  
* **Acceptance Criteria:** Clean stroke widths with toggle button to show/hide transit routes independently.

#### `[T-15]` Adaptive Clustering & Viewport Culling

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,200 | **Out:** 1,800 | **Total:** 3,000  
* **Goal:** Cluster markers dynamically when zoom level is below 13.5 to prevent mobile visual clutter.  
* **File:** `/src/lib/map/clustering.ts`  
* **Acceptance Criteria:** Zero frame stutter when clustering 200+ markers across zoom in/out.

#### `[T-16]` Leaflet 2D Fallback Engine (Anti-Crash Guarantee)

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,500 | **Out:** 2,200 | **Total:** 3,700  
* **Goal:** Automatic fallback to standard 2D Leaflet rendering whenever WebGL2 context initialization fails.  
* **File:** `/src/lib/map/LeafletDriver.ts`  
* **Detection Hook:**  
    
  export function isWebGL2Available(): boolean {  
    
    try {  
    
      const c \= document.createElement('canvas');  
    
      return \!\!(window.WebGL2RenderingContext && c.getContext('webgl2'));  
    
    } catch {  
    
      return false;  
    
    }  
    
  }  
    
* **Acceptance Criteria:** If WebGL2 is disabled, the map renders fully on 2D canvas without error alerts or blank screens.

---

### Phase 4: Mobile Cards & Outbound Navigation

#### `[T-17A]` Pandal Detail Drawer — Core Presentation

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,400 | **Out:** 2,200 | **Total:** 3,600  
* **Goal:** Responsive slide-up bottom sheet with pandal details, zone badge, and social attribution links.  
* **File:** `/src/components/cards/PandalHeader.tsx`  
* **Content:** Name, theme description, nearest metro walking time, and social proof chips (Reddit, Instagram, Google).  
* **Acceptance Criteria:** Smooth drag gestures and clean mobile closing animations.

#### `[T-17B]` Pandal Timing & Crowd Intelligence Module

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,200 | **Out:** 1,800 | **Total:** 3,000  
* **Goal:** Render the pre-computed crowd advisory matrix.  
* **File:** `/src/components/cards/PandalTimingSection.tsx`  
* **UI Structure:**  
  * 🟢 **Golden Window**: Early Morning 04:00 AM – 08:30 AM (Minimal queues).  
  * 🟡 **Family Window**: 11:00 AM – 04:00 PM (Moderate lines).  
  * 🔴 **Peak Crush**: 07:30 PM – 01:30 AM (High crowd density).  
  * 🟣 **Midnight Hopper**: 02:00 AM – 04:30 AM.  
* **Acceptance Criteria:** Renders crowd schedule clearly for the selected puja day.

#### `[T-18A]` Food Spot Detail Drawer

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,400 | **Out:** 2,200 | **Total:** 3,600  
* **Goal:** Mobile drawer for food spots displaying category, signature dishes, price range, and late-night status.  
* **File:** `/src/components/cards/FoodCard.tsx`  
* **Content:** Price indicator (`₹` to `₹₹₹`), must-try items list, late-night hours, and connected nearby pandals.  
* **Acceptance Criteria:** Distinct visuals differentiating sit-down restaurants from midnight dhabas and street vendors.

#### `[T-18B]` Contextual Cross-Recommendation Bridge

* **Priority:** P1 | **Model:** Claude 3.5 Sonnet | **In:** 1,200 | **Out:** 1,800 | **Total:** 3,000  
* **Goal:** When inspecting a pandal, showcase the 3 closest food joints; when inspecting food, show nearest pandals.  
* **File:** `/src/components/cards/NearbyLinks.tsx`  
* **Acceptance Criteria:** Tapping a linked item pans the map view directly to that location.

#### `[T-19]` Outbound Google Maps Navigation Deep-Link Engine

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,000 | **Out:** 1,200 | **Total:** 2,200  
* **Goal:** Generate verified external navigation links and trigger analytics tracking.  
* **File:** `/src/lib/navigation.ts`  
* **URL Standards:**  
  * Driving/Bike: `https://www.google.com/maps/dir/?api=1&destination={LAT},{LNG}&travelmode=driving`  
  * Transit/Metro: `https://www.google.com/maps/dir/?api=1&destination={LAT},{LNG}&travelmode=transit`  
  * Walking: `https://www.google.com/maps/dir/?api=1&destination={LAT},{LNG}&travelmode=walking`  
* **Acceptance Criteria:** Opens directly in the native Google Maps app on iOS/Android; logs a `POST /api/navigate` ping on click.

---

### Phase 5: Search, Filters & Trending

#### `[T-20]` Unified Fuzzy Search System

* **Priority:** P1 | **Model:** Claude 3.5 Sonnet | **In:** 1,400 | **Out:** 2,000 | **Total:** 3,400  
* **Goal:** Real-time search by pandal name, locality, food dish (e.g., "mutton", "phuchka"), or metro station.  
* **File:** `/src/components/search/SearchBar.tsx`  
* **Acceptance Criteria:** Debounced search with dropdown results grouped into Pandals, Food, and Metro lines.

#### `[T-21]` Multi-Zone & Layer Filter Bar

* **Priority:** P1 | **Model:** Claude 3.5 Sonnet | **In:** 1,500 | **Out:** 2,200 | **Total:** 3,700  
* **Goal:** Horizontal pill buttons for single/multi-zone filtering (`All`, `North`, `South`, `Central`, `East`, `West`) and layer toggles (`Pandals`, `Food`, `Metro`).  
* **File:** `/src/components/filters/FilterPills.tsx`  
* **Acceptance Criteria:** Tapping a zone animates the camera viewport to fit that zone's boundary polygon.

#### `[T-22]` Trending Venues Drawer

* **Priority:** P1 | **Model:** Claude 3.5 Sonnet | **In:** 1,200 | **Out:** 1,800 | **Total:** 3,000  
* **Goal:** Sidebar / bottom sheet displaying the top 10 trending spots based on real-time navigation and search metrics.  
* **File:** `/src/components/trending/TrendingDrawer.tsx`  
* **Acceptance Criteria:** Live ranking numbers with quick-navigate buttons.

#### `[T-23]` Zustand Central Map State Store

* **Priority:** P0 | **Model:** Claude 3.5 Sonnet | **In:** 1,200 | **Out:** 1,800 | **Total:** 3,000  
* **Goal:** Central reactive store coordinating active filters, selected items, drawer visibility, and map viewport state.  
* **File:** `/src/store/useMapStore.ts`  
* **Acceptance Criteria:** Decouples UI components from map canvas implementations; avoids unnecessary re-renders.

#### `[T-24]` Privacy-First Event Telemetry

* **Priority:** P1 | **Model:** DeepSeek V3 | **In:** 1,000 | **Out:** 1,200 | **Total:** 2,200  
* **Goal:** Lightweight event logger recording search terms, zone clicks, and navigation selections without collecting PII.  
* **File:** `/src/lib/telemetry.ts`  
* **Acceptance Criteria:** Batched analytics pings sent via `navigator.sendBeacon` on page unload.

---

### Phase 6: Data Sourcing & Deployment

#### `[T-25]` Reddit & Social Extraction Pipeline (Python)

* **Priority:** P1 | **Model:** Gemini Pro | **In:** 1,800 | **Out:** 2,400 | **Total:** 4,200  
* **Goal:** Python ETL script parsing public posts from `r/kolkata` to extract crowd reports, hidden gems, and late-night food joints.  
* **File:** `/scripts/reddit_curation.py`  
* **Acceptance Criteria:** Converts raw Reddit thread markdown into structured schema JSON.

#### `[T-26]` Google Places Review & Geocode Enrichment

* **Priority:** P1 | **Model:** Gemini Pro | **In:** 1,500 | **Out:** 2,200 | **Total:** 3,700  
* **Goal:** Node/Python utility using Google Places API to resolve place names to verified lat/lng coordinates and operational hours.  
* **File:** `/scripts/places_enrichment.js`  
* **Acceptance Criteria:** Includes rate-limiting safety to avoid excessive API spend.

#### `[T-27]` Crowdsourced Manual Curation Templates

* **Priority:** P2 | **Model:** Gemini Pro | **In:** 1,200 | **Out:** 1,800 | **Total:** 3,000  
* **Goal:** Standardized markdown/CSV template for team members to catalog new pandals, themes, and food spots from Instagram and Facebook.  
* **File:** `/data/templates/curation_sheet.md`  
* **Acceptance Criteria:** Explicit validation rules preventing missing coordinates or unverified sources.

#### `[T-28]` Production Deployment Configuration (Netlify / Fastify)

* **Priority:** P0 | **Model:** DeepSeek V3 | **In:** 1,000 | **Out:** 1,200 | **Total:** 2,200  
* **Goal:** Production configuration for static Astro assets and Netlify Edge Functions for backend API routes.  
* **File:** `netlify.toml`  
* **Acceptance Criteria:** Successful build verification; zero cold-start timeouts on static map assets.

#### `[T-29]` Contributor Guide & Project Documentation

* **Priority:** P2 | **Model:** DeepSeek V3 | **In:** 1,200 | **Out:** 1,600 | **Total:** 2,800  
* **Goal:** Clear project overview covering setup, directory structure, data contribution flows, and deployment steps.  
* **File:** `README.md`  
* **Acceptance Criteria:** Comprehensive step-by-step developer setup commands.

---

## 4\. Standard AI Prompt Template for Single-Task Execution

Whenever feeding a task into your model of choice, use this exact prompt structure:

You are an expert full-stack engineer executing a single modular task from the Pujo Pathfinder PRD v2.0.

TASK IDENTIFIER: \[INSERT TASK ID, e.g., T-14B\]

RECOMMENDED MODEL CLASS: \[Claude 3.5 Sonnet / DeepSeek V3 / Gemini Pro\]

TOKEN BUDGET ENVELOPE: Maximum 2,500 Output Tokens

SPECIFICATION:

\[COPY-PASTE EXACT SUB-SECTION FROM THE MASTER PLAN\]

EXECUTION MANDATES:

1\. Output ONLY the specified code files with full implementations. No placeholders, no TODOs.

2\. Adhere strictly to TypeScript strict mode, Zod schemas, and Tailwind CSS.

3\. Keep the output within the token limit. Do not include chatty introductory or concluding explanations.

4\. If you hit output limits, complete the current code block safely and state: "TASK PARTIAL \- READY FOR CONTINUE".