import Link from 'next/link';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] text-zinc-900 dark:text-zinc-300 font-sans p-4 sm:p-6 md:p-12 transition-colors duration-500">
      <div className="max-w-3xl mx-auto mt-2 md:mt-8">
        
        <Link href="/" className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 md:mb-8 group">
          <div className="p-1.5 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 group-hover:border-zinc-400 dark:group-hover:border-white/30 transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          Back to Vybecheck
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white mb-6 md:mb-10 drop-shadow-sm px-1">
          Rules & Policies
        </h1>
        
        <div className="space-y-4 sm:space-y-6 md:space-y-8 text-xs sm:text-sm leading-relaxed px-1">
          <section className="bg-white dark:bg-[#18181b] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-fuchsia-500 mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl shrink-0">🎮</span> 1. Virtual Currency Only
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Vybecheck is a social prediction game. <strong>All "USDC" balances displayed on this platform are strictly virtual and possess zero real-world monetary value.</strong> You cannot deposit real fiat or cryptocurrency into Vybecheck, nor can you withdraw the virtual USDC balance. The virtual balance is used solely for scorekeeping, entertainment, and educational purposes.
            </p>
          </section>

          <section className="bg-white dark:bg-[#18181b] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-orange-500 mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl shrink-0">🏆</span> 2. Season XP & Leaderboard
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Players earn <strong>Season XP</strong> based on their trading volume and profitability using virtual USDC. At the end of specific promotional periods (Seasons), Vybecheck may, at its sole discretion, reward top-ranking players with promotional airdrops. These airdrops are a free promotional reward, not a payout of user funds.
            </p>
          </section>

          <section className="bg-white dark:bg-[#18181b] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl shrink-0">⚖️</span> 3. Market Resolution
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Markets resolve based on the criteria specified in the "Resolution Rules" section of each Vybecard. Admins strive for complete accuracy and neutrality. In the event of a dispute or ambiguous real-world outcome, Vybecheck reserves the right to resolve the market based on consensus or void the market entirely, returning all virtual stakes.
            </p>
          </section>

          <section className="bg-white dark:bg-[#18181b] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl shrink-0">🛡️</span> 4. Compliance & Usage
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              By using Vybecheck, you agree that you are participating in a free-to-play social game. Because no real money is wagered, Vybecheck is not a gambling platform, real-money prediction market, or financial exchange. 
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}