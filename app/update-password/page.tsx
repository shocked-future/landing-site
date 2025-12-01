'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { enigmaAuth } from '@/lib/enigmaClient';
import { useAuth } from '@/context/AuthContext';
import styles from '../auth.module.css';
import Image from 'next/image';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Use context to verify we actually have a session (Supabase handles this via the link)
    const { session, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !session) {
            // If the link is invalid or expired, kick them back to login
            setError("Invalid or expired recovery session.");
            router.push('/login');
        }
    }, [session, authLoading]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Credentials do not match.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await enigmaAuth.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            // Success! Redirect to profile or home
            router.push('/profile');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className={styles.container}>Initializing secure channel...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                    <Image
                        src="/enigma.svg"
                        alt="Enigma Logo"
                        width={378}
                        height={152}
                        priority
                    />
                <p className={styles.subtitle}>Update your Shocked Future account credentials</p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleUpdate} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        required
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}