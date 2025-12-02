'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './subscribe.module.css';

// --- Reusable Modal (Same as Profile) ---
const Modal = ({ title, children, onClose }: any) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
        <div style={{
            background: 'var(--background-card)', border: '1px solid var(--accent)',
            padding: '2rem', maxWidth: '500px', width: '90%', borderRadius: '8px',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)'
        }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '1rem' }}>{title}</h2>
            <div style={{ marginBottom: '2rem', lineHeight: 1.6 }}>{children}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{
                    padding: '0.75rem 1.5rem', background: 'var(--accent)', color: 'var(--background)',
                    fontWeight: 700, border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}>ACKNOWLEDGE</button>
            </div>
        </div>
    </div>
);

export default function SubscribePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [showDevModal, setShowDevModal] = useState(false);

    // --- STRIPE PREPARATION LOGIC ---
    const handleCheckout = (priceId: string) => {
        if (!user) {
            // If not logged in, force signup/login
            router.push('/signup');
            return;
        }

        // TODO: WHEN STRIPE IS READY
        // 1. Call your API route to create a Stripe Session
        // 2. Redirect to the URL returned by Stripe

        // FOR NOW: Show "Coming Soon" Modal
        console.log(`[DEV] User ${user.email} initiated checkout for ${priceId}`);
        setShowDevModal(true);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Clearance Level</h1>
                <p className={styles.subtitle}>
                    Secure your place in the future. Unlock exclusive assets, early builds, and operative status.
                </p>
            </header>

            <div className={styles.grid}>

                {/* Tier 1: Free */}
                <div className={styles.card}>
                    <h2 className={styles.planName}>Initiate</h2>
                    <div className={styles.price}>$0<span>/mo</span></div>
                    <ul className={styles.features}>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Access to public games</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Basic community access</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Enigma ID profile</li>
                    </ul>
                    <button
                        className={styles.button}
                        onClick={() => user ? router.push('/profile') : router.push('/signup')}
                    >
                        {user ? 'Current Status' : 'Join Now'}
                    </button>
                </div>

                {/* Tier 2: Pro (Popular) */}
                <div className={`${styles.card} ${styles.cardPopular}`}>
                    <div className={styles.badge}>Recommended</div>
                    <h2 className={styles.planName}>Operative</h2>
                    <div className={styles.price}>$5<span>/mo</span></div>
                    <ul className={styles.features}>
                        <li className={styles.feature}><span className={styles.check}>✓</span> <strong>Early Access</strong> to builds</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> 4K Wallpaper Vault</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> "Operative" Discord Role</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Voting rights on features</li>
                    </ul>
                    <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={() => handleCheckout('price_operative_monthly')}
                    >
                        Upgrade Clearance
                    </button>
                </div>

                {/* Tier 3: Enterprise */}
                <div className={styles.card}>
                    <h2 className={styles.planName}>Vanguard</h2>
                    <div className={styles.price}>$50<span>/yr</span></div>
                    <ul className={styles.features}>
                        <li className={styles.feature}><span className={styles.check}>✓</span> All Operative benefits</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> 2 Months Free</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Name in Game Credits</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Physical Sticker Pack (Soon)</li>
                    </ul>
                    <button
                        className={styles.button}
                        onClick={() => handleCheckout('price_vanguard_yearly')}
                    >
                        Upgrade Clearance
                    </button>
                </div>

            </div>

            {showDevModal && (
                <Modal title="PAYMENT GATEWAY OFFLINE" onClose={() => setShowDevModal(false)}>
                    <p>
                        The Shocked Future debit infrastructure is currently provisioning.
                        Stripe integration is in <strong>Development Mode</strong>.
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                        No charges have been made. When we go live, this button will redirect you to a secure checkout.
                    </p>
                </Modal>
            )}
        </div>
    );
}