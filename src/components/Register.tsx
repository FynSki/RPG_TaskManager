/**
 * Register Component
 * 
 * Handles user registration with email/password
 * Includes "Skip" option to continue without registration
 */

import { useState } from 'react';
import { useAuth } from './AuthProvider';

interface RegisterProps {
    onSwitchToLogin: () => void;
    onSkip?: () => void; // Opcjonalna funkcja do pominięcia rejestracji
}

export function Register({ onSwitchToLogin, onSkip }: RegisterProps) {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { error } = await signUp(email, password);

            if (error) {
                setError(error.message || 'Failed to create account');
            } else {
                setSuccess(true);
                // Reset form
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Registration error:', err);
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
                    <p className="text-slate-400">Create your account</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4">
                        <p className="text-sm font-semibold mb-1">✅ Account created successfully!</p>
                        <p className="text-xs">
                            Check your email for a confirmation link. Click it to activate your account,
                            then return here to sign in.
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Register Form */}
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
                            minLength={6}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="••••••••"
                        />
                        <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
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

                {/* Switch to Login */}
                <div className="text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                        Sign in
                    </button>
                </div>

                {/* Email Confirmation Info */}
                <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                    <p className="text-xs text-blue-300">
                        📧 <strong>Email Confirmation Required:</strong>
                    </p>
                    <ul className="text-xs text-blue-300 mt-2 space-y-1 ml-4 list-disc">
                        <li>After signing up, check your email inbox</li>
                        <li>Click the confirmation link in the email</li>
                        <li>You'll be redirected back to sign in</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}