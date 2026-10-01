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
  '1. North Kolkata': 'NORTH',
  '2. South Kolkata': 'SOUTH',
  '3. Central Kolkata': 'CENTRAL',
  '4. East Kolkata': 'EAST',
  '5. West Kolkata & Riverfront': 'WEST'
};

const rawText = fs.readFileSync(path.join(__dirname, 'food-raw.txt'), 'utf8');
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
  if (line.includes('Pubs & Restro-Bars')) currentCategory = 'CAFE';
  else if (line.includes('Cafes & Hangout')) currentCategory = 'CAFE';
  else if (line.includes('Restaurants')) currentCategory = 'RESTAURANT';
  else if (line.includes('Dhabas')) currentCategory = 'DHABA';
  else if (line.includes('Street Food')) currentCategory = 'STREET_FOOD';
  else if (line.includes('Sweet Shops') || line.includes('Cabins')) currentCategory = 'SWEETS';

  // Attempt to parse a food item line
  // Example: "Olypub (Park St. / South fringe) — Old Calcutta beef/chicken steak, cheap pitchers. Pujo Hours: 11:00 AM – 1:30 AM"
  const match = line.match(/^(.+?)\s*\((.+?)\)\s*—\s*(.+?)\.\s*Pujo Hours:\s*(.+)$/);
  if (match && currentZone) {
    const [, name, address, dishesRaw, hoursRaw] = match;
    const isMidnight = hoursRaw.includes('AM') && !hoursRaw.includes('11:00 AM – 1:30 AM') /* heuristic */;
    // Note: just checking if 'AM' appears for the end time, real logic would parse it. We'll just mark random late spots.
    
    const { lat, lng } = getRandomCoords(currentZone);
    const idNum = String(count + 1).padStart(3, '0');
    
    foodData.push({
      id: `food-${currentZone.toLowerCase()}-${idNum}`,
      name: name.trim(),
      category: currentCategory,
      priceRange: 'MID_RANGE', // Default, would need manual tweaking
      zone: currentZone,
      address: address.trim(),
      lat,
      lng,
      nearestMetroStationId: 'station-esplanade', // Dummy fallback
      famousFor: dishesRaw.split(',').map(d => d.trim()).slice(0, 2),
      mustTryDishes: dishesRaw.split(',').map(d => d.trim()),
      openHours: hoursRaw.trim(),
      isLateNight: hoursRaw.includes('AM') || hoursRaw.includes('24 Hours'),
      associatedPandals: [],
      sourceUrls: []
    });
    count++;
  } else if (line.includes(' — ') && currentZone) {
     // Handle lines missing parentheses for address
     const splitDash = line.split(' — ');
     if(splitDash.length >= 2) {
       let namePart = splitDash[0];
       let rest = splitDash[1];
       
       let name = namePart;
       let address = `${currentZone} Kolkata`; // Fallback
       if(namePart.includes('(')) {
          const m = namePart.match(/(.+?)\((.+?)\)/);
          if (m) {
            name = m[1].trim();
            address = m[2].trim();
          }
       }

       let dishes = rest;
       let hours = '10:00 AM - 10:00 PM';
       if(rest.includes('Pujo Hours:')) {
          const parts = rest.split('Pujo Hours:');
          dishes = parts[0].replace('.', '').trim();
          hours = parts[1].trim();
       }

       const { lat, lng } = getRandomCoords(currentZone);
       const idNum = String(count + 1).padStart(3, '0');
       foodData.push({
          id: `food-${currentZone.toLowerCase()}-${idNum}`,
          name: name.trim(),
          category: currentCategory,
          priceRange: 'MID_RANGE', 
          zone: currentZone,
          address: address.trim(),
          lat,
          lng,
          nearestMetroStationId: 'station-esplanade',
          famousFor: dishes.split(',').map(d => d.trim()).slice(0, 2),
          mustTryDishes: dishes.split(',').map(d => d.trim()),
          openHours: hours.trim(),
          isLateNight: hours.includes('AM') || hours.includes('24 Hours'),
          associatedPandals: [],
          sourceUrls: []
        });
        count++;
     }
  }
}

fs.writeFileSync(path.join(__dirname, '../src/data/food.json'), JSON.stringify(foodData, null, 2));
console.log(`Processed ${foodData.length} food items and saved to food.json`);
