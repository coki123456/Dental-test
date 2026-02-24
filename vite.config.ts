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
                    // ── Core UI (React + Ant Design) ────────────────────────
                    // Grouping these avoids "Cannot read properties of undefined (reading 'createContext')"
                    if (id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router-dom/') ||
                        id.includes('node_modules/antd/') ||
                        id.includes('node_modules/@ant-design/') ||
                        id.includes('node_modules/rc-') ||
                        id.includes('node_modules/scheduler/')) {
                        return 'vendor-core';
                    }

                    // ── Data & Auth (Supabase + TanStack) ───────────────────
                    if (id.includes('node_modules/@supabase/') ||
                        id.includes('node_modules/@tanstack/')) {
                        return 'vendor-data';
                    }

                    // ── Icons (Lucide) ──────────────────────────────────────
                    if (id.includes('node_modules/lucide-react/')) {
                        return 'vendor-icons';
                    }

                    // ── Forms (Hook Form + Zod) ─────────────────────────────
                    if (id.includes('node_modules/react-hook-form/') ||
                        id.includes('node_modules/@hookform/') ||
                        id.includes('node_modules/zod/')) {
                        return 'vendor-forms';
                    }

                    // ── Everything else ─────────────────────────────────────
                    if (id.includes('node_modules/')) {
                        return 'vendor-utils';
                    }
                },
            },
        },
    },
});
