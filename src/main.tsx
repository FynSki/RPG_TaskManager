import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeAdMob } from './services/AdService'
import { showBanner } from './services/AdService'

// Inicjalizuj AdMob i poka¿ baner gdy aplikacja siê ³aduje
async function initApp() {
    await initializeAdMob();

    // Poka¿ baner tylko na natywnym
    const isNative = typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.() === true;

    if (isNative) {
        // Ma³e opóŸnienie ¿eby UI zd¹¿y³o siê za³adowaæ
        setTimeout(() => showBanner(), 1000);
    }
}

initApp();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)