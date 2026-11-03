// Brand check: run with `pnpm check:brand` (no dependencies needed).
// The app is LMS Academy, a learning management system. This check fails if
// text from the old templates comes back: the driving school (Auto-Ecole),
// the cybersecurity landing page (No Breach) or the web-hosting sign-in text.
// It also fails on dollar prices: the app shows prices in TND (lib/format.ts).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceDirs = ['app', 'components', 'lib', 'services'];
const codeFile = /\.(tsx|ts|jsx|js|css)$/;

const banned = [
  { pattern: /auto-?[e\u00e9]cole/i, reason: 'driving-school brand' },
  { pattern: /\bdriving\b/i, reason: 'driving-school content' },
  { pattern: /\bpermis\b/i, reason: 'driving licence (French)' },
  { pattern: /r\u00e9cup\u00e9ration de points|points sur votre/i, reason: 'driving-school offer (French)' },
  { pattern: /theory (test|score|practice|quiz)/i, reason: 'driving theory test' },
  { pattern: /traffic (light|sign)|rules of the road/i, reason: 'driving theory content' },
  { pattern: /licen[cs]e ?number/i, reason: 'driving licence field' },
  { pattern: /no breach/i, reason: 'old cybersecurity landing page' },
  { pattern: /manage deployments|deploy faster/i, reason: 'old web-hosting sign-in text' },
  { pattern: /grainy-gradients\.vercel\.app/, reason: 'image loaded from an outside site' },
  { pattern: /['"`>]-?\$[0-9]/, reason: 'price in dollars (show prices with formatPrice, in TND)' },
  { pattern: />-?\$\{/, reason: 'dollar sign before a price (show prices with formatPrice, in TND)' },
];

function walk(dir) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const problems = [];
const files = sourceDirs
  .flatMap((dir) => walk(join(root, dir)))
  .filter((file) => codeFile.test(file));

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const { pattern, reason } of banned) {
      const match = line.match(pattern);
      if (match) {
        problems.push(`${relative(root, file)}:${index + 1}: "${match[0]}" (${reason})`);
      }
    }
  });
}

if (problems.length > 0) {
  console.error(`Brand check failed: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`Brand check passed: ${files.length} files, no old brand text found.`);
