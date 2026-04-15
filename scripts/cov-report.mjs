import fs from 'node:fs';
const s = JSON.parse(fs.readFileSync('./coverage/tns-agents-orchestrator-fe/coverage-summary.json', 'utf8'));
const entries = Object.entries(s)
  .filter(([k]) => k !== 'total')
  .map(([k, v]) => ({
    f: k.split('src\\').pop() ?? k,
    pct: v.statements.pct,
    tot: v.statements.total,
  }))
  .sort((a, b) => a.pct - b.pct || b.tot - a.tot);
console.log('PCT   STMTS  FILE');
for (const x of entries.slice(0, 50)) {
  console.log(
    x.pct.toFixed(0).padStart(3),
    ' ',
    x.tot.toString().padStart(4),
    '  ',
    x.f,
  );
}
console.log('--- TOTAL ---');
console.log(s.total.statements.pct.toFixed(2) + '%', `(${s.total.statements.covered}/${s.total.statements.total})`);
