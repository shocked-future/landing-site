'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { enigmaDB } from '@/lib/enigmaClient';
import styles from './downloads.module.css';

interface Asset {
    id: string;
    name: string;
    version: string;
    size: string;
    type: 'Media' | 'Game Build' | 'Dev Assets' | string;
    requiresSub: boolean;
    url: string;
}

export default function DownloadsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [assets, setAssets] = useState<Asset[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // --- Parallel Data Fetching ---
    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            // We use Promise.all to fetch assets and profile simultaneously
            const [assetsResult, profileResult] = await Promise.all([
                // Fetch 1: Get all assets from the vault
                enigmaDB.from('vault_assets').select('*').order('name', { ascending: true }),

                // Fetch 2: Get the user's subscription profile
                enigmaDB.from('profiles').select('subscription_tier, subscription_status').eq('id', user.id).single()
            ]);

            if (assetsResult.error) throw new Error(`Asset Error: ${assetsResult.error.message}`);
            if (profileResult.error) throw new Error(`Profile Error: ${profileResult.error.message}`);

            setAssets(assetsResult.data as Asset[]);
            setProfile(profileResult.data);

        } catch (e: any) {
            console.error("Error fetching vault data:", e);
            setFetchError(e.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchData();
        }
    }, [user, authLoading, router, fetchData]);

    // --- Access Logic ---
    const hasSubscriptionAccess = () => {
        if (!profile) return false;
        const tier = profile.subscription_tier;
        const status = profile.subscription_status;

        // Check if they have an active subscription to *any* paid tier
        return status === 'active' && (tier === 'operative' || tier === 'vanguard' || tier === 'specter');
    };

    const handleDownload = (asset: Asset) => {
        if (asset.requiresSub && !hasSubscriptionAccess()) {
            // This shouldn't be possible if button is locked, but good to check
            router.push('/subscribe');
            return;
        }
        // TODO: Replace with a call to a secure download API
        alert(`Initiating secure download: ${asset.name}`);
        // In production, you'd call an API that generates a pre-signed S3/Supabase URL
        // e.g., fetch(`/api/get-download-url?file=${asset.url}`).then(...)
    };

    if (authLoading || loading) {
        return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Accessing Vault... Verifying Clearance...</div>;
    }

    if (fetchError) {
        return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#ff4d4d' }}>Error: {fetchError}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Digital Asset Vault</h1>
                <p className={styles.subtitle}>Secure storage for game builds, media, and development assets.</p>
            </div>

            <div className={styles.list}>
                {assets.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.7, padding: '2rem' }}>No assets are currently available in the vault.</p>
                ) : (
                    assets.map((asset) => {
                        // Determine if the asset should be locked
                        const isLocked = asset.requiresSub && !hasSubscriptionAccess();

                        return (
                            <div key={asset.id} className={styles.item} style={{ opacity: isLocked ? 0.6 : 1 }}>
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

                                {isLocked ? (
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
                        );
                    })
                )}
            </div>
        </div>
    );
}