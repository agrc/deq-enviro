import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
});
