import * as esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

await esbuild.build({
  entryPoints: ['src/react/KinescopePlayer.tsx'],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: ['esnext'],
  keepNames: false,
  treeShaking: true,
  minifySyntax: true,
  minifyIdentifiers: true,
  external: ['react', '../loader'],
  outdir: 'dist/react',
  plugins: [
    esbuildPluginTsc({
      force: true,
      forceEsm: true,
      tsx: true,
      tsconfigPath: 'tsconfig.json',
    }),
  ],
});
