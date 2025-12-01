'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { enigmaAuth } from '@/lib/enigmaClient';
import styles from '../auth.module.css';

// --- Reusable Modal Component ---
const Modal = ({ title, children, onClose, actionLabel, onAction, isDestructive }: any) => (
    <div className={styles.modalBackdrop} onClick={onClose}>
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={isDestructive ? { borderColor: '#ff6b6b' } : {}}>
            <h2 className={styles.modalTitle} style={isDestructive ? { color: '#ff6b6b' } : {}}>{title}</h2>
            <div className={styles.modalText}>{children}</div>
            <div className={styles.modalActions}>
                <button className={`${styles.modalButton} ${styles.btnSecondary}`} onClick={onClose}>
                    Cancel
                </button>
                {actionLabel && (
                    <button
                        className={`${styles.modalButton} ${isDestructive ? styles.modalDeleteBtn : styles.btnPrimary}`}
                        onClick={onAction || onClose}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default function ProfilePage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Modal States
    const [showSocialWarning, setShowSocialWarning] = useState(false);
    const [showCommerceWarning, setShowCommerceWarning] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // NEW
    const [isDeleting, setIsDeleting] = useState(false); // NEW

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (user) {
            // Check for custom avatar in metadata, otherwise fallback to default
            setAvatarUrl(user.user_metadata?.avatar_url || null);
        }
    }, [user, loading, router]);

    if (loading || !user) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Enigma Protocol...</div>;

    // --- Logic: Avatar Handling ---
    const handleAvatarClick = () => {
        const isSocialUser = user.app_metadata.provider !== 'email';
        if (isSocialUser) setShowSocialWarning(true);
        else fileInputRef.current?.click();
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await enigmaAuth.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data } = enigmaAuth.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // 3. Update User Metadata
            const { error: updateError } = await enigmaAuth.auth.updateUser({
                data: { avatar_url: publicUrl },
            });

            if (updateError) throw updateError;

            // 4. Update Local State
            setAvatarUrl(publicUrl);

        } catch (error: any) {
            alert('Error uploading avatar: ' + error.message);
        } finally {
            setUploading(false);
        }
    };
    // --- NEW: Delete Account Logic ---
    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            // 1. Get current session token to prove identity to our API
            const { data: { session } } = await enigmaAuth.auth.getSession();

            if (!session) throw new Error("No active session found.");

            // 2. Call our custom Next.js API route
            const response = await fetch('/api/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete account');
            }

            // 3. If successful, sign out locally and redirect
            await enigmaAuth.auth.signOut();
            router.push('/');

        } catch (error: any) {
            alert('Deletion Failed: ' + error.message);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const getDisplayName = () => {
        if (!user) return 'Operative';

        // 1. Try to find Discord specific "global_name" (Display Name)
        // This usually lives in the identities array which holds raw provider data
        const discordIdentity = user.identities?.find((id) => id.provider === 'discord');
        if (discordIdentity?.identity_data?.global_name) {
            return discordIdentity.identity_data.global_name;
        }

        // 2. Check if "custom_claims" or "global_name" bubbled up to metadata
        if (user.user_metadata?.global_name) return user.user_metadata.global_name;

        // 3. Fallback to standard metadata (GitHub uses 'name' or 'full_name')
        return user.user_metadata?.full_name || user.user_metadata?.name || 'Operative';
    };

    // --- JSX ---
    return (
        <div className={styles.profileContainer}>

            {/* --- Left Column: Identity --- */}
            <aside className={styles.profileCard}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt="Avatar"
                                width={150}
                                height={150}
                                className={styles.avatarImage}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '3rem' }}>?</span>
                            </div>
                        )}

                        {/* Overlay allows user to see they can click */}
                        <div className={styles.avatarOverlay}>
                            <span className={styles.overlayText}>
                                {uploading ? 'Uploading...' : 'Edit Photo'}
                            </span>
                        </div>
                    </div>

                    {/* Hidden Input for File Upload */}
                    <input
                        type="file"
                        id="single"
                        accept="image/*"
                        onChange={uploadAvatar}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />

                    <h2 className={styles.userName}>{getDisplayName()}</h2>
                    
                    {/* Subscription/Rank Badge */}
                    <div style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        marginBottom: '1rem',
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(0, 255, 255, 0.1)',
                        border: '1px solid var(--accent)',
                        borderRadius: '100px',
                        color: 'var(--accent)',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)'
                    }}>
                        LEVEL 0 ACCESS
                    </div>

                    <p className={styles.userEmail}>{user.email}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>
                        ID: {user.id.slice(0, 8)}...
                    </p>
                </div>

                <button onClick={signOut} className={styles.signOutButton}>
                    TERMINATE SESSION
                </button>
            </aside>

            {/* --- Right Column: Command Center --- */}
            <section className={styles.profileCard}>
                <h3 className={styles.label} style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                    COMMAND CENTER
                </h3>

                {/* Account Management */}
                <div style={{ marginBottom: '2rem' }}>
                    <h4 className={styles.label}>ACCOUNT SETTINGS</h4>

                    {user.app_metadata.provider === 'email' && (
                        <button
                            className={styles.actionButton}
                            onClick={() => router.push('/update-password')}
                        >
                            <span>Update Access Credentials (Password)</span>
                            <span>→</span>
                        </button>
                    )}

                    <button className={styles.actionButton} style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        <span>Request Data Export (GDPR)</span>
                        <span style={{ fontSize: '0.8rem' }}>UNAVAILABLE</span>
                    </button>
                </div>

                {/* Commerce / Subscriptions */}
                <div>
                    <h4 className={styles.label}>COMMERCE & ASSETS</h4>

                    <button
                        className={styles.actionButton}
                        onClick={() => setShowCommerceWarning(true)}
                    >
                        <span>Manage Shocked Future Subscription</span>
                        <span style={{ color: 'var(--accent)' }}>ACTIVE</span>
                    </button>

                    <button
                        className={styles.actionButton}
                        onClick={() => setShowCommerceWarning(true)}
                    >
                        <span>View Purchase History</span>
                        <span>→</span>
                    </button>

                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        border: '1px dashed var(--accent)',
                        borderRadius: '4px',
                        background: 'rgba(0, 255, 255, 0.05)'
                    }}>
                        <small><strong>Current Status:</strong> Free Tier Operative</small>
                    </div>
                </div>
                {/* --- NEW: DANGER ZONE --- */}
                <div className={styles.dangerZone}>
                    <h4 className={styles.dangerTitle}>Danger Zone</h4>
                    <button
                        className={styles.deleteButton}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <span>⚠ DELETE OPERATIVE ACCOUNT</span>
                    </button>
                </div>
            </section>

            {/* --- Modals --- */}

            {/* 1. Social Avatar Warning Modal */}
            {showSocialWarning && (
                <Modal
                    title="EXTERNAL ACCOUNT LINK DETECTED"
                    onClose={() => setShowSocialWarning(false)}
                    actionLabel="Understood"
                >
                    <p>
                        Your account is currently linked to <strong>{user.app_metadata.provider == 'github' ? "GitHub" : "Discord"}</strong>.
                        To ensure identity consistency, your profile picture is synchronized with your social provider.
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                        Please update your profile picture directly on {user.app_metadata.provider == 'github' ? "GitHub" : "Discord" } to see changes reflected here.
                    </p>
                </Modal>
            )}

            {/* 2. Commerce Coming Soon Modal */}
            {showCommerceWarning && (
                <Modal
                    title="SYSTEM MAINTENANCE"
                    onClose={() => setShowCommerceWarning(false)}
                    actionLabel="Acknowledge"
                >
                    <p>
                        The <strong>Shocked Future Commerce Grid</strong> is currently undergoing initialization.
                        Direct subscriptions and purchase history viewing are not yet online.
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                        Check back later. We are engineering the future as we speak.
                    </p>
                </Modal>
            )}

            {showDeleteConfirm && (
                <Modal
                    title="CRITICAL WARNING"
                    onClose={() => setShowDeleteConfirm(false)}
                    actionLabel={isDeleting ? "DELETING..." : "CONFIRM DELETION"}
                    onAction={handleDeleteAccount}
                    isDestructive={true}
                >
                    <p><strong>This action is irreversible.</strong></p>
                    <p style={{ marginTop: '0.5rem' }}>
                        Deleting your account will permanently erase your identity, purchase history, and game licenses from the Enigma database. Any active subscriptions linked to this account will also be terminated.
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                        Are you sure you want to proceed?
                    </p>
                </Modal>
            )}

        </div>
    );
}