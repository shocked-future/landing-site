export default function About() {
    return (
        <main className="min-h-screen pt-32 px-6 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 tracking-tighter">ABOUT SHOCKED FUTURE</h1>
            <div className="prose prose-invert prose-lg text-zinc-400">
                <p>
                    We are not creators; we are restorers. Shocked Future was founded on a simple premise:
                    great worlds do not die, they simply become incompatible.
                </p>
                <p>
                    Our team of engineers specializes in reverse-engineering legacy codebases, upscaling
                    forgotten assets, and deploying them for modern hardware architectures.
                </p>
                <blockquote className="border-l-2 border-white pl-4 italic text-zinc-300 my-8">
                    "Reengineering yesterday's classics for tomorrow's gamers."
                </blockquote>
            </div>
        </main>
    );
}