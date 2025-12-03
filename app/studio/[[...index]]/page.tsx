'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'
import Head from 'next/head'

// This component renders the Sanity Studio at the /studio route
export default function StudioPage() {
    return (
        // We apply inline styles to ensure the Studio component takes up 
        // the full viewport height and width, overriding any parent layout styling.
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999, // Ensure it sits on top of all other app elements
            overflow: 'auto', // Important for responsiveness
        }}>
            <Head>
                <title>Shocked Future CMS</title>
                <meta name="robots" content="noindex" />
            </Head>
            <NextStudio config={config} />
        </div>
    )
}