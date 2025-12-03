'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/context/AuthContext';
import { enigmaAuth } from '@/lib/enigmaClient';
import styles from './subscribe.module.css'; // Uses the same CSS file

// Initialize Stripe on the client
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- A lightweight modal for errors ---
const ErrorModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
        <div style={{
            background: 'var(--background-card)', border: '1px solid #ff4d4d',
            padding: '2rem', maxWidth: '500px', width: '90%', borderRadius: '8px',
            boxShadow: '0 0 30px rgba(255, 77, 77, 0.3)'
        }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ff4d4d', marginBottom: '1rem' }}>TRANSACTION FAILED</h2>
            <div style={{ marginBottom: '2rem', lineHeight: 1.6 }}><p>{message}</p></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{
                    padding: '0.75rem 1.5rem', background: '#ff4d4d', color: '#fff',
                    fontWeight: 700, border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}>CLOSE</button>
            </div>
        </div>
    </div>
);


export default function SubscribePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);

    const handleCheckout = async (priceKey: string) => {
        // 1. Check for login
        if (!user) {
            router.push('/signup');
            return;
        }

        setLoading(true);

        try {
            // 2. Map friendly key to secure Environment Variable
            let priceId = '';
            switch (priceKey) {
                case 'operative':
                    priceId = process.env.NEXT_PUBLIC_PRICE_ID_OPERATIVE!;
                    break;
                case 'vanguard':
                    priceId = process.env.NEXT_PUBLIC_PRICE_ID_VANGUARD!;
                    break;
                default:
                    throw new Error("Invalid price key selected.");
            }

            if (!priceId) {
                throw new Error(`Configuration Error: Price ID for "${priceKey}" is not set in environment variables.`);
            }

            // 3. Get user's auth token to prove identity to our API
            const { data: { session } } = await enigmaAuth.auth.getSession();
            if (!session) {
                throw new Error("Your session has expired. Please log in again.");
            }

            // 4. Securely call our backend API route
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout session.");
            }

            // 5. Redirect to Stripe Hosted Checkout
            if (!data.url) {
                throw new Error("No checkout URL provided by server.");
            }

            window.location.href = data.url;

        } catch (err: any) {
            console.error(err);
            setErrorModal(err.message);
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {errorModal && <ErrorModal message={errorModal} onClose={() => setErrorModal(null)} />}

            <header className={styles.header}>
                <h1 className={styles.title}>Clearance Level</h1>
                <p className={styles.subtitle}>
                    Support the mission, influence development, and gain access to the inner circle.
                </p>
            </header>

            {/* The CSS grid from 'subscribe.module.css' handles the side-by-side layout */}
            <div className={styles.grid}>

                {/* Tier 1: Operative */}
                <div className={styles.card}>
                    <h2 className={styles.planName}>Operative</h2>
                    <div className={styles.price}>$5<span>/mo</span></div>
                    <p className={styles.tierDesc}>Stay informed and help shape the future.</p>
                    <ul className={styles.features}>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Access to Dev Logs</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> "Operative" Discord Role</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Feature Influence (Voting)</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Support the Mission</li>
                    </ul>
                    <button
                        className={styles.button}
                        onClick={() => handleCheckout('operative')}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Become an Operative'}
                    </button>
                </div>

                {/* Tier 2: Vanguard (Popular) */}
                <div className={`${styles.card} ${styles.cardPopular}`}>
                    <div className={styles.badge}>Recommended</div>
                    <h2 className={styles.planName}>Vanguard</h2>
                    <div className={styles.price}>$10<span>/mo</span></div>
                    <p className={styles.tierDesc}>Elite status with early access and direct feedback.</p>
                    <ul className={styles.features}>
                        <li className={styles.feature}><span className={styles.check}>✓</span> All Operative Benefits</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Beta Build Access (1 Week Delay)</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Priority Feedback Loop</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> "Vanguard" Exclusive Role</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Deeper Dev Insights</li>
                    </ul>
                    <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={() => handleCheckout('vanguard')}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Join the Vanguard'}
                    </button>
                </div>

            </div>
        </div>
    );
}