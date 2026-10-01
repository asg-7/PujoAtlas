const fs = require('fs');
const path = require('path');

// Helper to calculate dummy coordinates in specific zones based on their bounds
function getRandomCoords(zone) {
  const bounds = {
    NORTH: { lat: [22.585, 22.65], lng: [88.35, 88.395] },
    SOUTH: { lat: [22.44, 22.548], lng: [88.332, 88.395] },
    CENTRAL: { lat: [22.548, 22.585], lng: [88.34, 88.395] },
    EAST: { lat: [22.44, 22.65], lng: [88.395, 88.48] },
    WEST: { lat: [22.44, 22.548], lng: [88.25, 88.332] },
  };
  const b = bounds[zone];
  const lat = b.lat[0] + Math.random() * (b.lat[1] - b.lat[0]);
  const lng = b.lng[0] + Math.random() * (b.lng[1] - b.lng[0]);
  return { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) };
}

// Map from the file's section titles to exact Zone enums
const zoneMapping = {
  '## 1. North Kolkata': 'NORTH',
  '## 2. South Kolkata': 'SOUTH',
  '## 3. Central Kolkata': 'CENTRAL',
  '## 4. East Kolkata': 'EAST',
  '## 5. West Kolkata & Riverfront': 'WEST'
};

const rawText = fs.readFileSync(path.join(__dirname, 'food-dedup.txt'), 'utf8');
const lines = rawText.split('\n').filter(l => l.trim().length > 0);

const foodData = [];
let currentZone = null;
let currentCategory = 'RESTAURANT'; // default fallback
let count = 0;

for (let line of lines) {
  line = line.trim();
  
  // Check if it's a zone header
  const matchedZone = Object.keys(zoneMapping).find(k => line.startsWith(k));
  if (matchedZone) {
    currentZone = zoneMapping[matchedZone];
    continue;
  }

  // Check if it's a category header
  if (line.includes('Pubs & Restro-Bars')) currentCategory = 'CAFE'; // Mapping bars to cafe as per enum limits
  else if (line.includes('Cafes & Hangout')) currentCategory = 'CAFE';
  else if (line.includes('Restaurants')) currentCategory = 'RESTAURANT';
  else if (line.includes('Heritage Cabins')) currentCategory = 'RESTAURANT';
  else if (line.includes('Dhabas')) currentCategory = 'DHABA';
  else if (line.includes('Street Food') || line.includes('Small Restaurants')) currentCategory = 'STREET_FOOD';
  else if (line.includes('Sweet Shops')) currentCategory = 'SWEETS';

  // Format: "1. **The Grid (Rajarhat/Kankurgachi feeder)** — Craft beers, gastropub grub. *Pujo Hours: 12:00 PM – 2:00 AM*"
  const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s+—\s+(.*?)\.\s+\*Pujo Hours:\s*(.+?)\*/);
  
  if (match && currentZone) {
    let nameWithLoc = match[1].trim();
    let desc = match[2].trim();
    let hours = match[3].trim();
    
    let name = nameWithLoc;
    let address = `${currentZone} Kolkata`; // Fallback
    
    // Extract address if inside parens e.g. "The Grid (Rajarhat)"
    if (nameWithLoc.includes('(')) {
        const m = nameWithLoc.match(/(.+?)\s*\((.+?)\)/);
        if (m) {
            name = m[1].trim();
            address = m[2].trim();
        }
    }
    
    const { lat, lng } = getRandomCoords(currentZone);
    const idNum = String(count + 1).padStart(3, '0');
    
    // Attempt to split famous dishes
    const famousDishes = desc.split(',').map(d => d.trim());
    
    foodData.push({
      id: `food-${currentZone.toLowerCase()}-${idNum}`,
      name: name,
      category: currentCategory,
      priceRange: 'MID_RANGE',
      zone: currentZone,
      address: address,
      lat,
      lng,
      nearestMetroStationId: 'station-esplanade', // Dummy fallback
      famousFor: famousDishes.slice(0, 2),
      mustTryDishes: famousDishes,
      openHours: hours,
      isLateNight: hours.includes('AM') || hours.toLowerCase().includes('24 hours'),
      associatedPandals: [],
      sourceUrls: []
    });
    count++;
  }
}

fs.writeFileSync(path.join(__dirname, '../src/data/food.json'), JSON.stringify(foodData, null, 2));
console.log(`Processed ${foodData.length} deduplicated food items and saved to food.json`);
