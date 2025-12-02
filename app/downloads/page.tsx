'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { enigmaAuth, enigmaDB } from '@/lib/enigmaClient'; // Added enigmaDB import
import styles from './downloads.module.css';

// Define the interface for the database structure
interface Asset {
    id: string; // Assumed UUID from your description
    name: string;
    version: string;
    size: string;
    type: 'Media' | 'Game Build' | 'Dev Assets' | string;
    requiresSub: boolean;
    url: string;
}

export default function DownloadsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // New states for fetching assets
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Existing states for subscription check
    const [hasSubscription, setHasSubscription] = useState(false);
    const [checkingSub, setCheckingSub] = useState(true);


    useEffect(() => {
        // Function to check subscription status from user metadata
        const checkSubscription = async () => {
            if (!user) return;

            try {
                // Fetch the latest user metadata (where subscription_tier is stored)
                const { data: { user: updatedUser } } = await enigmaAuth.auth.getUser();

                // This tier field should be updated by your Stripe Webhooks
                const tier = updatedUser?.user_metadata?.subscription_tier;

                // If the user has any paid tier, they have access to locked assets
                if (tier === 'operative' || tier === 'vanguard' || tier === 'specter') {
                    setHasSubscription(true);
                } else {
                    setHasSubscription(false);
                }
            } catch (e) {
                console.error("Error checking subscription status:", e);
                setHasSubscription(false);
            } finally {
                setCheckingSub(false);
            }
        };

        // Function to fetch assets from Supabase
        const fetchAssets = async () => {
            setLoadingAssets(true);
            setFetchError(null);
            try {
                // Query the 'vault_assets' table in the public schema
                const { data, error } = await enigmaDB
                    .from('vault_assets')
                    .select('*')
                    .order('id', { ascending: true }); // Order by name for consistency

                if (error) {
                    throw new Error(error.message);
                }

                if (data) {
                    setAssets(data as Asset[]);
                }
            } catch (e: any) {
                console.error("Error fetching vault assets:", e);
                setFetchError(`Failed to load assets: ${e.message}`);
            } finally {
                setLoadingAssets(false);
            }
        };


        if (!loading && !user) {
            // Not logged in, redirect
            router.push('/login');
        } else if (user) {
            // Logged in, check subscription and fetch assets simultaneously
            checkSubscription();
            fetchAssets();
        }
    }, [user, loading, router]); // Dependency array ensures effects run on auth change

    if (loading || checkingSub || loadingAssets) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                Verifying Clearance Level and Loading Vault Assets...
            </div>
        );
    }

    if (fetchError) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#ff4d4d' }}>
                Error retrieving vault data: {fetchError}
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
                    Please ensure the 'vault_assets' table exists in the public schema and RLS policies allow reading.
                </p>
            </div>
        );
    }

    const handleDownload = (asset: Asset) => {
        if (asset.requiresSub && !hasSubscription) {
            alert("Access Denied: Operative Clearance (Subscription) required.");
            router.push('/subscribe');
            return;
        }
        // In a real scenario, this is where you'd fetch a secure, time-limited download URL
        alert(`Initiating secure download: ${asset.name}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Digital Asset Vault</h1>
                <p className={styles.subtitle}>Secure storage for game builds, media, and development assets, dynamically loaded from Supabase.</p>
            </div>

            <div className={styles.list}>
                {assets.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.7, padding: '2rem' }}>No assets are currently available in the vault.</p>
                ) : (
                    assets.map((asset) => (
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
                    ))
                )}
            </div>
        </div>
    );
}