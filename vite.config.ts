import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Babel optimisations for production
      babel: {
        plugins: mode === 'production' ? [
          ['babel-plugin-transform-react-remove-prop-types', {
            removeImport: true,
          }],
        ] : [],
      },
    }),
    tailwindcss(),
    splitVendorChunkPlugin(),

    // Bundle analyser — generates stats.html after build
    // Open dist/stats.html to see what is in your bundle
    visualizer({
      filename: 'dist/stats.html',
      open: mode === 'analyze',        // set to true to auto-open after build
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),

    // Keep existing VitePWA config here if it exists
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'icons/*.png',
        'offline.html',
      ],
      manifest: false,        // Using our own public/manifest.json
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}'
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            // Cache font files
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            // Cache CoinGecko responses for 5 minutes
            urlPattern: /^https:\/\/api\.coingecko\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'coingecko-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
        navigateFallback: null,
        skipWaiting: false,    // We handle update manually
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,         // Test PWA in development
        type: 'module',
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Raise warning threshold to 800kb (from 500kb default)
    chunkSizeWarningLimit: 800,

    // Target modern browsers — smaller output
    target: 'es2020',

    // Source maps for production debugging (optional — remove to save size)
    sourcemap: false,

    rollupOptions: {
      output: {
        // Manual chunk splitting strategy
        // Each of these creates a separate JS file loaded on demand
        manualChunks: {
          // React core — always needed, cache forever
          'vendor-react': ['react', 'react-dom'],

          // Router — needed on all pages
          'vendor-router': ['react-router'],

          // Theme provider
          'vendor-theme': ['next-themes'],

          // Charting libraries — heavy, only needed on Trade/Dashboard
          'vendor-charts': ['recharts', 'lightweight-charts'],

          // Animation library — needed on most pages but separate chunk
          'vendor-motion': ['motion'],

          // Supabase — auth + db, needed on protected pages
          'vendor-supabase': ['@supabase/supabase-js'],

          // Radix UI components — UI primitives
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-accordion',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-slider',
            '@radix-ui/react-checkbox',
          ],

          // Icons — large library, cache separately
          'vendor-icons': ['lucide-react'],

          // Toast notifications
          'vendor-toast': ['sonner'],

          // Utility libraries
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },

        // Consistent chunk file naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Optimise dependencies during dev
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'next-themes',
      '@supabase/supabase-js',
      'lucide-react',
      'recharts',
      'sonner',
      'motion',
      'clsx',
    ],
    // Exclude heavy chart library from pre-bundling
    exclude: ['lightweight-charts'],
  },

  // Preview server settings
  preview: {
    port: 4173,
    strictPort: true,
  },
}));
