'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { sanityClient, urlFor } from '@/lib/sanityClient';
import { useAuth } from '@/context/AuthContext';
import { enigmaDB } from '@/lib/enigmaClient';
import styles from '../blog/blog.module.css';

// --- Types for Reusable Post Summary ---
interface PostSummary {
    _id: string;
    title: string;
    slug: { current: string };
    mainImage: any;
    publishedAt: string;
    isDevLog: boolean;
    isPinned?: boolean; // Ensure this is available if needed
}

// --- Components for Portable Text Rendering ---
const components = {
    block: {
        h2: ({ children }: any) => <h2 className={styles.postBody}>{children}</h2>,
        h3: ({ children }: any) => <h3 className={styles.postBody}>{children}</h3>,
        normal: ({ children }: any) => <p className={styles.postBody}>{children}</p>,
        blockquote: ({ children }: any) => <blockquote>{children}</blockquote>,
    },
    list: {
        bullet: ({ children }: any) => <ul className={styles.postBody} style={{ listStyleType: 'disc' }}>{children}</ul>,
        number: ({ children }: any) => <ol className={styles.postBody}>{children}</ol>,
    },
    listItem: {
        bullet: ({ children }: any) => <li style={{ marginBottom: '0.5rem' }}>{children}</li>,
    },
    marks: {
        link: ({ value, children }: any) => {
            const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
            return <a href={value?.href} target={target} rel={target === '_blank' ? 'noindex noopener' : undefined}>{children}</a>
        },
        // Add custom marks if needed
    }
};


// --- Paywall Component ---
const PaywallBlocker = () => (
    <div className={styles.paywall}>
        <div className={styles.paywallIcon}>🔒</div>
        <h2 className={styles.paywallTitle}>CLEARANCE LEVEL REQUIRED</h2>
        <p className={styles.paywallText}>
            This is a restricted Dev Log for 'Operative' tier subscribers and above.
            Upgrade your clearance to gain full access to this post and all future development insights.
        </p>
        <Link href="/subscribe" className={styles.paywallButton}>
            UPGRADE CLEARANCE
        </Link>
    </div>
);

// --- New: Related Posts Grid Component ---
const RelatedPostsGrid = ({ currentPostId }: { currentPostId: string }) => {
    const [relatedPosts, setRelatedPosts] = useState<PostSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRelatedPosts = useCallback(async () => {
        setLoading(true);
        try {
            // Query for the latest 3 posts, excluding the current one
            const query = `*[_type == "post" && _id != $currentPostId] | order(publishedAt desc)[0...3] {
        _id,
        title,
        slug,
        mainImage,
        publishedAt,
        isDevLog
      }`;
            // Use revalidate: 60 to prevent excessive re-fetches
            const posts = await sanityClient.fetch(query, { currentPostId }, { next: { revalidate: 60 } });
            setRelatedPosts(posts);
        } catch (error) {
            console.error("Failed to fetch related posts:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPostId]);

    useEffect(() => {
        if (currentPostId) {
            fetchRelatedPosts();
        }
    }, [currentPostId, fetchRelatedPosts]);

    if (loading || relatedPosts.length === 0) {
        return null; // Don't show the section if loading or empty
    }

    return (
        <section className={styles.relatedPostsSection}>
            <h2 className={styles.relatedPostsTitle}>More from the Shocked Future</h2>
            <div className={styles.relatedPostsGrid}>
                {relatedPosts.map((post) => (
                    <Link href={`/blog/${post.slug.current}`} key={post._id} className={styles.postCard}>
                        <div className={styles.postImageWrapper}>
                            {post.mainImage && (
                                <Image
                                    src={urlFor(post.mainImage).width(500).height(280).url()}
                                    alt={post.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, 300px"
                                />
                            )}
                        </div>
                        <div className={styles.postContent}>
                            <h3 className={styles.postTitle}>
                                {post.title}
                                {post.isDevLog && (
                                    <span className={styles.badge}>🔒 DEV LOG</span>
                                )}
                            </h3>
                            <p className={styles.postMeta}>
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                })}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
// --- End: Related Posts Grid Component ---

export default function PostPage() {
    const pathname = usePathname();
    const slug = pathname.split('/blog/')[1];

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [post, setPost] = useState<any>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. Check if the logged-in user has an active subscription
    const checkAccess = useCallback(async (isDevLog: boolean) => {
        if (!isDevLog) {
            setHasAccess(true); // Public post, all users have access
            return;
        }

        if (!user) {
            setHasAccess(false); // Locked post, but user is not logged in
            return;
        }

        try {
            // Fetch user's profile from Supabase
            const { data, error } = await enigmaDB
                .from('profiles')
                .select('subscription_tier, subscription_status')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            const tier = data?.subscription_tier;
            const status = data?.subscription_status;

            // Access is granted if they have an active paid subscription
            const hasPaidTier = status === 'active' &&
                (tier === 'operative' || tier === 'vanguard' || tier === 'specter');

            setHasAccess(hasPaidTier);

        } catch (error) {
            console.error("Failed to verify subscription:", error);
            setHasAccess(false);
        }
    }, [user]);

    // 2. Fetch the Post Content from Sanity
    const fetchPost = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const query = `*[_type == "post" && slug.current == $slug][0] {
        _id, title, slug, mainImage, publishedAt, body, isDevLog
      }`;
            // Use no-cache for the main post content as it's viewed on demand
            const postData = await sanityClient.fetch(query, { slug }, { cache: 'no-store' });

            if (!postData) {
                setLoading(false);
                return;
            }

            setPost(postData);

            // Immediately check access after fetching the post details
            await checkAccess(postData.isDevLog);

        } catch (error) {
            console.error("Failed to fetch post:", error);
        } finally {
            setLoading(false);
        }
    }, [slug, checkAccess]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    // Handle the case where the user is trying to access a restricted page without logging in
    // We can redirect them to login/signup before showing the paywall blocker
    useEffect(() => {
        if (!authLoading && !loading && !user && post?.isDevLog) {
            // Redirect to login, but keep the paywall logic for logged-in non-subs
            // router.push('/login'); // Optional: force login for restricted content
        }
    }, [authLoading, loading, user, post, router]);


    if (loading || authLoading) {
        return <div className={styles.container} style={{ textAlign: 'center' }}>Loading Transmission...</div>;
    }

    if (!post) {
        return <div className={styles.container} style={{ textAlign: 'center' }}>Post not found.</div>;
    }

    return (
        <article className={styles.container}>
            <header className={styles.postHeader}>
                <h1 className={styles.postTitleLarge}>{post.title}</h1>
                <p className={styles.postMetaLarge}>
                    <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                        })}
                    </time>
                    {post.isDevLog && (
                        <span className={styles.badge} style={{ background: 'var(--background-card)', border: '1px solid var(--accent)', marginLeft: '1rem' }}>
                            🔒 DEV LOG
                        </span>
                    )}
                </p>
            </header>

            {post.mainImage && (
                <div className={styles.mainImageWrapper}>
                    <Image
                        src={urlFor(post.mainImage).width(1200).height(675).url()}
                        alt={post.title || 'Main Image'}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </div>
            )}

            {/* Article Content - Restricted or Full */}
            <div className={styles.articleContent}>
                {(post.isDevLog && !hasAccess) ? (
                    <PaywallBlocker />
                ) : (
                    <div className={styles.postBody}>
                        <PortableText value={post.body} components={components} />
                    </div>
                )}
            </div>

            {/* New Section: Related Posts Grid */}
            <RelatedPostsGrid currentPostId={post._id} />

        </article>
    );
}