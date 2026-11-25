// Turns `dist` into the published package: the package root is `dist`, so deep paths like
// `@kinescope/player-iframe-api-loader/types` resolve the same way with and without `exports`.
//
// Adds the CommonJS entry points next to the ESM ones: `*.cjs` and `*.d.cts`. Both kinds of
// declarations reference one global script, `types/global.d.ts`, so the `Kinescope` namespace
// is declared once even if a program gets both.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const { scripts, devDependencies, packageManager, ...published } = pkg;

writeFileSync(
  'dist/package.json',
  `${JSON.stringify(
    {
      ...published,
      files: ['*.js', '*.cjs', '*.d.ts', '*.d.cts', 'types', 'react', 'CHANGELOG.md'],
    },
    null,
    2
  )}\n`
);

mkdirSync('dist/types', { recursive: true });
copyFileSync('src/types/global.d.ts', 'dist/types/global.d.ts');

// `import '@kinescope/player-iframe-api-loader/types'` loads the global types and must resolve
// at runtime too. `Kinescope` stays exported for `import type { Kinescope } from '.../types'`.
const typesEntry = `/// <reference path="./global.d.ts" />
import KinescopeNamespace = Kinescope;
export { KinescopeNamespace as Kinescope };
`;
writeFileSync('dist/types/index.d.ts', typesEntry);
writeFileSync('dist/types/index.d.cts', typesEntry);
writeFileSync('dist/types/index.js', 'export {};\n');
writeFileSync('dist/types/index.cjs', "'use strict';\n");

// Kept for deep imports of `types/PlayerEvents` from versions before 0.10.
const playerEvents = `/// <reference path="./global.d.ts" />
export type PlayerEvents = Kinescope.IframePlayer.Player.Events;
`;
writeFileSync('dist/types/PlayerEvents.d.ts', playerEvents);
writeFileSync('dist/types/PlayerEvents.d.cts', playerEvents);

writeFileSync('dist/index.cjs', "'use strict';\n\nmodule.exports = require('./loader.cjs');\n");

// tsc writes the reference to the global types relative to `src`; point it to `dist/types`.
// CommonJS declarations are the same as ESM ones with relative imports pointing to `.cjs`.
for (const [file, typesDir] of [
  ['index', './types'],
  ['loader', './types'],
  ['react/KinescopePlayer', '../types'],
]) {
  const declarations = readFileSync(`dist/${file}.d.ts`, 'utf8').replace(
    /(\/\/\/ <reference path=")[^"]*\/types\/global\.d\.ts"/,
    `$1${typesDir}/global.d.ts"`
  );
  writeFileSync(`dist/${file}.d.ts`, declarations);
  writeFileSync(
    `dist/${file}.d.cts`,
    declarations.replace(/(from\s+'\.{1,2}\/[^']+)\.js'/g, "$1.cjs'")
  );
}

for (const file of ['README.md', 'LICENSE', 'CHANGELOG.md']) {
  copyFileSync(file, `dist/${file}`);
}
