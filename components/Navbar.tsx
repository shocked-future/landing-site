import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const navLinks = [
        { name: 'Catalog', href: '/catalog' },
      //  { name: 'About', href: '/about' },
     //   { name: 'Legal', href: '/legal/privacy' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo - Scaled down for Navbar */}
                <Link href="/" className="opacity-90 hover:opacity-100 transition-opacity">
                    <Image
                        src="/logo.svg"
                        alt="Shocked Future Studios Logo"
                        width={180} // Scaled down from 527
                        height={32} // Scaled down from 93
                        className="object-contain"
                        priority
                    />
                </Link>

                {/* Links */}
                <div className="flex gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}