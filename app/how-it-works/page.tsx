import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex flex-col items-center py-12 px-4 transition-colors duration-500 font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-8 md:p-12 shadow-xl">
        <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest mb-8 inline-block transition-colors">← Back to Vybecheck</Link>
        
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="text-4xl">⚡</span> How it Works
        </h1>
        
        <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
          <p>Vybecheck is built as a next-generation prediction market interface. Our goal is to provide lightning-fast executions with a seamless user experience.</p>
          
          <div className="p-6 bg-zinc-50 dark:bg-black/30 rounded-2xl border border-zinc-200 dark:border-white/5">
            <h3 className="text-zinc-900 dark:text-white font-black uppercase tracking-widest text-xs mb-3">Technology Stack</h3>
            <p>This application utilizes a modern tech stack including <strong>Next.js, React, and Tailwind CSS v4</strong>.</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-fuchsia-500/10 to-orange-500/10 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-500/20">
            <h3 className="text-fuchsia-600 dark:text-fuchsia-400 font-black uppercase tracking-widest text-xs mb-3">The Future (V2)</h3>
            <p className="text-zinc-800 dark:text-zinc-200">Future versions (V2) will integrate authentic Web3 wallets and decentralized oracles via smart contracts on Ethereum L2s.</p>
          </div>
        </div>
      </div>
    </main>
  );
}