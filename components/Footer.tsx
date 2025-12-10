import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black pt-16 pb-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

                {/* Brand & Copyright */}
                <div className="space-y-2">
                    <h3 className="text-white font-bold tracking-widest uppercase">Shocked Future</h3>
                    <p className="text-zinc-600 text-xs">
                        © {new Date().getFullYear()} Shocked Future <br />
                        All Rights Reserved.
                    </p>
                </div>

                {/* Patreon CTA - High Contrast */}
                <div className="flex flex-col items-start md:items-end gap-4">
                    <p className="text-zinc-500 text-sm uppercase tracking-widest">
                        Support the architecture
                    </p>
                    <a
                        href="https://www.patreon.com/ShockedFuture"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-5 py-2 border border-zinc-800 bg-zinc-900/50 hover:bg-[#FF424D]/10 hover:border-[#FF424D]/50 transition-all duration-300"
                    >
                        {/* Simple Patreon Icon (or generic heart/star) */}
                        <div className="w-2 h-2 bg-[#FF424D] rounded-full group-hover:shadow-[0_0_10px_#FF424D] transition-all" />
                        <span className="text-zinc-300 group-hover:text-white font-mono text-sm">
                            BECOME A PATRON
                        </span>
                    </a>
                </div>
            </div>
        </footer>
    );
}