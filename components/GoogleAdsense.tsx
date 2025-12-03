import Script from 'next/script';

export const GoogleAdSense = () => {
    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8877520320146539`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
};

