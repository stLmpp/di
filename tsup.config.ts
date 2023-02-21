import { copyFile } from 'node:fs/promises';

import { rimraf } from 'rimraf';
import { defineConfig, type Options } from 'tsup';

function rimrafPlugin(): NonNullable<Options['plugins']>[number] {
  return {
    name: 'rimraf',
    buildStart: async () => {
      await rimraf('dist');
    },
  };
}

function copyPackageJson(): NonNullable<Options['plugins']>[number] {
  return {
    name: 'copy-package-json',
    buildEnd: async () => {
      await copyFile('package.json', 'dist/package.json');
    },
  };
}

export default defineConfig({
  entry: ['src/index.ts'],
  bundle: true,
  dts: true,
  format: 'esm',
  platform: 'node',
  sourcemap: true,
  minify: true,
  plugins: [rimrafPlugin(), copyPackageJson()],
});
