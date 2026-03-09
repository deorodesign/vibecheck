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
            BACK TO FEED
          </Link>
          <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm active:scale-95 transition-all text-black dark:text-white">
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col gap-10 py-12 px-6">
        <div className="mb-4">
          <h1 className="text-4xl font-black uppercase italic text-zinc-900 dark:text-white mb-2">Platform Info</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Legal, Rules & Technology</p>
        </div>

        {/* NOVÁ SEKCE PRO MĚSÍČNÍ ODMĚNY */}
        <section id="rewards" className="scroll-mt-32">
          <h2 className="text-xl font-black uppercase italic text-yellow-500 mb-4 flex items-center gap-2"><span className="text-2xl">🏆</span> Monthly Rewards</h2>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6 rounded-2xl text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed space-y-3 font-medium shadow-sm">
            <p>Every month, we snapshot the Season Leaderboard. The <strong>Top 5 users with the most XP Points</strong> will receive an exclusive USDC Airdrop directly to their connected wallets.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>+10 XP:</strong> Earned for every 1 USDC wagered.</li>
              <li><strong>+500 XP:</strong> Bonus points earned for every successful winning position.</li>
            </ul>
            <p className="mt-3 text-xs italic text-zinc-500">Note: Wash trading or using multiple wallets to manipulate XP points will result in disqualification from the monthly airdrop.</p>
          </div>
        </section>

        <section id="technology" className="scroll-mt-32">
          <h2 className="text-xl font-black uppercase italic text-fuchsia-500 mb-4 flex items-center gap-2"><span className="text-2xl">⚡</span> Technology</h2>
          <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed space-y-3 font-medium">
            <p>Vybecheck is built as a next-generation prediction market interface. Our goal is to provide lightning-fast executions with a seamless user experience.</p>
            <p>This application utilizes a modern tech stack including Next.js, React, and Tailwind CSS v4. Future versions (V2) will integrate Web3 wallets and decentralized oracles via smart contracts on Ethereum L2s.</p>
          </div>
        </section>

        <section id="policies" className="scroll-mt-32">
          <h2 className="text-xl font-black uppercase italic text-orange-500 mb-4 flex items-center gap-2"><span className="text-2xl">⚖️</span> Policies</h2>
          <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed space-y-3 font-medium">
            <p>We are committed to maintaining a fair, transparent, and manipulation-free environment. All market data is sourced publicly.</p>
            <p>Users are expected to engage in good faith. Any attempts to manipulate chat features, exploit MVP testing mechanics, or spoof balances will result in account bans during the beta phase.</p>
          </div>
        </section>

        <section id="rules" className="scroll-mt-32">
          <h2 className="text-xl font-black uppercase italic text-green-500 mb-4 flex items-center gap-2"><span className="text-2xl">📜</span> Trading Rules</h2>
          <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed space-y-2 font-medium">
            <li><strong>Resolution Source:</strong> Markets resolve strictly based on the criteria listed in the specific market's description.</li>
            <li><strong>Deadlines:</strong> If an event does not explicitly occur before the stated deadline, the market automatically resolves to <strong>NO VYBE</strong>.</li>
            <li><strong>Payouts:</strong> Winning shares are paid out at exactly 1.00 USDC per share. Losing shares go to 0.00 USDC.</li>
          </ul>
        </section>

        <section id="legal" className="scroll-mt-32 pt-6 border-t border-zinc-200 dark:border-white/10">
          <h2 className="text-xl font-black uppercase italic text-zinc-900 dark:text-white mb-4">Legal Disclaimer</h2>
          <div className="bg-zinc-100 dark:bg-white/5 p-6 rounded-2xl text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed space-y-3 font-medium">
            <p><strong>MVP PROTOTYPE ONLY:</strong> This version of Vybecheck operates on testnet/simulated funds. The "USDC" referenced on this platform holds $0.00 real-world value and cannot be withdrawn, traded, or redeemed for fiat currency.</p>
            <p>By using this platform, you acknowledge that you are participating in a simulated environment. We do not assume liability for any financial decisions made based on the data presented on this prototype.</p>
          </div>
        </section>
      </div>

    </main>
  );
}