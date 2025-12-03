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
}

// Fetch all posts from Sanity (Static/Server-side fetching)
async function getPosts(): Promise<PostSummary[]> {
    // GROQ query to retrieve essential data for the list view
    const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    isDevLog // The paywall flag
  }`;
    // Cache the fetch to ensure fast loading on subsequent requests
    const posts = await sanityClient.fetch(query, {}, { next: { revalidate: 3600 } });
    return posts;
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