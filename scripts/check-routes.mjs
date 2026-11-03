// Route check: run with `pnpm check:routes` (no dependencies needed).
// 1. Every app/**/page.* file must have a default export. An empty page
//    file makes `next build` fail.
// 2. Every internal link (href, router.push, router.replace, redirect)
//    must point to a page that exists.
// 3. No source file of app, components, lib or services is empty: an empty
//    file looks like code that is not there (the first template left some).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const appDir = join(root, 'app');
const sourceDirs = ['app', 'components', 'lib', 'services'];
const codeFile = /\.(tsx|ts|jsx|js)$/;

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

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const problems = [];

// Routes from the file system: route groups like (public) do not appear in
// the URL, dynamic segments like [id] match any single segment.
const pageFiles = walk(appDir).filter((file) =>
  /(^|[\\/])page\.(tsx|ts|jsx|js)$/.test(file),
);
const routes = pageFiles.map((file) => {
  const source = readFileSync(file, 'utf8');
  if (/export\s+default\s/.test(source) === false) {
    problems.push(
      `${relative(root, file)}: page has no default export (empty pages break next build)`,
    );
  }
  const segments = relative(appDir, file)
    .split(sep)
    .slice(0, -1)
    .filter((segment) => /^\(.*\)$/.test(segment) === false)
    .map((segment) =>
      /^\[.*\]$/.test(segment) ? '[^/]+' : escapeRegExp(segment),
    );
  return new RegExp(`^/${segments.join('/')}$`);
});

const linkPatterns = [
  /href=["']([^"']+)["']/g,
  /href=\{`([^`]+)`\}/g,
  /(?:router\.push|router\.replace|redirect)\(\s*["'`]([^"'`]+)["'`]/g,
];

let linksChecked = 0;
const sourceFiles = sourceDirs
  .flatMap((dir) => walk(join(root, dir)))
  .filter((file) => codeFile.test(file));

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8');
  for (const pattern of linkPatterns) {
    for (const match of source.matchAll(pattern)) {
      const raw = match[1];
      if (raw.startsWith('/') === false) continue;
      const path = raw.replace(/\$\{[^}]*\}/g, 'x').split(/[?#]/)[0];
      const target = path.length > 1 ? path.replace(/\/$/, '') : path;
      linksChecked += 1;
      if (routes.some((route) => route.test(target)) === false) {
        problems.push(`${relative(root, file)}: link to ${raw} has no page`);
      }
    }
  }
}

for (const file of sourceFiles) {
  if (statSync(file).size === 0) {
    problems.push(`${relative(root, file)}: empty file (write its code, or remove it)`);
  }
}

if (problems.length > 0) {
  console.error(`Route check failed: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `Route check passed: ${routes.length} pages, ${linksChecked} internal links, all point to a page; no empty source file.`,
);
