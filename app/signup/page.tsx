'use client';

import { useState } from 'react';
import Link from 'next/link';
import { enigmaAuth } from '@/lib/enigmaClient';
import styles from '../auth.module.css';
import Image from 'next/image';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMsg(null);

        const { error } = await enigmaAuth.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setMsg('Identity verification email sent. Please check your inbox.');
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
                <p className={styles.subtitle}>Create a Shocked Future account</p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {msg && <div style={{ color: '#4ade80', marginBottom: '1rem' }}>{msg}</div>}

            <form onSubmit={handleSignup} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                        placeholder="operative@shockedfuture.com"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Password</label>
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
                <button type="submit" className={styles.submitButton}>
                    Sign Up
                </button>
            </form>

            <p className={styles.linkText}>
                By signing up, you agree to our{' '}
                <Link href="/terms" className={styles.link}>
                    Terms of Service
                </Link>{' '}and{' '}
                <Link href="/privacy" className={styles.link}>
                    Privacy Policy
                </Link>.
            </p>

            <p className={styles.linkText}>
                Already operative?{' '}
                <Link href="/login" className={styles.link}>
                    Sign in here
                </Link>
            </p>
        </div>
    );
}