'use client';

import { useAuth } from '@/context/AuthContext'; // Import hook
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, loading } = useAuth(); // Get user and loading state

    return (
        <nav className={styles.navbar}>
            <div className={styles.navLinks}>
                <Link href="/" className={styles.navLink}>
                    Home
                </Link>
                <Link href="/about" className={styles.navLink}>
                    About
                </Link>
                <Link href="/games" className={styles.navLink}>
                    Our Games
                </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                {/* Dynamic Auth Links */}
                {!loading && (
                    <>
                        {user ? (
                            <Link href="/profile" className={styles.authLinks}>
                                Profile
                            </Link>
                        ) : (
                            <Link href="/login" className={styles.authLinks}>
                                Login
                            </Link>
                        )}
                    </>
                )}
            </div>
        </nav>
    );
}