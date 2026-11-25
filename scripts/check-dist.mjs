// Smoke test of the built package in Node: both `import` and `require` of every entry point.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const esm = await import('../dist/index.js');
const cjs = require('../dist/index.cjs');
assert.equal(typeof esm.load, 'function');
assert.equal(typeof cjs.load, 'function');

const esmReact = await import('../dist/react/KinescopePlayer.js');
// esbuild's CommonJS output is `module.exports = {default, __esModule}`, which attw reports as
// `false-export-default` (ignored in `check:package`): the component is `require(...).default`,
// as `export default` in the declarations says.
const cjsReact = require('../dist/react/KinescopePlayer.cjs');
assert.equal(typeof esmReact.default, 'function');
assert.equal(typeof cjsReact.default, 'function');

await import('../dist/types/index.js');
require('../dist/types/index.cjs');

console.log('dist: import and require work');
