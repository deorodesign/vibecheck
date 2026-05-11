'use client';
import React from 'react';
import Link from 'next/link';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] text-zinc-900 dark:text-zinc-300 font-sans p-4 sm:p-6 md:p-12 transition-colors duration-500">
      <div className="max-w-3xl mx-auto mt-2 md:mt-8">
        
        <Link href="/" className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 md:mb-8 group">
          <div className="p-1.5 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 group-hover:border-zinc-400 dark:group-hover:border-white/30 transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          Back to the Timeline
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white mb-6 md:mb-10 drop-shadow-sm px-1">
          The House Rules
        </h1>
        
        <div className="space-y-4 sm:space-y-6 md:space-y-8 text-xs sm:text-sm leading-relaxed px-1">
          <section className="bg-white dark:bg-[#18181b] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-fuchsia-500 mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl shrink-0">🛑</span> 1. Fake Money, Real Feds
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Let's get this straight so the three-letter agencies stay away: Vybecheck is a free-to-play prediction game. <strong>All "USDC" balances you trade with are strictly virtual and have ZERO real-world value.</strong> You cannot deposit real fiat or crypto, and you can't withdraw your virtual bankroll. It's strictly for farming clout, proving you can read the chaos, and keeping score.
            </p>
          </section>

          <section className="bg-white dark:bg-[#18181b] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-orange-500 mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl shrink-0">🏆</span> 2. XP, Clout & Airdrops
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              You farm <strong>Season XP</strong> by trading volume and printing profit with virtual USDC. At the end of every Season (14 days), the top degens on the Leaderboard get blessed with real USDC airdrops. These airdrops are promotional rewards sent straight from our treasury, NOT a payout of your virtual funds. Play smart, take the bag.
            </p>
          </section>

          <section className="bg-white dark:bg-[#18181b] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl shrink-0">🔨</span> 3. The Admin is God
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Markets resolve strictly based on the "Resolution Rules" written on each card. We look for concrete receipts to determine the outcome. If the timeline gets too blurry, a dispute breaks out, or the simulation glitches, Vybecheck admins reserve the right to rule based on consensus or just void the market entirely (refunding everyone's bags). Our word is final.
            </p>
          </section>

          <section className="bg-white dark:bg-[#18181b] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl shrink-0">⚖️</span> 4. Not a Casino
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              By logging in, you agree you're here to play a social game. Because you literally cannot deposit or wager real money, Vybecheck is NOT a gambling platform, NOT an unlicensed exchange, and definitely NOT financial advice. Don't be an idiot, just have fun predicting the timeline.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}