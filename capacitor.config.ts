import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.codefusion.rpgplanner',
    appName: 'RPG Planner',
    webDir: 'dist',
    plugins: {
        AdMob: {
            // Testowe App ID Google — zamieñ na prawdziwe przed publikacj¹
            appId: {
                android: 'ca-app-pub-3940256099942544~3347511713',
                ios: 'ca-app-pub-3940256099942544~1458002511',
            },
        },
        LocalNotifications: {
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#6366F1',
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