'use client';

import Link from 'next/link';
import { useAppContext } from '../context';

export default function Terms() {
  const { isDarkMode, toggleDarkMode } = useAppContext();

  return (
    <main className="flex min-h-screen flex-col items-center font-sans bg-zinc-50 dark:bg-[#0e0e12] transition-colors duration-500">
      
      <div className="sticky top-0 z-50 w-full flex flex-col items-center px-4 md:px-8 pt-6 pb-4 bg-zinc-50/90 dark:bg-[#0e0e12]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 transition-colors duration-500">
        <div className="w-full max-w-3xl flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            BACK TO THE CHAOS
          </Link>
          <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm active:scale-95 transition-all text-black dark:text-white">
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col gap-10 py-12 px-6">
        <div className="mb-4">
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 dark:text-white mb-2">The Fine Print</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Rules, Tech & Keeping the Feds Away</p>
        </div>

        {/* SEKCE PRO MĚSÍČNÍ ODMĚNY - SJEDNOCENO S FAQ */}
        <section id="rewards" className="scroll-mt-32">
          <h2 className="text-xl font-black uppercase italic text-yellow-500 mb-4 flex items-center gap-2"><span className="text-2xl">💰</span> The Bag (Airdrops)</h2>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6 rounded-2xl text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed space-y-3 font-medium shadow-sm">
            <p>Every 14 days, the simulation resets. We snapshot the Leaderboard, and the <strong>Top 3 degens with the most Season XP</strong> get blessed with a real USDC Airdrop directly to their connected wallets.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>+1 XP:</strong> Earned for every 1 virtual USDC traded (just for being in the game).</li>
              <li><strong>+10 XP:</strong> Bonus points farmed for every 1 USDC of net profit from winning trades.</li>
            </ul>
            <p className="mt-3 text-xs italic text-zinc-500">Note: Sybil attacking, wash trading, or using multiple wallets to farm XP will result in your bag getting nuked and an instant ban.</p>
          </div>
        </section>

        <section id="technology" className="scroll-mt-32">
          <h2 className="text-xl font-black uppercase italic text-fuchsia-500 mb-4 flex items-center gap-2"><span className="text-2xl">⚡</span> The Engine</h2>
          <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed space-y-3 font-medium">
            <p>Vybecheck is built to be the fastest way to trade internet chaos. Right now, we're running a slick Next.js, React, and Tailwind v4 stack to keep the UX lightning fast.</p>
            <p>Future versions (V2) will go full degen—integrating Web3 wallets, decentralized oracles, and smart contracts on Ethereum L2s for completely trustless resolution.</p>
          </div>
        </section>

        <section id="policies" className="scroll-mt-32">
          <h2 className="text-xl font-black uppercase italic text-orange-500 mb-4 flex items-center gap-2"><span className="text-2xl">⚖️</span> Don't Be Toxic</h2>
          <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed space-y-3 font-medium">
            <p>We want a pure, unmanipulated market of internet culture. All market data and receipts are sourced publicly so everyone plays on a level field.</p>
            <p>Play the game in good faith. Any attempts to bot the platform, exploit MVP mechanics, or spam the chat will get you instantly liquidated and permanently banned from the beta.</p>
          </div>
        </section>

        <section id="rules" className="scroll-mt-32">
          <h2 className="text-xl font-black uppercase italic text-green-500 mb-4 flex items-center gap-2"><span className="text-2xl">📜</span> How The Game Works</h2>
          <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed space-y-2 font-medium">
            <li><strong>The Receipts:</strong> Markets resolve strictly based on the criteria listed in the specific market's description. We deal in facts, not feelings.</li>
            <li><strong>The Clock:</strong> If an event does not explicitly occur before the stated deadline, the market automatically resolves to <strong>NO VYBE</strong>.</li>
            <li><strong>The Payoff:</strong> Winning shares print exactly 1.00 USDC. Losing shares go to 0.00 USDC. Buy the rumor, sell the news.</li>
          </ul>
        </section>

        <section id="legal" className="scroll-mt-32 pt-6 border-t border-zinc-200 dark:border-white/10">
          <h2 className="text-xl font-black uppercase italic text-zinc-900 dark:text-white mb-4">Legal Disclaimer (Pls Don't Sue)</h2>
          <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-2xl text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed space-y-3 font-medium">
            <p><strong>FAKE MONEY ONLY:</strong> This version of Vybecheck is a social prototype operating on simulated funds. The "USDC" referenced on this platform holds absolutely <strong>$0.00</strong> real-world value. You cannot deposit real fiat/crypto, and you cannot withdraw it. It exists purely for keeping score and claiming airdrops.</p>
            <p>By using this platform, you acknowledge that you are participating in a simulation. We are not a casino, not an exchange, and this is definitely not financial advice. Stay safe on the timeline.</p>
          </div>
        </section>
      </div>

    </main>
  );
}