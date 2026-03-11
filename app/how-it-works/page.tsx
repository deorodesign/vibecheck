import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex flex-col items-center py-12 px-4 transition-colors duration-500 font-sans">
      <div className="w-full max-w-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 md:p-12 shadow-xl">
        <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest mb-8 inline-block transition-colors">← Back to Vybecheck</Link>
        
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-4">
          Vybecheck 101
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-10 text-sm md:text-base">The idiot-proof guide to trading culture, drama, and internet history.</p>
        
        <div className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          
          <section className="p-6 md:p-8 bg-zinc-50 dark:bg-black/30 rounded-3xl border border-zinc-200 dark:border-white/5">
            <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4">1. The Basics: Yes or No?</h2>
            <p className="mb-6 font-medium">Every market on Vybecheck is a simple question. All you have to do is predict the outcome.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                <h3 className="text-green-600 dark:text-green-400 font-black italic uppercase text-lg mb-2">VYBE = YES</h3>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">You believe the event <strong>WILL</strong> happen. You are betting "Yes".</p>
              </div>
              <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <h3 className="text-red-600 dark:text-red-400 font-black italic uppercase text-lg mb-2">NO VYBE = NO</h3>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">You believe the event <strong>WILL NOT</strong> happen. You are betting "No".</p>
              </div>
            </div>
          </section>

          <section className="p-6 md:p-8 bg-white dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[50px]"></div>
            <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4 relative z-10">2. The Math: Prices & Probabilities</h2>
            <p className="mb-4 font-medium relative z-10">See those percentages on the screen (like 73% vs 27%)? That is the current market price.</p>
            <ul className="list-disc pl-5 space-y-2 mb-4 font-medium text-sm relative z-10 text-zinc-600 dark:text-zinc-400">
              <li><strong>73% means a share costs 73¢ (0.73 USDC).</strong></li>
              <li>The percentage represents what the "crowd" thinks is the probability of the event happening.</li>
              <li>Prices always equal $1.00 when added together (73¢ + 27¢ = $1.00).</li>
            </ul>
          </section>

          <section className="p-6 md:p-8 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-black rounded-3xl border border-zinc-200 dark:border-white/5">
            <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4">3. Why does the price change?</h2>
            <p className="mb-4 font-medium">Just like the stock market, prices move based on <strong>supply and demand</strong>.</p>
            <div className="p-5 bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200 dark:border-white/5 text-sm font-medium">
              <span className="text-fuchsia-500 font-black uppercase mb-1 block">Example:</span>
              Imagine the market asks: <em>"Will TikTok be banned?"</em> The price of VYBE is 20¢.<br/><br/>
              Suddenly, a massive news story drops saying the ban is likely. Everyone rushes to buy VYBE shares. Because of the high demand, the price of VYBE shoots up from 20¢ to 80¢. <strong>If you bought early at 20¢, your shares are now worth way more!</strong>
            </div>
          </section>

          <section className="p-6 md:p-8 bg-zinc-900 dark:bg-black rounded-3xl border border-zinc-800 dark:border-white/10 text-white shadow-2xl">
            <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4">
              4. The Payoff: How you win
            </h2>
            <p className="mb-5 text-zinc-300 font-medium">When the deadline hits, the market "resolves" (closes) based on the official rules.</p>
            
            <div className="space-y-3 font-mono text-sm">
              <div className="p-4 bg-zinc-800 dark:bg-zinc-900 rounded-xl border border-zinc-700">
                If you are <strong className="text-green-400 font-sans uppercase">Right</strong>: Every winning share you hold cashes out at exactly <strong>$1.00 USDC</strong>.
              </div>
              <div className="p-4 bg-zinc-800 dark:bg-zinc-900 rounded-xl border border-zinc-700">
                If you are <strong className="text-red-400 font-sans uppercase">Wrong</strong>: Your losing shares become worth <strong>$0.00 USDC</strong>.
              </div>
            </div>
            
            <p className="mt-5 text-xs text-zinc-400 uppercase tracking-widest font-bold">
              The earlier you catch the vybe, the cheaper the shares, and the bigger the profit. Buy low, sell high.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}