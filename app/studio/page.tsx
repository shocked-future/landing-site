'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'
import Head from 'next/head'

// This component renders the Sanity Studio at the /studio route
export default function StudioPage() {
    return (
        <>
            <Head>
                <title>Shocked Future Studio</title>
                <meta name="robots" content="noindex" />
            </Head>
            <NextStudio config={config} />
        </>
    )
}