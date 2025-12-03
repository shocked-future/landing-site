import { createClient } from '@sanity/client';
import { createImageUrlBuilder, ImageUrlBuilder } from '@sanity/image-url';

// Environment variables are accessed here
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
// Default Sanity dataset is 'production'
const dataset = 'production'; 
const apiVersion = '2023-05-03'; // Use a recent stable API version

if (!projectId) {
  throw new Error('Missing Sanity Project ID. Please set NEXT_PUBLIC_SANITY_PROJECT_ID in your .env.local file.');
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if you need real-time, non-cached data during development
});

// Helper for getting image URLs
const builder = createImageUrlBuilder(sanityClient);
export const urlFor = (source: any) => builder.image(source);