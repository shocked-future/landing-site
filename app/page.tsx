import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-6 overflow-hidden pt-32 pb-20">

      {/* Background Ambience (Optional) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black -z-10" />

      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-12">

        {/* HERO LOGO */}
        <div className="relative w-full max-w-[527px] aspect-[527/93]">
          <Image
            src="/logo.svg"
            alt="Shocked Future"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* The Motto */}
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-red-300">
            Shocked Future is shutting down.
          </h1>
          <p className="text-zinc-500 tracking-widest uppercase text-sm">
            I'm sorry, but it's for the best. 
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/catalog"
          className="group relative px-8 py-3 bg-zinc-100 text-black font-bold uppercase tracking-widest hover:bg-white transition-all"
        >
          Enter Catalog
          <span className="absolute inset-0 border border-white opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"></span>
        </Link>
      </div>
    </main>
  );
}
