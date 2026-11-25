import * as esbuild from 'esbuild';

/** In the CommonJS build the React component requires the CommonJS loader. */
const loaderExtension = (extension) => ({
  name: 'external-loader',
  setup(build) {
    build.onResolve({ filter: /^\.\.\/loader\.js$/ }, () => ({
      path: `../loader${extension}`,
      external: true,
    }));
  },
});

const common = {
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  keepNames: false,
  treeShaking: true,
  minifySyntax: true,
};

await Promise.all([
  // The React component is bundled with its hooks (`@js-toolkit/react-hooks` is a dev dependency),
  // while `react` and the loader stay external imports.
  ...[
    ['esm', '.js'],
    ['cjs', '.cjs'],
  ].map(([format, extension]) =>
    esbuild.build({
      ...common,
      entryPoints: ['src/react/KinescopePlayer.tsx'],
      bundle: true,
      format,
      minifyIdentifiers: true,
      external: ['react'],
      plugins: [loaderExtension(extension)],
      outfile: `dist/react/KinescopePlayer${extension}`,
    })
  ),
  // The ESM loader is emitted by tsc.
  esbuild.build({
    ...common,
    entryPoints: ['src/loader.ts'],
    format: 'cjs',
    outfile: 'dist/loader.cjs',
  }),
]);
