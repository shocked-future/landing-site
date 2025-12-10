import type { Metadata } from "next";
import { Host_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from '@next/third-parties/google'

const groteskSans = Host_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shocked Future",
  description: "Reengineering yesterday's classics for tomorrow's gamers. We rebuilt the worlds you forgot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${groteskSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
        <GoogleAnalytics gaId="G-WWJDEHC05F" />
      </body>
    </html>
  );
}
