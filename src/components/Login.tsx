/**
 * Login Component
 * 
 * Handles user authentication with email/password
 * Includes "Skip" option to continue without login
 */

import { useState } from 'react';
import { useAuth } from './AuthProvider';

interface LoginProps {
    onSwitchToRegister: () => void;
    onSkip?: () => void; // Opcjonalna funkcja do pominięcia logowania
}

export function Login({ onSwitchToRegister, onSkip }: LoginProps) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await signIn(email, password);

            if (error) {
                setError(error.message || 'Failed to sign in');
            }
            // Jeśli sukces, AuthProvider automatycznie zaktualizuje stan
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                        🎮 RPG Planner
                    </h1>
                    <p className="text-slate-400">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="your.email@example.com"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-800 text-slate-400">or</span>
                    </div>
                </div>

                {/* Skip Button */}
                {onSkip && (
                    <button
                        onClick={onSkip}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 rounded-lg transition-all mb-3"
                    >
                        Continue without account
                    </button>
                )}

                {/* Switch to Register */}
                <div className="text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToRegister}
                        className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                        Sign up
                    </button>
                </div>

                {/* Info about email confirmation */}
                <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                    <p className="text-xs text-blue-300">
                        💡 <strong>Note:</strong> After registration, check your email for a confirmation link.
                        Click it to activate your account.
                    </p>
                </div>
            </div>
        </div>
    );
}