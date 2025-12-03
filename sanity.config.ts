import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
// IMPORTANT: Adjust this import path to where you saved your schema files
import { schemaTypes } from './schema' 

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string
const dataset = 'production'

export default defineConfig({
  basePath: '/studio', // Defines the route where the studio will live
  name: 'default',
  title: 'Shocked Future Studio',

  projectId,
  dataset,

  plugins: [
    deskTool(),
    // Optional: Vision tool for querying your data
    visionTool({ defaultApiVersion: 'v2023-05-03' }), 
  ],

  schema: {
    types: schemaTypes,
  },
})

// NOTE: You need to create a simple 'schemas/index.js' or 'schemas/index.ts' 
// that exports all your schemas (like post.js) as an array for the line above to work.
// Example: export const schemaTypes = [post]