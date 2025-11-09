/**
 * AboutPage Component
 * Full-page about section for RPG Planner
 */

interface AboutPageProps {
    onClose: () => void;
}

export function AboutPage({ onClose }: AboutPageProps) {
    const handleCopyLink = () => {
        navigator.clipboard.writeText('https://rpgplanner.app');
        alert('Link copied to clipboard! 📋');
    };

    return (
        <div className="fixed inset-0 bg-slate-900 overflow-y-auto z-50">
            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={onClose}
                        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                        <span>Back to App</span>
                    </button>

                    {/* Content */}
                    <div className="space-y-8">
                        {/* Hero Section */}
                        <div className="text-center pb-6 border-b border-slate-700">
                            <div className="text-8xl mb-4">🎮</div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                                RPG Planner
                            </h1>
                            <p className="text-xl text-indigo-400">
                                Level up your life, one quest at a time
                            </p>
                        </div>

                        {/* What is RPG Planner */}
                        <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="text-3xl">⚔️</span>
                                <span>What is RPG Planner?</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                RPG Planner is a gamified task manager that transforms your daily to-dos
                                into epic quests. Complete tasks to earn XP, level up your character,
                                unlock achievements, and watch your skills grow as you conquer your goals!
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="text-3xl">✨</span>
                                <span>Features</span>
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FeatureCard
                                    icon="📊"
                                    title="Character Progression"
                                    description="Level up your character by completing tasks"
                                />
                                <FeatureCard
                                    icon="💪"
                                    title="5 RPG Stats"
                                    description="Strength, Endurance, Intelligence, Agility, Charisma"
                                />
                                <FeatureCard
                                    icon="🎯"
                                    title="Custom Skills"
                                    description="Track skills that level up with practice"
                                />
                                <FeatureCard
                                    icon="📅"
                                    title="Multiple Views"
                                    description="Daily, weekly, and monthly quest planning"
                                />
                                
                                <FeatureCard
                                    icon="🔄"
                                    title="Recurring Tasks"
                                    description="Set up daily, weekly, or monthly quests"
                                />
                            </div>
                        </div>

                        {/* Creator Section */}
                        <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="text-3xl">👤</span>
                                <span>Created by</span>
                            </h2>

                            <div className="space-y-4">
                                <p className="text-slate-300 text-lg">
                                    Made with <span className="text-red-500 text-xl">❤️</span> by{" "}
                                    <span className="text-orange-500 font-bold">Adam Janiszewski CodeFusion</span>
                                    {" • "}
                                    <a
                                        href="mailto:codefusion.fychan@gmail.com"
                                        className="text-indigo-400 hover:underline"
                                    >
                                        codefusion.fychan@gmail.com
                                    </a>
                                </p>

                                {/* Social Links */}
                                <div className="flex flex-wrap gap-3">
                                    <SocialButton
                                        href="https://x.com/fusion52233"
                                        icon={<TwitterIcon />}
                                        label="Follow on X"
                                        bgColor="bg-blue-600 hover:bg-blue-700"
                                    />

                                    <SocialButton
                                        href="https://www.youtube.com/@AdamCodeFusion"
                                        icon={<YouTubeIcon />}
                                        label="YouTube"
                                        bgColor="bg-red-600 hover:bg-b-700"
                                    />


                                    {/* Uncomment when ready */}
                                    {/* <SocialButton
                                        href="https://twitter.com/rpgplanner"
                                        icon={<TwitterIcon />}
                                        label="Twitter"
                                        bgColor="bg-blue-600 hover:bg-blue-700"
                                    /> */}
                                </div>

                                <div className="pt-4 border-t border-slate-700">
                                    <p className="text-slate-400 text-sm">
                                        Version 2.0 • October 2025
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Policy */}
                        <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="text-3xl">🔒</span>
                                <span>Privacy</span>
                            </h2>
                            <p className="text-slate-300 leading-relaxed">
                                All your data is stored locally in your browser using localStorage.
                                We <span className="font-bold text-white">never</span> collect, transmit,
                                or store any of your personal information on external servers. Your tasks,
                                character progress, and settings remain completely private and under your control.
                            </p>
                        </div>

                        {/* Call to Action */}
                        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-6 md:p-8 text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Enjoying RPG Planner?
                            </h3>
                            <p className="text-orange-100 mb-4">
                                Share it with fellow questers who might love it too!
                            </p>
                            <button
                                onClick={handleCopyLink}
                                className="px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors shadow-lg inline-flex items-center gap-2"
                            >
                                <span>📋</span>
                                <span>Copy Link</span>
                            </button>
                        </div>

                        {/* Footer spacer */}
                        <div className="h-8"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== SUB-COMPONENTS ====================

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-indigo-500 transition-colors">
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    );
}

interface SocialButtonProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    bgColor: string;
}

function SocialButton({ href, icon, label, bgColor }: SocialButtonProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 ${bgColor} rounded-lg transition-colors inline-flex items-center gap-2 text-white`}
        >
            {icon}
            <span>{label}</span>
        </a>
    );
}

// ==================== ICONS ====================



function TwitterIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <path d="M19.615 3.184A3.009 3.009 0 0 0 17.493 2H6.507A3.009 3.009 0 0 0 4.385 3.184C3.29 4.1 3 5.671 3 8v8c0 2.329.29 3.9 1.385 4.816A3.009 3.009 0 0 0 6.507 22h10.986a3.009 3.009 0 0 0 2.122-.184C20.71 20.9 21 19.329 21 17V7c0-2.329-.29-3.9-1.385-4.816zM10 15.5v-7l6 3.5-6 3.5z" />
        </svg>
    );
}
