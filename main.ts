// gta6-trophy-guide-01 entrypoint (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html, style.css,
// app.js and data/trophies.json. It runs offline in a browser with no build
// step and fetches nothing but its own data file. This program hands the entry
// in: it copies app/ and screenshots/ from beside this file into /output (or
// $MAKEFUN_OUTPUT_DIR outside the grader) and writes /output/dossier.json
// with buildDossier from the vendored make.fun library. Leave
// vendor/makefun-frontend.ts untouched: the scorer rebuilds the dossier with
// its own copy and requires the two to match byte for byte.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
}

// Caps mirror the gate: at most 4 screenshots of at most 256 KiB each, app/
// at most 993 files and directories and 48 MiB in all, dossier text at most
// 160 KiB. buildDossier refuses anything over those limits.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
