import fs from 'node:fs';
const pandals = JSON.parse(fs.readFileSync('src/data/pandals-all.json', 'utf8'));
const tok = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);

for (const q of process.argv.slice(2)) {
  const qt = tok(q);
  const top = pandals
    .map((p) => {
      const pt = new Set(tok(p.name + ' ' + (p.address || '') + ' ' + (p.tags?.join(' ') || '')));
      return { p, score: qt.filter((t) => pt.has(t)).length / qt.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  console.log(`\n"${q}"`);
  top.forEach(({ p, score }) =>
    console.log(`  ${score.toFixed(2)}  ${p.id}  | ${p.name} | ${p.zone} | coords:${p.lat ? 'yes' : 'NO'}`)
  );
}
