import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * ============================================================================
 * T-26: Google Places Review & Geocode Enrichment
 * 
 * Purpose: Utility to resolve place names to verified lat/lng coordinates and 
 * operational hours using the Google Places API. Includes rate-limiting safety.
 * ============================================================================
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const API_BASE = 'https://maps.googleapis.com/maps/api/place';

// Safety threshold: Max API calls per run to avoid unexpected billing
const MAX_API_CALLS = 100;

// Rate limiting utility
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPlaceDetails(placeName, locality = 'Kolkata') {
  if (!GOOGLE_API_KEY) {
    throw new Error('Missing GOOGLE_PLACES_API_KEY environment variable.');
  }

  const query = encodeURIComponent(`${placeName} ${locality}`);
  
  // 1. Find Place from Text
  const searchUrl = `${API_BASE}/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,geometry,name&key=${GOOGLE_API_KEY}`;
  
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  
  if (searchData.status !== 'OK' || !searchData.candidates?.length) {
    return null;
  }
  
  const placeId = searchData.candidates[0].place_id;
  const location = searchData.candidates[0].geometry?.location;

  // 2. Get Place Details (Hours, Rating)
  const detailsUrl = `${API_BASE}/details/json?place_id=${placeId}&fields=current_opening_hours,rating,user_ratings_total&key=${GOOGLE_API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  return {
    lat: location?.lat,
    lng: location?.lng,
    rating: detailsData.result?.rating,
    totalRatings: detailsData.result?.user_ratings_total,
    openHours: detailsData.result?.current_opening_hours?.weekday_text || []
  };
}

async function runEnrichment() {
  console.log('🚀 Starting Google Places Enrichment...');

  if (!GOOGLE_API_KEY) {
    console.warn('⚠️ No GOOGLE_PLACES_API_KEY found. Running in mock/dry-run mode.');
  }

  const targetFile = path.join(__dirname, '../src/data/food.json');
  let data = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
  
  let apiCalls = 0;
  let enrichedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    
    // Skip if we already have a real-looking coordinate (not the default rough bounding box)
    // Or just run for everything if forcing an update. Here we just demonstrate the pipeline.
    if (item.lat && item.lng && item.rating) {
      continue;
    }

    if (apiCalls >= MAX_API_CALLS) {
      console.warn('🛑 Reached MAX_API_CALLS threshold. Stopping enrichment to prevent billing spikes.');
      break;
    }

    try {
      if (GOOGLE_API_KEY) {
        const enriched = await fetchPlaceDetails(item.name, item.address || item.zone);
        if (enriched) {
          data[i].lat = enriched.lat || item.lat;
          data[i].lng = enriched.lng || item.lng;
          data[i].rating = enriched.rating || item.rating;
          console.log(`✅ Enriched: ${item.name}`);
          enrichedCount++;
        }
      } else {
        // Dry run / mock behavior
        console.log(`[DRY RUN] Would enrich: ${item.name}`);
      }
      
      apiCalls++;
      
      // Strict Rate Limiting: 500ms between requests (max 2 per sec)
      await delay(500);
      
    } catch (err) {
      console.error(`❌ Error enriching ${item.name}:`, err.message);
    }
  }

  // Save back to file
  fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
  console.log(`🎉 Enrichment complete. Enriched ${enrichedCount} items. Saved to ${targetFile}.`);
}

runEnrichment().catch(console.error);
