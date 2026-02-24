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
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
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
        open: true
    },
    esbuild: {
        loader: 'tsx',
        include: /src\/.*\.[tj]sx?$/,
        exclude: []
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'tsx'
            }
        }
    }
});
