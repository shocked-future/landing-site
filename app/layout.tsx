import type { Metadata } from 'next';
import { Host_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from '@next/third-parties/google'
import { AuthProvider } from '@/context/AuthContext';
import { GoogleAdSense } from '@/components/GoogleAdsense';


const inter = Host_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shocked Future',
  description: 'Reengineering yesterday\'s classics for tomorrow\'s gamers.',
  openGraph: {
    title: 'Shocked Future',
    description: 'Reengineering yesterday\'s classics for tomorrow\'s gamers.',
    url: 'https://www.shockedfuturestudios.com',
    siteName: 'Shocked Future',
    images: [
      {
        url: 'https://www.shockedfuturestudios.com/opengraph.png',
        width: 3840,
        height: 2160,
        alt: 'Shocked Future Open Graph Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAdSense />
      </head>
      <body className={inter.className}>

        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
            <SpeedInsights />
          </div>
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId="G-WWJDEHC05F" />

    </html>
  );
}