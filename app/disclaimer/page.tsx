import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex flex-col items-center py-12 px-4 transition-colors duration-500 font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-8 md:p-12 shadow-xl">
        <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest mb-8 inline-block transition-colors">← Back to Vybecheck</Link>
        
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="text-4xl">⚠️</span> Legal Disclaimer
        </h1>
        
        <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
          <div className="p-6 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-200 dark:border-orange-500/30">
            <h3 className="text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest text-sm mb-3">MVP PROTOTYPE ONLY</h3>
            <p className="text-zinc-800 dark:text-zinc-200">This version of Vybecheck operates on testnet/simulated funds. The "USDC" referenced on this platform holds <strong>$0.00 real-world value</strong> and cannot be withdrawn, traded, or redeemed for fiat currency.</p>
          </div>

          <p>By using this platform, you acknowledge that you are participating in a simulated environment. We do not assume liability for any financial decisions made based on the data presented on this prototype.</p>
        </div>
      </div>
    </main>
  );
}