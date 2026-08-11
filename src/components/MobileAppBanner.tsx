/**
 * MobileAppBanner — banner informujący o aplikacji mobilnej
 * Pokazuje się tylko na mobile web (nie na native i nie na desktop)
 * Umieszczony na dole ekranu
 */

import { useState, useEffect } from 'react';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.codefusion.rpgplanner';

function isMobileWeb(): boolean {
    if (typeof window === 'undefined') return false;
    // Nie pokazuj na natywnym Capacitor
    if ((window as any).Capacitor?.isNativePlatform?.()) return false;
    // Sprawdź czy to mobile browser
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function MobileAppBanner() {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Sprawdź czy użytkownik już zamknął banner
        const wasDismissed = localStorage.getItem('mobileAppBannerDismissed');
        if (wasDismissed) return;
        if (isMobileWeb()) setVisible(true);
    }, []);

    function handleDismiss() {
        setVisible(false);
        setDismissed(true);
        localStorage.setItem('mobileAppBannerDismissed', 'true');
    }

    if (!visible || dismissed) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-indigo-500 p-3 shadow-2xl">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
                {/* Ikona */}
                <div className="text-3xl flex-shrink-0">⚔️</div>

                {/* Tekst */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100">
                        Get the RPG Planner app!
                    </p>
                    <p className="text-xs text-slate-400">
                        Better experience on Android
                    </p>
                </div>

                {/* Przycisk Google Play */}
                <a
                    href={GOOGLE_PLAY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                >
                    Get App
                </a>

                {/* Zamknij */}
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-200 text-xl p-1"
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}