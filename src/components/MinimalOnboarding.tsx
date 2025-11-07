/**
 * Minimal Onboarding Component
 * Brief welcome screen with app info and PWA install basics
 */

interface MinimalOnboardingProps {
    onComplete: () => void;
}

export function MinimalOnboarding({ onComplete }: MinimalOnboardingProps) {
    // Detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[100] overflow-y-auto">
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-slate-800 rounded-xl p-6 md:p-8 max-w-lg w-full border border-slate-700">
                    {/* Logo/Icon */}
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-3">🗡️</div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            Welcome to RPG Planner!
                        </h1>
                        <p className="text-slate-400">
                            Transform your tasks into epic quests
                        </p>
                    </div>

                    {/* Key Info */}
                    <div className="space-y-4 mb-6">
                        {/* What is it */}
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🎮</span>
                                <div>
                                    <div className="font-semibold mb-1">Gamified Task Management</div>
                                    <p className="text-sm text-slate-400">
                                        Complete tasks, earn XP, level up your character, and track your progress RPG-style!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PWA Install */}
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📱</span>
                                <div>
                                    <div className="font-semibold mb-1">Install as App</div>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Add to your home screen for the best experience:
                                    </p>
                                    {isIOS && (
                                        <p className="text-xs text-slate-500">
                                            <strong>iOS:</strong> Tap Share ⬆️ → "Add to Home Screen"
                                        </p>
                                    )}
                                    {isAndroid && (
                                        <p className="text-xs text-slate-500">
                                            <strong>Android:</strong> Tap Menu (⋮) → "Install App"
                                        </p>
                                    )}
                                    {!isIOS && !isAndroid && (
                                        <p className="text-xs text-slate-500">
                                            <strong>Desktop:</strong> Look for install icon (⊕) in address bar
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Privacy */}
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🔒</span>
                                <div>
                                    <div className="font-semibold mb-1">Your Data is Private</div>
                                    <p className="text-sm text-slate-400">
                                        All data stored locally on your device. No account required.
                                        Only anonymous analytics (Google Analytics) for app improvements.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Last update */}
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🎖️</span>
                                <div>
                                    <div className="font-semibold mb-1">Last updates (2025-11-06)</div>
                                    <p className="text-sm text-slate-400">
                                        - Adding possibility to download this App
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        - Adding "Welcome Page"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* More Info Link */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-slate-400">
                            📚 More info: <strong>Settings → About</strong>
                        </p>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={onComplete}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition"
                    >
                        🚀 Start Your Adventure!
                    </button>
                </div>
            </div>
        </div>
    );
}