import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const arcgisCorePath = fileURLToPath(
  new URL('./node_modules/@arcgis/core', import.meta.url),
);

// required for getting tests to run in the VSCode test explorer
const oxcOptions = {
  include: /\.(m?ts|[jt]sx?)$/,
  tsconfig: false,
};

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    tailwindcss(),
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
    dedupe: [
      '@arcgis/core',
      '@firebase/app',
      '@firebase/component',
      '@firebase/firestore',
      '@firebase/functions',
      'firebase',
    ],
    alias: [
      {
        find: /^@arcgis\/core\/(.*)$/,
        replacement: `${arcgisCorePath}/$1`,
      },
      {
        find: '@arcgis/core',
        replacement: arcgisCorePath,
      },
      {
        find: 'use-sync-external-store/shim/index.js',
        replacement: 'react',
      },
    ],
  },
  optimizeDeps: {
    include: [
      'firebase/analytics',
      'firebase/app',
      'firebase/firestore',
      'firebase/functions',
      'firebase/remote-config',
    ],
  },
  oxc: oxcOptions,
  test: {
    pool: 'vmThreads',
    environment: 'happy-dom',
  },
});
