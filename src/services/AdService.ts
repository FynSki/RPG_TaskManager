/**
 * AdService — zarządzanie reklamami AdMob
 *
 * App ID:      ca-app-pub-9955432050014944~3338512766
 * Banner ID:   ca-app-pub-9955432050014944/4890433432
 * Rewarded ID: ca-app-pub-9955432050014944/2819049653
 *
 * IS_TESTING = true — zmień na false przed publikacją aktualizacji
 */

import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';
import type { BannerAdOptions, RewardAdOptions } from '@capacitor-community/admob';

const IS_TESTING = false;

const AD_IDS = {
    banner_test:   'ca-app-pub-3940256099942544/6300978111',
    rewarded_test: 'ca-app-pub-3940256099942544/5224354917',
    banner_prod:   'ca-app-pub-9955432050014944/4890433432',
    rewarded_prod: 'ca-app-pub-9955432050014944/2819049653',
};

const BANNER_ID   = IS_TESTING ? AD_IDS.banner_test   : AD_IDS.banner_prod;
const REWARDED_ID = IS_TESTING ? AD_IDS.rewarded_test : AD_IDS.rewarded_prod;

function isNative(): boolean {
    return (
        typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.() === true
    );
}

export async function initializeAdMob(): Promise<void> {
    if (!isNative()) return;
    try {
        await AdMob.initialize({
            testingDevices: [],
            initializeForTesting: IS_TESTING,
        });
        console.log('AdMob initialized (testing: ' + IS_TESTING + ')');
    } catch (e) {
        console.warn('AdMob initialization failed:', e);
    }
}

export async function showBanner(): Promise<void> {
    if (!isNative()) return;
    try {
        AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: any) => {
            console.error('Banner failed to load. Error: ' + JSON.stringify(error));
        });
        AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
            console.log('Banner loaded successfully!');
        });

        const options: BannerAdOptions = {
            adId: BANNER_ID,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: IS_TESTING,
        };
        await AdMob.showBanner(options);
    } catch (e) {
        console.warn('Banner ad failed:', e);
    }
}

export async function hideBanner(): Promise<void> {
    if (!isNative()) return;
    try { await AdMob.hideBanner(); } catch { }
}

export async function removeBanner(): Promise<void> {
    if (!isNative()) return;
    try { await AdMob.removeBanner(); } catch { }
}

export async function showRewardedAd(): Promise<boolean> {
    if (!isNative()) return false;
    try {
        const options: RewardAdOptions = {
            adId: REWARDED_ID,
            isTesting: IS_TESTING,
        };
        await AdMob.prepareRewardVideoAd(options);
        const result = await AdMob.showRewardVideoAd();
        return !!result;
    } catch (e) {
        console.warn('Rewarded ad failed:', e);
        return false;
    }
}