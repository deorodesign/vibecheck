'use client';

import Link from 'next/link';
import { useAppContext, MARKETS } from '../context';

export default function AdminPanel() {
  const { marketStatus, resolveMarket, isDarkMode } = useAppContext();

  return (
    <main className={`flex min-h-screen flex-col items-center p-8 font-sans ${isDarkMode ? 'bg-[#0e0e12] text-white' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-500`}>
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black uppercase italic text-fuchsia-500">🔒 Secret Admin Panel</h1>
          <Link href="/" className="px-4 py-2 bg-zinc-800 text-white rounded-xl font-bold text-xs">Back to App</Link>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-6 rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-xl">
          <h2 className="text-xl font-bold mb-6">Resolve Markets (Simulate Oracle)</h2>
          
          <div className="flex flex-col gap-4">
            {MARKETS.map(market => {
              const status = marketStatus[market.id];
              
              return (
                <div key={market.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-white/5">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <img src={market.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                    <span className="font-bold text-sm max-w-[250px]">{market.title}</span>
                  </div>
                  
                  {status ? (
                    <div className="px-4 py-2 bg-zinc-200 dark:bg-white/10 rounded-lg text-xs font-bold uppercase">
                      Resolved: <span className={status === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{status}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => resolveMarket(market.id, 'VYBE')} className="px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 rounded-lg text-xs font-bold uppercase hover:bg-green-500 hover:text-white transition-colors">
                        Set VYBE
                      </button>
                      <button onClick={() => resolveMarket(market.id, 'NO_VYBE')} className="px-4 py-2 bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-colors">
                        Set NO VYBE
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  );
}