// Run: node check.mjs
// Checks every game folder against the gallery rules and says, in plain words, what to fix.
// The build runs the same checks, so a pull request that fails here fails its preview too.

import { loadGames } from './lib.mjs';

const { games, problems } = loadGames();
if (problems.length) {
  console.log(`\nNot ready yet. ${problems.length} thing(s) to fix:\n`);
  for (const p of problems) console.log(`  [${p.game}] ${p.message}`);
  console.log('\nFix these, save, and run the check again.\n');
  process.exit(1);
}
console.log(`\nAll good: ${games.length} game(s) passed every check.\n`);
for (const g of games) console.log(`  ${g.slug} (${g.kind})`);
console.log('');
