// Cinder Duel's hand-in program (Node 22, standard library only).
//
// The game itself is the static site under game/ — plain HTML, CSS and ES
// modules a desktop browser runs offline. This program delivers it: it
// copies game/ and screenshots/ into the output directory and writes the
// dossier the judge reads, using buildDossier from the vendored make.fun
// library in vendor/makefun-game.ts (the kit's file, kept unchanged so the
// gate's rebuild matches byte for byte).
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and the output is /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });

mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoDir, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below are the gate's own: at most 4 screenshots of 256 KiB each,
// at most 993 files and 48 MiB under game/, no game path over 1000 bytes,
// and the dossier's source text capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
