/**
 * AdService — zarządzanie reklamami AdMob
 *
 * Testowe Ad Unit ID (działają zawsze w trybie dev):
 * - Banner:   ca-app-pub-3940256099942544/6300978111
 * - Rewarded: ca-app-pub-3940256099942544/5224354917
 *
 * PRZED PUBLIKACJĄ: zamień na prawdziwe ID z AdMob Console
 */

import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import type { BannerAdOptions, RewardAdOptions } from '@capacitor-community/admob';

// ─── Konfiguracja ID ──────────────────────────────────────────────────────────

// Testowe ID — działają bez konta AdMob
const TEST_IDS = {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

// PRZED PUBLIKACJĄ: zamień TEST_IDS na swoje prawdziwe ID z AdMob Console:
// banner:   'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
// rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
const AD_IDS = TEST_IDS;

// ─── Sprawdzenie platformy ────────────────────────────────────────────────────

function isNative(): boolean {
    return (
        typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.() === true
    );
}

// ─── Inicjalizacja ────────────────────────────────────────────────────────────

export async function initializeAdMob(): Promise<void> {
    if (!isNative()) return;

    try {
        await AdMob.initialize({
            testingDevices: [],  // opcjonalnie: dodaj ID swojego urządzenia testowego
            initializeForTesting: true, // ustaw na false przed publikacją
        });
        console.log('AdMob initialized');
    } catch (e) {
        console.warn('AdMob initialization failed:', e);
    }
}

// ─── Banner ───────────────────────────────────────────────────────────────────

/**
 * Pokaż baner reklamowy na dole ekranu
 */
export async function showBanner(): Promise<void> {
    if (!isNative()) return;

    try {
        const options: BannerAdOptions = {
            adId: AD_IDS.banner,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 50,
            isTesting: true, // ustaw na false przed publikacją
        };
        await AdMob.showBanner(options);
    } catch (e) {
        console.warn('Banner ad failed:', e);
    }
}

/**
 * Ukryj baner (np. gdy otwieramy modal)
 */
export async function hideBanner(): Promise<void> {
    if (!isNative()) return;
    try {
        await AdMob.hideBanner();
    } catch {
        // ignoruj
    }
}

/**
 * Usuń baner całkowicie
 */
export async function removeBanner(): Promise<void> {
    if (!isNative()) return;
    try {
        await AdMob.removeBanner();
    } catch {
        // ignoruj
    }
}

// ─── Rewarded (za Gold) ───────────────────────────────────────────────────────

/**
 * Pokaż reklamę nagrodzoną — użytkownik dostaje Gold za obejrzenie
 * Zwraca true jeśli użytkownik obejrzał całą reklamę
 */
export async function showRewardedAd(): Promise<boolean> {
    if (!isNative()) return false;

    try {
        const options: RewardAdOptions = {
            adId: AD_IDS.rewarded,
            isTesting: true, // ustaw na false przed publikacją
            ssv: {
                userId: 'rpgplanner-user',
                customData: JSON.stringify({ reward: 'gold' }),
            },
        };

        await AdMob.prepareRewardVideoAd(options);
        const result = await AdMob.showRewardVideoAd();

        // result.reward.amount — ilość nagrody (ustawiasz w AdMob Console)
        return !!result;
    } catch (e) {
        console.warn('Rewarded ad failed:', e);
        return false;
    }
}