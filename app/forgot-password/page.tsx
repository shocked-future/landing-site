'use client';

import { useState } from 'react';
import Link from 'next/link';
import { enigmaAuth } from '@/lib/enigmaClient';
import styles from '../auth.module.css';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMsg(null);
        setLoading(true);

        try {
            // We redirect the user to the /update-password page after they click the email link
            const redirectTo = `${window.location.origin}/update-password`;

            const { error } = await enigmaAuth.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (error) throw error;

            setMsg('Recovery protocol initiated. Check your email for the access link.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                <p className={styles.subtitle}>Recover access to your Shocked Future account</p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {msg && <div style={{ color: '#4ade80', marginBottom: '1rem' }}>{msg}</div>}

            <form onSubmit={handleReset} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                        placeholder="operative@shockedfuture.com"
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? 'Sending a link...' : 'Send Recovery Link'}
                </button>
            </form>

            <p className={styles.linkText}>
                Recall your credentials?{' '}
                <Link href="/login" className={styles.link}>
                    Sign in
                </Link>
            </p>
        </div>
    );
}