import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
    // £aduj zmienne œrodowiskowe dla danego trybu (free/pro)
    const env = loadEnv(mode, process.cwd(), '')
    const isPro = env.VITE_IS_PREMIUM === 'true'
    const appName = isPro ? 'RPG Planner Pro' : 'RPG Planner'

    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon-*.png', 'og-image.png'],
                manifest: {
                    name: `${appName} - Gamified Task Manager`,
                    short_name: appName,
                    description: 'Turn your daily tasks into RPG quests. Level up your character, earn XP, and complete missions.',
                    theme_color: isPro ? '#7C3AED' : '#FF6B4A', // Pro ma fioletowy kolor
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
                },
                workbox: {
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365
                                },
                                cacheableResponse: { statuses: [0, 200] }
                            }
                        },
                        {
                            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'gstatic-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365
                                },
                                cacheableResponse: { statuses: [0, 200] }
                            }
                        },
                        {
                            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'image-cache',
                                expiration: {
                                    maxEntries: 60,
                                    maxAgeSeconds: 60 * 60 * 24 * 30
                                }
                            }
                        }
                    ],
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
                },
                devOptions: {
                    enabled: true,
                    type: 'module'
                }
            })
        ],
        // Udostêpnij zmienne œrodowiskowe w kodzie
        define: {
            __IS_PREMIUM__: isPro,
            __APP_NAME__: JSON.stringify(appName),
        }
    }
})