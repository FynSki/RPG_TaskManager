/**
 * useSwipeNavigation — zmiana zakładek gestem z krawędzi ekranu
 *
 * Gest musi zacząć się w strefie 30px od lewej lub prawej krawędzi.
 * Minimalny dystans poziomy: 80px
 * Maksymalny dystans pionowy: 100px (żeby nie kolidować ze scrollem)
 */

import { useEffect, useRef } from 'react';
import type { ViewType } from '../types';

// Kolejność zakładek — swipe left = następna, swipe right = poprzednia
const VIEW_ORDER: ViewType[] = [
    'character',
    'activeTasks',
    'daily',
    'weekly',
    'monthly',
    'all',
    'projects',
    'settings',
];

type SwipeConfig = {
    /** Szerokość strefy krawędziowej w px (domyślnie 35) */
    edgeWidth?: number;
    /** Minimalny poziomy dystans gestu w px (domyślnie 80) */
    minSwipeX?: number;
    /** Maksymalny pionowy dystans gestu w px (domyślnie 100) */
    maxSwipeY?: number;
};

type UseSwipeNavigationProps = {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    isPremium: boolean;
    config?: SwipeConfig;
};

export function useSwipeNavigation({
    currentView,
    onViewChange,
    isPremium,
    config = {},
}: UseSwipeNavigationProps) {
    const {
        edgeWidth = 35,
        minSwipeX = 80,
        maxSwipeY = 100,
    } = config;

    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const isEdgeSwipe = useRef(false);

    // Filtruj zakładki premium
    const availableViews = VIEW_ORDER.filter(
        v => v !== 'projects' || isPremium
    );

    useEffect(() => {
        function handleTouchStart(e: TouchEvent) {
            const touch = e.touches[0];
            const screenWidth = window.innerWidth;

            // Sprawdź czy gest zaczyna się przy krawędzi
            const fromLeft = touch.clientX <= edgeWidth;
            const fromRight = touch.clientX >= screenWidth - edgeWidth;

            if (fromLeft || fromRight) {
                touchStart.current = { x: touch.clientX, y: touch.clientY };
                isEdgeSwipe.current = true;
            } else {
                touchStart.current = null;
                isEdgeSwipe.current = false;
            }
        }

        function handleTouchEnd(e: TouchEvent) {
            if (!touchStart.current || !isEdgeSwipe.current) return;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStart.current.x;
            const deltaY = Math.abs(touch.clientY - touchStart.current.y);

            touchStart.current = null;
            isEdgeSwipe.current = false;

            // Zbyt duży ruch pionowy = scroll, nie swipe
            if (deltaY > maxSwipeY) return;

            // Zbyt krótki ruch = nie gest
            if (Math.abs(deltaX) < minSwipeX) return;

            const currentIndex = availableViews.indexOf(currentView);
            if (currentIndex === -1) return;

            if (deltaX < 0) {
                // Swipe w lewo (z prawej krawędzi) → następna zakładka
                const nextIndex = currentIndex + 1;
                if (nextIndex < availableViews.length) {
                    onViewChange(availableViews[nextIndex]);
                }
            } else {
                // Swipe w prawo (z lewej krawędzi) → poprzednia zakładka
                const prevIndex = currentIndex - 1;
                if (prevIndex >= 0) {
                    onViewChange(availableViews[prevIndex]);
                }
            }
        }

        // Passive: false nie jest potrzebne — nie blokujemy scrollu
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [currentView, availableViews, onViewChange, edgeWidth, minSwipeX, maxSwipeY]);
}