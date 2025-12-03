import Link from 'next/link';
import Image from 'next/image';
import { sanityClient, urlFor } from '@/lib/sanityClient';
import styles from './blog.module.css';

// Define the shape of the fetched data
interface PostSummary {
    _id: string;
    title: string;
    slug: { current: string };
    mainImage: any;
    publishedAt: string;
    isDevLog: boolean;
    isPinned?: boolean; // Added isPinned field
}

// Fetch all posts from Sanity (Static/Server-side fetching)
async function getPosts(): Promise<PostSummary[]> {
    // Query 1: Get Pinned Posts
    // We explicitly order them to ensure the "Welcome" post is always first 
    // if multiple posts were ever pinned (though we only expect one for now).
    const pinnedQuery = `*[_type == "post" && isPinned == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    isDevLog,
    isPinned
  }`;

    // Query 2: Get Regular Posts (not pinned)
    const regularQuery = `*[_type == "post" && (isPinned != true || !defined(isPinned))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    isDevLog,
    isPinned
  }`;

    // Fetch both queries concurrently
    const [pinnedPosts, regularPosts] = await Promise.all([
        sanityClient.fetch(pinnedQuery, {}, { next: { revalidate: 60 } }),
        sanityClient.fetch(regularQuery, {}, { next: { revalidate: 60 } }),
    ]);

    // Combine the lists: Pinned posts first, followed by regular posts
    const combinedPosts: PostSummary[] = [...pinnedPosts, ...regularPosts];

    return combinedPosts;
}

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Shocked Future // Comms</h1>
                <p className={styles.subtitle}>Studio updates, development logs, and feature deep-dives.</p>
            </div>

            <div className={styles.list}>
                {posts.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.8, padding: '2rem' }}>No posts have been published yet. Check back soon!</p>
                ) : (
                    posts.map((post) => (
                        <Link href={`/blog/${post.slug.current}`} key={post._id} className={styles.postCard}>
                            <div className={styles.postImageWrapper}>
                                {post.mainImage && (
                                    <Image
                                        // Use the urlFor helper to generate a responsive image URL
                                        src={urlFor(post.mainImage).width(800).height(450).url()}
                                        alt={post.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 800px"
                                    />
                                )}
                            </div>
                            <div className={styles.postContent}>
                                <h2 className={styles.postTitle}>
                                    {post.title}
                                    {post.isPinned && (
                                        <span className={styles.badge} style={{ marginRight: '0.75rem', background: '#ff4d4d', color: 'white' }}>📌 PINNED</span>
                                    )}
                                    {post.isDevLog && (
                                        <span className={styles.badge}>🔒 DEV LOG</span>
                                    )}
                                </h2>
                                <p className={styles.postMeta}>
                                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}