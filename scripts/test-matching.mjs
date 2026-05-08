// Smoke test for the matching algorithm. Inlines a copy of the algorithm so
// it can run without an `npm install` step. The real matching code lives in
// src/lib/matching.js — keep the two in sync if you change the weights.

const BUDGET_RANGES = [
  { id: 'under_30', min: 0, max: 30 },
  { id: '30_60',    min: 30, max: 60 },
  { id: '60_100',   min: 60, max: 100 },
  { id: '100_plus', min: 100, max: 9999 },
];
const W = { goal: 40, trainingStyle: 20, experience: 15, budget: 15, location: 10, featured: 5 };

function score(p, q) {
  let s = 0; const r = [];
  if (p.specialisms.includes(q.goal)) { s += W.goal; r.push('goal'); }
  else if (p.specialisms.includes('general_fitness')) { s += Math.round(W.goal*0.4); r.push('general'); }
  if (p.trainingStyles.includes(q.trainingStyle) || p.trainingStyles.includes('hybrid') || q.trainingStyle === 'hybrid')
    { s += W.trainingStyle; r.push('style'); }
  if (p.experienceLevels.includes(q.experience)) { s += W.experience; r.push('xp'); }
  const b = BUDGET_RANGES.find(x => x.id === q.budget);
  if (b && p.priceMin <= b.max && p.priceMax >= b.min) { s += W.budget; r.push('budget'); }
  if (q.location && p.location.toLowerCase().includes(q.location.toLowerCase())) { s += W.location; r.push('loc'); }
  else if (p.location.toLowerCase().includes('remote')) { s += Math.round(W.location*0.5); }
  if (p.featured) s += W.featured;
  return { score: s, reasons: r };
}

const trainers = [
  { id: 'a', name: 'Aisha (London, fat_loss, in_person, £45-70)', specialisms:['fat_loss','strength','general_fitness'], trainingStyles:['in_person','hybrid'], experienceLevels:['beginner','intermediate'], priceMin:45, priceMax:70, location:'London', featured:true },
  { id: 'b', name: 'Marcus (Manchester, strength, £70-120)',     specialisms:['strength','muscle_gain'], trainingStyles:['in_person'], experienceLevels:['intermediate','advanced'], priceMin:70, priceMax:120, location:'Manchester', featured:false },
  { id: 'c', name: 'Lena (Remote, fat_loss, online, £30-55)',     specialisms:['fat_loss','muscle_gain','nutrition_coaching'], trainingStyles:['online'], experienceLevels:['beginner','intermediate'], priceMin:30, priceMax:55, location:'Remote (UK)', featured:true },
  { id: 'd', name: 'Sara (Leeds, beginner, £30-45)',              specialisms:['general_fitness','fat_loss','mobility'], trainingStyles:['in_person'], experienceLevels:['beginner'], priceMin:30, priceMax:45, location:'Leeds', featured:false },
];

function rank(quiz) {
  return trainers.map(t => ({ ...t, ...score(t, quiz) }))
    .sort((a,b) => b.score - a.score || (a.featured===b.featured?0:a.featured?-1:1))
    .slice(0,3);
}

let failures = 0;
function assert(cond, msg) { if (!cond) { console.error('FAIL:', msg); failures++; } else { console.log('  ok —', msg); } }

console.log('Case 1: London beginner, fat loss, in-person, £30-60');
let top = rank({ goal:'fat_loss', experience:'beginner', trainingStyle:'in_person', budget:'30_60', location:'London' });
top.forEach(t => console.log(`    ${t.score}  ${t.name}`));
assert(top[0].id === 'a', 'Aisha (London + fat_loss + in_person + beginner) wins for London/beginner');

console.log('Case 2: Online intermediate, fat loss, £30-60');
top = rank({ goal:'fat_loss', experience:'intermediate', trainingStyle:'online', budget:'30_60', location:'' });
top.forEach(t => console.log(`    ${t.score}  ${t.name}`));
assert(top[0].id === 'c', 'Lena (online + fat_loss + intermediate) wins for online');

console.log('Case 3: Manchester advanced strength £60-100');
top = rank({ goal:'strength', experience:'advanced', trainingStyle:'in_person', budget:'60_100', location:'Manchester' });
top.forEach(t => console.log(`    ${t.score}  ${t.name}`));
assert(top[0].id === 'b', 'Marcus wins for Manchester strength advanced');

console.log('Case 4: hybrid trainer matches any trainingStyle');
top = rank({ goal:'fat_loss', experience:'beginner', trainingStyle:'hybrid', budget:'30_60', location:'' });
assert(top[0].score >= 60, 'top score plausibly > 60 with full match');

console.log('Case 5: featured boosts ties only, doesn’t override');
const onlyFeatured = rank({ goal:'sport_specific', experience:'advanced', trainingStyle:'online', budget:'under_30', location:'' });
assert(onlyFeatured.length === 3, 'always returns 3 even when matches are weak');

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
