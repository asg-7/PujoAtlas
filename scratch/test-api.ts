const BASE = 'http://localhost:4000';

async function test(label: string, url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    console.log(`✅ ${label}: ${res.status}`, JSON.stringify(json).slice(0, 200));
  } catch (e) {
    console.error(`❌ ${label}: ${(e as Error).message}`);
    process.exit(1);
  }
}

async function main() {
  // T-08: Health
  await test('GET /health', `${BASE}/health`);

  // T-09: Pandals
  await test('GET /api/pandals', `${BASE}/api/pandals`);
  await test('GET /api/pandals?zone=NORTH', `${BASE}/api/pandals?zone=NORTH`);
  await test('GET /api/pandals?bestDay=Ashtami&isFamous=true', `${BASE}/api/pandals?bestDay=Ashtami&isFamous=true`);
  await test('GET /api/pandals?q=Bagbazar', `${BASE}/api/pandals?q=Bagbazar`);

  // T-10: Food
  await test('GET /api/food', `${BASE}/api/food`);
  await test('GET /api/food?zone=SOUTH&isMidnightOpen=true', `${BASE}/api/food?zone=SOUTH&isMidnightOpen=true`);
  await test('GET /api/food?category=STREET_FOOD', `${BASE}/api/food?category=STREET_FOOD`);

  // T-11: Nearby
  await test('GET /api/nearby (Esplanade area)', `${BASE}/api/nearby?lat=22.5647&lng=88.3518&r=2000`);
  await test('GET /api/nearby (food only)', `${BASE}/api/nearby?lat=22.57&lng=88.36&r=1500&type=food`);

  // T-12: Navigate + Trending
  await test('POST /api/navigate/click', `${BASE}/api/navigate/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entityId: 'pandal-north-01' }),
  });

  await test('POST /api/search/click', `${BASE}/api/search/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clickedId: 'pandal-north-01',
      viewedIds: ['pandal-north-01', 'pandal-north-02', 'pandal-north-03'],
    }),
  });

  await test('GET /api/trending', `${BASE}/api/trending?limit=5`);

  console.log('\n🎉 All Phase 2 API tests passed!');
}

main();
