export default function Privacy() {
    return (
        <main className="min-h-screen pt-32 px-6 max-w-4xl mx-auto pb-20">
            <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest">Privacy Protocols</h1>
            <div className="space-y-6 text-zinc-400 text-sm font-mono">
                <section>
                    <h2 className="text-white font-bold mb-2">1. DATA COLLECTION</h2>
                    <p>We collect minimal data necessary to operate the catalog services.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold mb-2">2. USER TRACKING</h2>
                    <p>Tracking is limited to session authentication via Supabase.</p>
                </section>
                <div className="pt-8 border-t border-zinc-800">
                    <p>Last Updated: 2024.10.01</p>
                </div>
            </div>
        </main>
    );
}