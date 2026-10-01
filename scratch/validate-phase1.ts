import fs from 'fs';
import { PandalSchema, FoodSchema } from '../src/lib/schemas.js';

const files = [
  { path: 'src/data/pandals-north.json', schema: PandalSchema, expected: 20, label: 'North Pandals' },
  { path: 'src/data/pandals-south.json', schema: PandalSchema, expected: 20, label: 'South Pandals' },
  { path: 'src/data/pandals-central.json', schema: PandalSchema, expected: 15, label: 'Central Pandals' },
  { path: 'src/data/pandals-east.json', schema: PandalSchema, expected: 10, label: 'East Pandals' },
  { path: 'src/data/pandals-west.json', schema: PandalSchema, expected: 10, label: 'West Pandals' },
  { path: 'src/data/food.json', schema: FoodSchema, expected: 35, label: 'Food Hubs' },
];

let allPassed = true;

for (const { path, schema, expected, label } of files) {
  const raw = fs.readFileSync(path, 'utf-8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    console.error(`FAIL [${label}]: Not an array`);
    allPassed = false;
    continue;
  }

  if (data.length !== expected) {
    console.error(`FAIL [${label}]: Expected ${expected} entries, got ${data.length}`);
    allPassed = false;
    continue;
  }

  let fileErrors = 0;
  for (let i = 0; i < data.length; i++) {
    const result = schema.safeParse(data[i]);
    if (!result.success) {
      console.error(`FAIL [${label}] entry ${i} (${data[i]?.id || 'unknown'}):`);
      for (const issue of result.error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      }
      fileErrors++;
    }
  }

  if (fileErrors === 0) {
    console.log(`PASS [${label}]: ${data.length}/${expected} entries validated`);
  } else {
    console.error(`FAIL [${label}]: ${fileErrors}/${data.length} entries failed validation`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\nOverall: SOME VALIDATIONS FAILED');
  process.exit(1);
} else {
  console.log('\nOverall: ALL VALIDATIONS PASSED');
}
