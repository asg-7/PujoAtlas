import { PUJA_TRAILS } from '../src/data/trails';
import pandals from '../src/data/pandals-all.json';
import food from '../src/data/food.json';

const pIds = new Set((pandals as any[]).map((p) => p.id));
const fIds = new Set((food as any[]).map((f) => f.id));
let bad = 0;

for (const t of PUJA_TRAILS) {
  t.pandalIds
    .filter((i) => !pIds.has(i))
    .forEach((i) => {
      console.error(`[Error] Trail "${t.id}": missing pandal ID "${i}"`);
      bad++;
    });

  (t.foodIds || [])
    .filter((i) => !fIds.has(i))
    .forEach((i) => {
      console.error(`[Error] Trail "${t.id}": missing food ID "${i}"`);
      bad++;
    });
}

const trailIds = new Set(PUJA_TRAILS.map((t) => t.id));
if (trailIds.size !== PUJA_TRAILS.length) {
  console.error('[Error] Duplicate trail IDs detected in PUJA_TRAILS');
  bad++;
}

if (bad === 0) {
  console.log(`✓ All ${PUJA_TRAILS.length} trails validated successfully! All pandal & food IDs exist.`);
}

process.exit(bad ? 1 : 0);
