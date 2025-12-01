'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { enigmaAuth } from '@/lib/enigmaClient';
import styles from '../auth.module.css';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const { error } = await enigmaAuth.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            router.push('/profile');
            router.refresh(); // Ensure navbar updates
        }
    };

    const handleOAuth = async (provider: 'github' | 'discord') => {
        await enigmaAuth.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                    <Image
                        src="/ashcore.svg"
                        alt="AshCore Logo"
                        width={378}
                        height={152}
                        priority
                    />
                <p className={styles.subtitle}>Sign in to access your Shocked Future account</p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleEmailLogin} className={styles.form}>
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
                    />
                </div>
                <button type="submit" className={styles.submitButton}>
                    Log In
                </button>
            </form>

            <p className={styles.linkText}>
                Forgot your password?{' '}
                <Link href="/forgot-password" className={styles.link}>
                    Reset it here
                </Link>
            </p>

            <div className={styles.divider}>OR CONTINUE WITH</div>

            <div className={styles.socialButtons}>
                <button
                    onClick={() => handleOAuth('github')}
                    className={`${styles.socialButton}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github-icon lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                    GitHub
                </button>
                <button
                    onClick={() => handleOAuth('discord')}
                    className={`${styles.socialButton}`}
                >

                    <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_12_7" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="15" height="12">
                            <path d="M15 0H0V11.6129H15V0Z" fill='currentColor' />
                        </mask>
                        <g mask="url(#mask0_12_7)">
                            <path d="M12.6978 0.972563C11.7274 0.518221 10.6899 0.188005 9.60524 0C9.47204 0.241032 9.31641 0.565219 9.20916 0.823126C8.05604 0.649582 6.9136 0.649582 5.78177 0.823126C5.6745 0.565219 5.51531 0.241032 5.38094 0C4.29507 0.188005 3.25637 0.519426 2.28606 0.974978C0.328928 3.93485 -0.201619 6.82123 0.0636543 9.66657C1.36173 10.6368 2.61971 11.226 3.85648 11.6117C4.16184 11.1911 4.43419 10.744 4.66881 10.2728C4.22197 10.1028 3.794 9.89315 3.3896 9.6497C3.49688 9.5702 3.60182 9.48702 3.70322 9.40145C6.16969 10.556 8.84954 10.556 11.2865 9.40145C11.389 9.48702 11.494 9.5702 11.6002 9.6497C11.1946 9.89435 10.7654 10.104 10.3186 10.274C10.5532 10.744 10.8244 11.1923 11.1309 11.6129C12.3688 11.2272 13.628 10.638 14.926 9.66657C15.2374 6.36808 14.3944 3.50822 12.6978 0.972563ZM5.00482 7.91675C4.26442 7.91675 3.65723 7.22492 3.65723 6.38255C3.65723 5.54013 4.25144 4.84718 5.00482 4.84718C5.75821 4.84718 6.36537 5.53892 6.3524 6.38255C6.35361 7.22492 5.75821 7.91675 5.00482 7.91675ZM9.98489 7.91675C9.24449 7.91675 8.63729 7.22492 8.63729 6.38255C8.63729 5.54013 9.23151 4.84718 9.98489 4.84718C10.7383 4.84718 11.3455 5.53892 11.3325 6.38255C11.3325 7.22492 10.7383 7.91675 9.98489 7.91675Z" fill='currentColor' />
                        </g>
                    </svg>

                    Discord
                </button>
            </div>

            <p className={styles.linkText}>
                Need an identity?{' '}
                <Link href="/signup" className={styles.link}>
                    Register here
                </Link>
            </p>
        </div>
    );
}