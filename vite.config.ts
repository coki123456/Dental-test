import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'DentalDash - Gestión Odontológica',
                short_name: 'DentalDash',
                description: 'Sistema de gestión para consultorios odontológicos con soporte offline.',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'logo.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'logo.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'supabase-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 50,
                            },
                        },
                    },
                ],
            },
        }),
    ],

    server: {
        port: 3000,
        open: true,
    },

    esbuild: {
        loader: 'tsx',
        include: /src\/.*\.[tj]sx?$/,
        exclude: [],
    },

    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'tsx',
            },
        },
    },

    build: {
        // Raise the warning threshold — our vendor chunks are intentionally large
        chunkSizeWarningLimit: 600,

        rollupOptions: {
            output: {
                /**
                 * Manual Chunk Splitting Strategy
                 *
                 * Goal: separate heavy dependencies into their own chunks so
                 * that a code-only change doesn't bust the vendor cache.
                 *
                 * Browsers can load multiple smaller files in parallel (HTTP/2),
                 * meaning this is always faster than one giant bundle.
                 */
                manualChunks(id: string) {
                    // ── React core ──────────────────────────────────────────
                    if (id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router-dom/') ||
                        id.includes('node_modules/scheduler/')) {
                        return 'vendor-react';
                    }

                    // ── Supabase SDK ────────────────────────────────────────
                    if (id.includes('node_modules/@supabase/')) {
                        return 'vendor-supabase';
                    }

                    // ── Ant Design UI ───────────────────────────────────────
                    if (id.includes('node_modules/antd/') ||
                        id.includes('node_modules/@ant-design/') ||
                        id.includes('node_modules/rc-')) {
                        return 'vendor-antd';
                    }

                    // ── Lucide icons ────────────────────────────────────────
                    if (id.includes('node_modules/lucide-react/')) {
                        return 'vendor-icons';
                    }

                    // ── TanStack Query ──────────────────────────────────────
                    if (id.includes('node_modules/@tanstack/')) {
                        return 'vendor-query';
                    }

                    // ── Form / Validation ───────────────────────────────────
                    if (id.includes('node_modules/react-hook-form/') ||
                        id.includes('node_modules/@hookform/') ||
                        id.includes('node_modules/zod/')) {
                        return 'vendor-forms';
                    }

                    // ── i18n / Misc utilities ───────────────────────────────
                    if (id.includes('node_modules/i18next') ||
                        id.includes('node_modules/react-i18next')) {
                        return 'vendor-i18n';
                    }

                    // Everything else in node_modules → generic vendor chunk
                    if (id.includes('node_modules/')) {
                        return 'vendor-misc';
                    }
                },
            },
        },
    },
});
