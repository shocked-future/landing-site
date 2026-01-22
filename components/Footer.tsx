import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black pt-16 pb-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

                {/* Brand & Copyright */}
                <div className="space-y-2">
                    <h3 className="text-white font-bold tracking-widest uppercase">Shocked Future</h3>
                    <p className="text-zinc-600 text-xs">
                        © {new Date().getFullYear()} Shocked Future Studios. <br />
                        All Rights Reserved.
                    </p>
                </div>

                {/* Patreon CTA - High Contrast */}

            </div>
        </footer>
    );
}