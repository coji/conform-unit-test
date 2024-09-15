import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

declare module '@remix-run/server-runtime' {
  interface Future {
    unstable_singleFetch: true;
  }
}
export default defineConfig({
  plugins: [
    process.env.VITEST
      ? react()
      : remix({
          future: {
            v3_fetcherPersist: true,
            v3_relativeSplatPath: true,
            v3_throwAbortReason: true,
            unstable_lazyRouteDiscovery: true,
            unstable_optimizeDeps: true,
            unstable_singleFetch: true,
          },
        }),
    tsconfigPaths(),
  ],
  test: { environment: 'jsdom', setupFiles: ['./test/setup.ts'] },
});
