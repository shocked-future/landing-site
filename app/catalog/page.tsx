import { createClient } from "@supabase/supabase-js";
import Image from 'next/image';
const supabaseUrl = "https://iktupvqdixstntwippyx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdHVwdnFkaXhzdG50d2lwcHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTM2MDUsImV4cCI6MjA4MDg2OTYwNX0.0kuKULP_0quY2TIufPzQQ_MS9hNXFRLsXJq4XbMEwwo";
// Your exact interface
type Game = {
    id: number;
    title: string;
    description: string;
    status: string;
    image: string | null;
    purchase_url: string | null;
    disable_purchase: boolean;
    version: string | null;
    devlog_link: string | null;
};

export default async function CatalogPage() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch all games, ordered by ID (or you could change to title/status)
    const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('id', { ascending: true }); // Mimics old site ordering

    if (error) {
        console.error('Error fetching games:', error);
        return <div className="pt-32 text-center text-red-500 font-mono">ERR: DATABASE_CONNECTION_REFUSED</div>;
    }

    return (
        <main className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto">

            {/* Header */}
            <header className="mb-16 border-b border-white/10 pb-8 flex justify-between items-end">
                <div>

                    <Image
                        src="/logo.svg"
                        alt="Shocked Future"
                        width={240}
                        height={60}
                        className="object-contain drop-shadow-2xl mb-2"
                        priority
                    />
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Our Games.</h1>
                </div>
                {/* Optional total count */}
                <div className="text-zinc-600 font-mono text-xs hidden md:block">
                    ENTRIES: {games?.length || 0}
                </div>
            </header>

            {/* The List */}
            <div className="space-y-12">
                {games?.map((game) => (
                    <article
                        key={game.id}
                        className="group relative grid grid-cols-1 md:grid-cols-12 gap-8 p-6 glass-panel rounded-sm hover:border-white/20 transition-all duration-500"
                    >

                        {/* Column 1: Image (Span 5) */}
                        <div className="md:col-span-5 relative aspect-video bg-zinc-900 border border-white/5 overflow-hidden">
                            {game.image ? (
                                <Image
                                    src={game.image}
                                    alt={game.title}
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-xs">
                                    [NO_IMG_DATA]
                                </div>
                            )}

                            {/* Status Badge overlay */}
                            <div className="absolute top-2 left-2 bg-black/90 backdrop-blur px-2 py-1 border border-white/10">
                                <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">
                                    {game.status}
                                </span>
                            </div>
                        </div>

                        {/* Column 2: Details (Span 7) */}
                        <div className="md:col-span-7 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-white tracking-wide transition-colors">
                                    {game.title}
                                </h2>
                                {game.version && (
                                    <span className="font-mono text-xs text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded-full">
                                        v{game.version}
                                    </span>
                                )}
                            </div>

                            <p className="text-zinc-400 leading-relaxed flex-grow text-sm mb-8">
                                {game.description}
                            </p>

                            {/* Action Area */}
                            <div className="mt-auto border-t border-white/5 pt-6 flex items-center justify-between">
                                {/* LEFT SIDE: Devlog Link (if exists) */}
                                {game.devlog_link && (
                                    <a
                                        href={game.devlog_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:bg-[#F44A22] hover:text-white hover:font-extrabold transition-colors flex items-center gap-2 border border-[#F44A22] px-4 py-2 rounded-lg"
                                    >
                                        <span className="w-1.5 h-1.5 bg-zinc-400 group-hover:bg-white rounded-full current-color" />
                                        Read Devlog
                                    </a>
                                )}

                                {/* RIGHT SIDE: Purchase / Archive Button */}
                                <div className="ml-auto">
                                    {game.disable_purchase ? (
                                        <button disabled className="px-6 py-2 bg-zinc-900 text-zinc-600 cursor-not-allowed font-mono text-sm border border-zinc-800">
                                            Unavailable
                                        </button>
                                    ) : (
                                        game.purchase_url ? (
                                            <a
                                                href={game.purchase_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-6 py-2 bg-white text-black font-bold uppercase text-sm tracking-widest hover:bg-blue-400 transition-colors"
                                            >
                                                Access Game
                                            </a>
                                        ) : (
                                            <button disabled className="inline-flex items-center px-6 py-2 bg-zinc-900  font-mono uppercase text-sm tracking-widest hover:bg-blue-400 transition-colors">
                                                PENDING LINK
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {(!games || games.length === 0) && (
                <div className="text-center py-20 border border-dashed border-zinc-800">
                    <p className="text-zinc-500 font-mono">NO ENTRIES FOUND IN DATABASE.</p>
                </div>
            )}
        </main>
    );
}