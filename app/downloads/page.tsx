'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './downloads.module.css';

// Mock Data (Replace with Supabase 'assets' table later)
const ASSETS = [
    {
        id: 1,
        name: 'Shocked Future: Desktop Wallpapers',
        version: 'v1.0',
        size: '150 MB',
        type: 'Media',
        requiresSub: false, // Free for all operatives
        url: '#'
    },
    {
        id: 2,
        name: 'Project Cybershift (Alpha Build)',
        version: 'v0.4.2-b',
        size: '2.4 GB',
        type: 'Game Build',
        requiresSub: true, // Requires subscription
        url: '#'
    },
    {
        id: 3,
        name: 'Enigma UI Kit (Community Edition)',
        version: 'v2.1',
        size: '45 MB',
        type: 'Dev Assets',
        requiresSub: false,
        url: '#'
    }
];

export default function DownloadsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Mock Subscription Status (In real app, fetch from Supabase)
    const [hasSubscription, setHasSubscription] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        // TODO: Check user.subscription_status in database
        // For now, we assume false to test the "Locked" UI
        setHasSubscription(false);
    }, [user, loading, router]);

    if (loading || !user) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Accessing Vault...</div>;

    const handleDownload = (asset: any) => {
        if (asset.requiresSub && !hasSubscription) {
            alert("Access Denied: Operative Clearance (Subscription) required.");
            router.push('/subscribe');
            return;
        }
        alert(`Initiating download: ${asset.name}`);
        // window.open(asset.url);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Digital Asset Vault</h1>
                <p className={styles.subtitle}>Secure storage for game builds, media, and development assets.</p>
            </div>

            <div className={styles.list}>
                {ASSETS.map((asset) => (
                    <div key={asset.id} className={styles.item}>
                        <div className={styles.itemInfo}>
                            <div className={styles.iconPlaceholder}>
                                {asset.type === 'Game Build' ? '🎮' : asset.type === 'Media' ? '🖼️' : '📦'}
                            </div>
                            <div className={styles.itemDetails}>
                                <h3>{asset.name}</h3>
                                <div className={styles.meta}>
                                    {asset.type} • {asset.version} • {asset.size}
                                </div>
                            </div>
                        </div>

                        {asset.requiresSub && !hasSubscription ? (
                            <button
                                className={styles.lockedBtn}
                                onClick={() => router.push('/subscribe')}
                            >
                                🔒 Locked (Upgrade)
                            </button>
                        ) : (
                            <button
                                className={styles.downloadBtn}
                                onClick={() => handleDownload(asset)}
                            >
                                ⬇ Download
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}