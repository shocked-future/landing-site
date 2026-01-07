import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-6 overflow-hidden pt-32 pb-20">

      {/* Background Ambience (Optional) */}
      <div className="absolute inset-0 bg-white -z-10" />

      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-12">

        {/* Shutdown Message */}
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-gray-400">
            Shocked Future is shutting down.
          </h1>
        </div>
      </div>
    </main>
  );
}
