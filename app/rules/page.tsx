import Link from 'next/link';

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex flex-col items-center py-12 px-4 transition-colors duration-500 font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-8 md:p-12 shadow-xl">
        <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest mb-8 inline-block transition-colors">← Back to Vybecheck</Link>
        
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
          <span className="text-4xl">⚖️</span> Rules & Policies
        </h1>
        
        <div className="space-y-8 text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase mb-4">📜 Trading Rules</h2>
            <ul className="space-y-4 p-6 bg-zinc-50 dark:bg-black/30 rounded-2xl border border-zinc-200 dark:border-white/5">
              <li><strong className="text-zinc-900 dark:text-zinc-200">Resolution Source:</strong> Markets resolve strictly based on the criteria listed in the specific market's description.</li>
              <li><strong className="text-zinc-900 dark:text-zinc-200">Deadlines:</strong> If an event does not explicitly occur before the stated deadline, the market automatically resolves to <strong className="text-red-500">NO VYBE</strong>.</li>
              <li><strong className="text-zinc-900 dark:text-zinc-200">Payouts:</strong> Winning shares are paid out at exactly 1.00 USDC per share. Losing shares go to 0.00 USDC.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase mb-4">🤝 General Policies</h2>
            <p className="mb-3">We are committed to maintaining a fair, transparent, and manipulation-free environment. All market data is sourced publicly.</p>
            <p>Users are expected to engage in good faith. Any attempts to manipulate chat features, exploit MVP testing mechanics, or spoof balances will result in account bans during the beta phase.</p>
          </section>
        </div>
      </div>
    </main>
  );
}