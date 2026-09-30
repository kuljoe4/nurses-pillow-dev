import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import { createPhoneAuthMiddleware } from './src/server/phoneAuthMiddleware.ts';

function phoneAuthApiPlugin(): Plugin {
  return {
    name: 'phone-auth-api-plugin',
    configureServer(server) {
      server.middlewares.use(createPhoneAuthMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createPhoneAuthMiddleware());
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const googleMapsKey =
    env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    '';

  const stripeKey =
    env.STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    '';

  return {
    plugins: [react(), tailwindcss(), phoneAuthApiPlugin()],
    envPrefix: ['GOOGLE_', 'STRIPE_', 'VITE_'],
    define: {
      'import.meta.env.GOOGLE_MAPS_API_KEY': JSON.stringify(googleMapsKey),
      'import.meta.env.STRIPE_PUBLISHABLE_KEY': JSON.stringify(stripeKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio.
      hmr: false,
      watch: null,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('framer-motion') || id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
    },
  };
});
