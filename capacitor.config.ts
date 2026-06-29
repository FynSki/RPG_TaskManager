import type { CapacitorConfig } from '@capacitor/cli';

// Wykryj wersjê na podstawie zmiennej œrodowiskowej
// Przy budowaniu Pro: CAPACITOR_PLATFORM=pro npx cap sync
const isPro = process.env.CAPACITOR_IS_PRO === 'true';

const config: CapacitorConfig = {
    appId: isPro ? 'com.codefusion.rpgplanner.pro' : 'com.codefusion.rpgplanner',
    appName: isPro ? 'RPG Planner Pro' : 'RPG Planner',
    webDir: 'dist',
    plugins: {
        AdMob: {
            appId: {
                // Free u¿ywa prawdziwego AdMob ID
                // Pro nie potrzebuje AdMob — ale musi byæ jakieœ ID (u¿ywamy testowego)
                android: isPro
                    ? 'ca-app-pub-3940256099942544~3347511713'  // testowe dla Pro (bez reklam)
                    : 'ca-app-pub-9955432050014944~3338512766', // prawdziwe dla Free
                ios: 'ca-app-pub-3940256099942544~1458002511',
            },
        },
        LocalNotifications: {
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#6366F1',
        },
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#FAF7F2',
            androidSplashResourceName: 'splash',
            showSpinner: false,
        },
    },
    android: {
        allowMixedContent: true,
        backgroundColor: '#0F172A',
    },
    ios: {
        contentInset: 'automatic',
        backgroundColor: '#0F172A',
    },
};

export default config;