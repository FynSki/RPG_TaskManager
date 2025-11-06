import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon-*.png', 'og-image.png'],
            manifest: {
                name: 'RPG Planner - Gamified Task Manager',
                short_name: 'RPG Planner',
                description: 'Turn your daily tasks into RPG quests. Level up your character, earn XP, and complete missions.',
                theme_color: '#FF6B4A',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'portrait-primary',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/favicon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/favicon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                categories: ['productivity', 'lifestyle', 'utilities'],
                shortcuts: [
                    {
                        name: 'Add Task',
                        short_name: 'Add Task',
                        description: 'Quickly add a new task',
                        url: '/?action=add-task',
                        icons: [{ src: '/favicon-192x192.png', sizes: '192x192' }]
                    },
                    {
                        name: 'View Character',
                        short_name: 'Character',
                        description: 'Check your character progress',
                        url: '/?view=character',
                        icons: [{ src: '/favicon-192x192.png', sizes: '192x192' }]
                    }
                ]
            },
            workbox: {
                // Cache strategies
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    }
                ],
                // Precache all static assets
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // Don't precache large files
                maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
})
