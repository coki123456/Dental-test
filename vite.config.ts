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
                    // 1. Ecosistema de UI (Ant Design y sub-componentes)
                    if (id.includes('node_modules/antd/') ||
                        id.includes('node_modules/@ant-design/') ||
                        id.includes('node_modules/rc-')) {
                        return 'vendor-antd';
                    }

                    // 2. Base de Datos (Supabase)
                    if (id.includes('node_modules/@supabase/')) {
                        return 'vendor-supabase';
                    }

                    // 3. Iconos pesados
                    if (id.includes('node_modules/lucide-react/')) {
                        return 'vendor-icons';
                    }

                    // ¡OJO! Eliminamos el "vendor-utils" y "vendor-core" estrictos.
                    // Vite ahora armará el árbol de React automáticamente de forma segura.
                },
            },
        },
    },
});