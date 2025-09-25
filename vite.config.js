import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    react(),
    {
      // copied from: https://github.com/smnhgn/vite-plugin-package-version/blob/master/src/index.ts
      name: 'vite-plugin-package-version',
      config: () => {
        const key = 'import.meta.env.PACKAGE_VERSION';
        const val = JSON.stringify(process.env.npm_package_version);

        return { define: { [key]: val } };
      },
    },
  ],
  resolve: {
    dedupe: ['@arcgis/core', 'firebase'],
  },
  test: {
    // this config resolves this error message that started happening after upgrading deps:
    // TypeError: Unknown file extension ".css" for /deq-enviro/node_modules/.pnpm/@esri+calcite-components@3.3.0_@lit+context@1.1.6/node_modules/@esri/calcite-components/dist/calcite/calcite.css
    pool: 'vmThreads',
    environment: 'happy-dom',
  },
});
