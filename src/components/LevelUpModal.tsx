import React, { useEffect, useState } from 'react';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    levelUpData: {
        type: 'character' | 'stat' | 'skill';
        name: string;
        oldLevel: number;
        newLevel: number;
        color?: string;
    };
}

export function LevelUpModal({ isOpen, onClose, levelUpData }: LevelUpModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            // Auto-hide confetti after animation
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getEmoji = () => {
        if (levelUpData.type === 'character') return '⭐';
        if (levelUpData.type === 'stat') return '💪';
        if (levelUpData.type === 'skill') return '⚔️';
        return '🎉';
    };

    const getTitle = () => {
        if (levelUpData.type === 'character') return 'Level Up!';
        if (levelUpData.type === 'stat') return 'Stat Increased!';
        if (levelUpData.type === 'skill') return 'Skill Mastered!';
        return 'Congratulations!';
    };

    const getMessage = () => {
        if (levelUpData.type === 'character') {
            return `You've reached Character Level ${levelUpData.newLevel}!`;
        }
        if (levelUpData.type === 'stat') {
            return `${levelUpData.name} increased to Level ${levelUpData.newLevel}!`;
        }
        if (levelUpData.type === 'skill') {
            return `${levelUpData.name} reached Level ${levelUpData.newLevel}!`;
        }
        return '';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                    backgroundColor: ['#FF6B4A', '#4F46E5', '#10B981', '#F59E0B', '#EC4899'][
                                        Math.floor(Math.random() * 5)
                                    ],
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Content */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border-2 border-[#FF6B4A] relative overflow-hidden animate-scale-in">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B4A]/20 to-transparent pointer-events-none" />

                <div className="relative p-8 text-center">
                    {/* Emoji Icon */}
                    <div className="text-8xl mb-4 animate-bounce-slow">
                        {getEmoji()}
                    </div>

                    {/* Title */}
                    <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B4A] to-yellow-400">
                        {getTitle()}
                    </h2>

                    {/* Level Display */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="text-4xl font-bold text-slate-400">
                            {levelUpData.oldLevel}
                        </div>
                        <div className="text-4xl text-[#FF6B4A]">→</div>
                        <div
                            className="text-5xl font-bold animate-pulse-glow"
                            style={{
                                color: levelUpData.color || '#FF6B4A',
                                textShadow: `0 0 20px ${levelUpData.color || '#FF6B4A'}80`
                            }}
                        >
                            {levelUpData.newLevel}
                        </div>
                    </div>

                    {/* Message */}
                    <p className="text-xl text-slate-300 mb-8">
                        {getMessage()}
                    </p>

                    {/* Motivational Quote */}
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
                        <p className="text-sm text-slate-400 italic">
                            {levelUpData.type === 'character' && '"Every level is a new chapter in your adventure!"'}
                            {levelUpData.type === 'stat' && '"Strength isn\'t just about power, it\'s about consistency!"'}
                            {levelUpData.type === 'skill' && '"Mastery comes from dedication and practice!"'}
                        </p>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-[#FF6B4A] to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-[#FF6B4A] transition-all transform hover:scale-105 shadow-lg"
                    >
                        Continue Adventure! 🚀
                    </button>
                </div>
            </div>

            {/* Add Custom Animations */}
            <style>{`
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                
                @keyframes scale-in {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                
                @keyframes pulse-glow {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.9;
                    }
                }
                
                .animate-confetti {
                    animation: confetti linear forwards;
                }
                
                .animate-scale-in {
                    animation: scale-in 0.5s ease-out;
                }
                
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
                
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );

}

