import { defineConfig, type Options } from 'tsup';
import fsp from 'node:fs/promises';

function rimrafPlugin(): NonNullable<Options['plugins']>[number] {
  return {
    name: 'rimraf',
    buildStart: async () => {
      await fsp.rm('dist', { force: true, recursive: true });
    },
  };
}

function copyPackageJson(): NonNullable<Options['plugins']>[number] {
  return {
    name: 'copy-package-json',
    buildEnd: async () => {
      await fsp.copyFile('package.json', 'dist/package.json');
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
  minify: false,
  plugins: [rimrafPlugin(), copyPackageJson()],
});
