'use client';
import React from 'react';
import Link from 'next/link';

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] text-zinc-900 dark:text-white font-sans p-4 md:p-10 transition-colors duration-500">
      <div className="max-w-3xl mx-auto space-y-8 mt-4 md:mt-0">
        
        <header className="w-full flex items-center justify-between mb-8 md:mb-12">
          <Link href="/" className="flex items-center gap-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </div>
            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest hidden sm:inline">Back to Markets</span>
          </Link>
          <h1 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter cursor-default italic">
            Airdrops & Rewards
          </h1>
        </header>

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">Real Stakes.</h2>
          <p className="text-zinc-500 font-medium max-w-xl mx-auto text-sm md:text-base">Trade with virtual USDC, prove your cultural intuition, and earn real money airdrops every 14 days.</p>
        </div>

        {/* PRIZE POOL CARD */}
        <div className="relative p-8 md:p-10 bg-gradient-to-br from-fuchsia-500/10 to-orange-500/10 border border-fuchsia-500/30 rounded-[2rem] text-center shadow-[0_0_40px_rgba(217,70,239,0.15)] overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="text-4xl md:text-5xl mb-4 block drop-shadow-lg">🏆</span>
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-2">Season Prize Pool (14 Days)</h3>
            <div className="text-4xl md:text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 mb-6 drop-shadow-sm">
              150 USDC
            </div>
            <p className="text-sm md:text-base font-bold text-zinc-700 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
              The Top 3 players on the Leaderboard at the end of the 14-day Season split the pool equally. <br/>
              <span className="text-fuchsia-500 font-black inline-block mt-3 text-lg md:text-xl border-b-2 border-fuchsia-500/30 pb-1">50 USDC EACH</span>
            </p>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-sm">
          <h3 className="text-lg md:text-xl font-black uppercase italic text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-white/5 pb-4">How to qualify</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center font-black text-fuchsia-500 shrink-0 border border-zinc-200 dark:border-white/5">1</div>
              <div>
                <h4 className="font-black text-sm md:text-base uppercase tracking-widest mb-1 text-zinc-900 dark:text-white">Earn Season XP</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">You get +1 XP for every 1 virtual USDC traded. You get a massive +10 XP for every 1 USDC of net profit from winning trades.</p>
              </div>
            </div>

            {/* EXPLICITNÍ BOD PRO SDÍLENÍ */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center font-black text-white shrink-0 shadow-md">!</div>
              <div>
                <h4 className="font-black text-sm md:text-base uppercase tracking-widest mb-1 text-zinc-900 dark:text-white">Share & Earn Daily Bonus</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">Boost your bankroll and rank! Hit the <strong className="text-zinc-700 dark:text-zinc-300">Share & Earn</strong> button and <strong className="text-fuchsia-500">actually post/send the link</strong> to your socials (X, Telegram, or WhatsApp) to instantly receive <strong className="text-green-500">+50 USDC</strong> and <strong className="text-fuchsia-500">+50 Season XP</strong>.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center font-black text-fuchsia-500 shrink-0 border border-zinc-200 dark:border-white/5">2</div>
              <div>
                <h4 className="font-black text-sm md:text-base uppercase tracking-widest mb-1 text-zinc-900 dark:text-white">Reach the Podium (Top 3)</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">Check the Leaderboard on the main page. The season resets every 14 days. If you hold the 1st, 2nd, or 3rd spot when the clock strikes, you win.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center font-black text-fuchsia-500 shrink-0 border border-zinc-200 dark:border-white/5">3</div>
              <div>
                <h4 className="font-black text-sm md:text-base uppercase tracking-widest mb-1 text-zinc-900 dark:text-white">Save Payout Wallet</h4>
                <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">Go to your Profile and save your EVM (0x...) or Solana wallet address. This is where we will manually send the real USDC airdrop.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-8">
          <Link href="/" className="flex-1 text-center bg-zinc-900 text-white dark:bg-white dark:text-black font-black px-8 py-4 rounded-xl uppercase tracking-widest text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-transform shadow-lg">
            Start Trading
          </Link>
          <Link href="/profile" className="flex-1 text-center bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 font-black px-8 py-4 rounded-xl uppercase tracking-widest text-[10px] md:text-xs hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95 transition-colors">
            Set Payout Wallet
          </Link>
        </div>

      </div>
    </div>
  );
}