import Link from 'next/link';

export default function RewardsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex flex-col items-center py-12 px-4 transition-colors duration-500 font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-8 md:p-12 shadow-xl">
        <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest mb-8 inline-block transition-colors">← Back to Vybecheck</Link>
        
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="text-4xl">🏆</span> Airdrops & Rewards
        </h1>
        
        <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
          <p>Every month, we snapshot the Season Leaderboard. The <strong className="text-zinc-900 dark:text-white">Top 5 users with the most XP Points</strong> will receive an exclusive USDC Airdrop directly to their connected wallets.</p>
          
          <ul className="space-y-4 p-6 bg-zinc-50 dark:bg-black/30 rounded-2xl border border-zinc-200 dark:border-white/5">
            <li className="flex items-center gap-3"><span className="text-green-500 font-black">+10 XP</span> Earned for every 1 USDC wagered.</li>
            <li className="flex items-center gap-3"><span className="text-fuchsia-500 font-black">+500 XP</span> Bonus points earned for every successful winning position.</li>
          </ul>
          
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">
            <strong className="uppercase tracking-widest block mb-1 text-xs">Note:</strong> 
            Wash trading or using multiple wallets to manipulate XP points will result in disqualification from the monthly airdrop.
          </div>
        </div>
      </div>
    </main>
  );
}