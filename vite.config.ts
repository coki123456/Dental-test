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
                name: 'Dental Dash - Gestión Odontológica',
                short_name: 'Dental Dash',
                description: 'Sistema de gestión para consultorios odontológicos.',
                theme_color: '#ffffff',
                icons: [
                    { src: 'logo.png', sizes: '192x192', type: 'image/png' },
                    { src: 'logo.png', sizes: '512x512', type: 'image/png' }
                ]
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'supabase-api-cache',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
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
    build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id: string) {
                    // 1. Ecosistema de UI (Ant Design + React)
                    // Grouping these is CRITICAL to avoid "createContext of undefined"
                    if (id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router-dom/') ||
                        id.includes('node_modules/antd/') ||
                        id.includes('node_modules/@ant-design/') ||
                        id.includes('node_modules/rc-') ||
                        id.includes('node_modules/scheduler/')) {
                        return 'vendor-core';
                    }

                    // 2. Base de Datos & Auth (Supabase + TanStack)
                    if (id.includes('node_modules/@supabase/') ||
                        id.includes('node_modules/@tanstack/')) {
                        return 'vendor-data';
                    }

                    // 3. Iconos
                    if (id.includes('node_modules/lucide-react/')) {
                        return 'vendor-icons';
                    }

                    // 4. Formularios (Hook Form + Zod)
                    if (id.includes('node_modules/react-hook-form/') ||
                        id.includes('node_modules/@hookform/') ||
                        id.includes('node_modules/zod/')) {
                        return 'vendor-forms';
                    }

                    // 5. Misceláneos
                    if (id.includes('node_modules/')) {
                        return 'vendor-utils';
                    }
                },
            },
        },
    },
});