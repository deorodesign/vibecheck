'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Cesta k tvé Supabase
import { useAppContext } from '../../context';

// OPRAVA: params je nyní Promise (novinka v Next.js)
export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  // Rozbalíme params pomocí React.use()
  const resolvedParams = React.use(params);
  const userName = decodeURIComponent(resolvedParams.id);
  
  const { markets } = useAppContext();
  
  const [userBets, setUserBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Active' | 'Closed'>('Active');

  useEffect(() => {
    const fetchUserStats = async () => {
      // V reálu bychom stahovali sázky podle user_address, ale pro prototyp hledáme podle jména
      const { data } = await supabase.from('bets').select('*');
      if (data) {
        // Vyfiltrujeme sázky tohoto konkrétního uživatele
        const filteredBets = data.filter(b => b.user_address === userName || b.user_name === userName);
        setUserBets(filteredBets);
      }
      setLoading(false);
    };
    fetchUserStats();
  }, [userName]);

  // Prototypové výpočty (pokud uživatel nemá sázky, ukážeme nuly)
  const predictionsCount = userBets.length;
  const positionsValue = userBets.filter(b => b.status === 'pending' || !b.status).reduce((acc, curr) => acc + Number(curr.amount), 0);
  const biggestWin = userBets.filter(b => b.status === 'won').reduce((max, curr) => Math.max(max, Number(curr.payout || 0)), 0);
  
  // Rozdělení do tabů
  const activePositions = userBets.filter(b => b.status === 'pending' || !b.status);
  const closedPositions = userBets.filter(b => b.status === 'won' || b.status === 'lost');

  const displayBets = activeTab === 'Active' ? activePositions : closedPositions;

  if (loading) {
    return <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center"><div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <main className="min-h-screen bg-[#0e0e12] text-white font-sans selection:bg-fuchsia-500/30">
      {/* Header s návratem */}
      <div className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0e0e12]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-black text-xl uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500">Vybecheck</Link>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">← Back to Markets</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-6">
        
        {/* HORNÍ PANELY (Profil + Graf) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Levý panel: Profilovka a základní stats */}
          <div className="bg-[#161618] rounded-[2rem] p-8 border border-white/5 shadow-lg flex flex-col justify-between">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-400 via-pink-500 to-emerald-400 flex items-center justify-center text-2xl font-black shadow-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-black mb-1 line-clamp-1">{userName}</h1>
                  <p className="text-sm font-medium text-zinc-500">Joined 2026 • {Math.floor(Math.random() * 100) + 10} views</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xl font-black">${positionsValue.toFixed(2)}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Positions Value</p>
              </div>
              <div>
                <p className="text-xl font-black text-green-500">${biggestWin.toFixed(2)}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Biggest Win</p>
              </div>
              <div>
                <p className="text-xl font-black">{predictionsCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Predictions</p>
              </div>
            </div>
          </div>

          {/* Pravý panel: Profit / Loss */}
          <div className="bg-[#161618] rounded-[2rem] p-8 border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between z-10">
              <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1">
                <span className="text-fuchsia-500">▼</span> Profit/Loss
              </p>
              <div className="flex gap-4 text-[10px] font-bold text-zinc-500">
                <span className="hover:text-white cursor-pointer">1D</span>
                <span className="hover:text-white cursor-pointer">1W</span>
                <span className="text-fuchsia-500 bg-fuchsia-500/10 px-2 py-0.5 rounded cursor-pointer">1M</span>
                <span className="hover:text-white cursor-pointer">ALL</span>
              </div>
            </div>
            
            <div className="z-10 mt-4">
              <h2 className="text-4xl font-black">
                {/* Pro prototyp náhodné číslo, nebo výpočet z dat */}
                -$5.73
              </h2>
              <p className="text-xs font-medium text-zinc-500 mt-2">Past Month</p>
            </div>

            {/* Falešný graf na pozadí inspirovaný screenem */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-60 pointer-events-none">
               <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                 <path d="M0,30 Q10,35 20,25 T40,28 T60,20 T75,10 T90,20 L100,20 L100,40 L0,40 Z" fill="url(#grad)" />
                 <path d="M0,30 Q10,35 20,25 T40,28 T60,20 T75,10 T90,20 L100,20" fill="none" stroke="#d946ef" strokeWidth="0.5" />
                 <defs>
                   <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#d946ef" stopOpacity="0.2" />
                     <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
                   </linearGradient>
                 </defs>
               </svg>
            </div>
          </div>
        </div>

        {/* SEKCE POZIC */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-6 text-sm font-bold">
              <button onClick={() => setActiveTab('Active')} className={`pb-2 border-b-2 transition-colors ${activeTab === 'Active' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Positions</button>
              <button onClick={() => setActiveTab('Closed')} className={`pb-2 border-b-2 transition-colors ${activeTab === 'Closed' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Activity</button>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="bg-[#161618] border border-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
                 <span className="text-zinc-500 text-xs">🔍 Search positions</span>
               </div>
            </div>
          </div>

          {/* TABULKA POZIC */}
          <div className="bg-[#161618] border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <div className="col-span-6">Market</div>
              <div className="col-span-2 text-right">Avg</div>
              <div className="col-span-2 text-right">Current</div>
              <div className="col-span-2 text-right">Value</div>
            </div>

            <div className="flex flex-col">
              {displayBets.length === 0 ? (
                <div className="p-10 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">No {activeTab.toLowerCase()} positions</div>
              ) : (
                displayBets.map((bet: any, i: number) => {
                  // Ošetření pokud by pole markets nebylo načtené
                  const safeMarkets = markets || [];
                  const market = safeMarkets.find((m: any) => m.id === bet.marketId || m.id === bet.market_id);
                  const entryPrice = bet.entryPrice || bet.entry_price || 50;
                  const currentPrice = market ? 50 : entryPrice; 
                  const shares = (Number(bet.amount) / (entryPrice / 100)).toFixed(1);
                  
                  return (
                    <div key={bet.id || i} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center">
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
                           {market?.imageUrl && <img src={market.imageUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold line-clamp-1">{market?.title || 'Unknown Market'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-black px-1.5 rounded ${bet.type === 'VYBE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {bet.type === 'VYBE' ? 'Yes' : 'No'} {entryPrice.toFixed(0)}¢
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">{shares} shares</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-right text-xs font-mono font-bold text-zinc-300">{entryPrice.toFixed(0)}¢</div>
                      <div className="col-span-2 text-right text-xs font-mono font-bold text-zinc-300">{currentPrice.toFixed(0)}¢</div>
                      <div className="col-span-2 text-right">
                        <p className="text-xs font-black">${bet.amount}</p>
                        <p className={`text-[10px] font-bold ${i % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {i % 2 === 0 ? '+$0.20 (4.2%)' : '-$1.30 (-54.1%)'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}