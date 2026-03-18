'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../../context';

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const { markets, marketPrices } = useAppContext();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Positions' | 'Activity'>('Positions');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      const decodedName = decodeURIComponent(params.id as string);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet_address, nickname, avatar_url, xp_points, created_at')
        .ilike('nickname', decodedName)
        .limit(1)
        .single();

      if (userData) {
        setUserProfile(userData);
        
        const { data: betsData } = await supabase
          .from('bets')
          .select('*')
          .eq('user_address', userData.wallet_address)
          .order('created_at', { ascending: false });

        if (betsData) setUserBets(betsData);
      }
      setLoading(false);
    };

    fetchPublicProfile();
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-black uppercase tracking-widest text-fuchsia-500 italic">Finding Vyber...</div>;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono text-white p-6">
        <h1 className="text-4xl font-black italic uppercase mb-4">404</h1>
        <p className="text-zinc-500 uppercase tracking-widest mb-8 text-center text-xs">Vyber not found.</p>
        <Link href="/" className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform shadow-md">Return Home</Link>
      </div>
    );
  }

  const safeMarkets = markets || [];
  
  // Metriky
  const pendingBets = userBets.filter(b => b.status === 'pending' || !b.status);
  const resolvedBets = userBets.filter(b => b.status === 'won' || b.status === 'lost');
  
  // Total Volume a Positions Value
  const positionsValue = pendingBets.reduce((sum, b) => sum + Number(b.amount), 0);
  const biggestWin = resolvedBets.reduce((max, b) => b.status === 'won' && Number(b.payout) > max ? Number(b.payout) : max, 0);
  
  // PnL Kalkulace pro hlavičku grafu
  const totalInvestedInResolved = resolvedBets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalPayout = resolvedBets.reduce((sum, b) => sum + (b.status === 'won' ? Number(b.payout) : 0), 0);
  const netPnL = totalPayout - totalInvestedInResolved;

  const joinYear = new Date(userProfile.created_at || Date.now()).getFullYear();

  // Falešný graf na základě PnL
  const generateChartPoints = () => {
    let currentY = 50; 
    const points = [[0, 100], [0, currentY]];
    const stepX = 100 / Math.max(resolvedBets.length, 5);
    
    [...resolvedBets].reverse().forEach((bet, i) => {
      if (bet.status === 'won') currentY = Math.max(10, currentY - 15); 
      else currentY = Math.min(90, currentY + 10); 
      points.push([(i + 1) * stepX, currentY]);
    });
    
    points.push([100, currentY]);
    points.push([100, 100]); 
    return points.map(p => `${p[0]},${p[1]}`).join(' ');
  };

  const displayBets = activeTab === 'Positions' ? pendingBets : userBets;

  const createSlug = (title: string) => title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-fuchsia-500/30">
      
      <header className="w-full flex items-center justify-between p-6 md:px-10 border-b border-white/5">
        <Link href="/" className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter italic">
          Vybecheck
        </Link>
        <Link href="/" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
          ← BACK TO MARKETS
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-10 space-y-6">
        
        {/* HORNÍ KARTY (Profil + Graf) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Karta Profilu */}
          <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-3xl font-black text-white shrink-0">
                  {userProfile.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : userProfile.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-black">{userProfile.nickname}</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
                    <span>Joined {joinYear}</span>
                    <span>•</span>
                    
                    {/* XP SYSTEM A TOOLTIP */}
                    <div className="relative group cursor-help flex items-center gap-1">
                      <span className="text-fuchsia-500 font-bold">{userProfile.xp_points || 0} XP</span>
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      
                      <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">How XP Works</h4>
                        <ul className="text-xs text-zinc-300 space-y-2">
                          <li className="flex items-start gap-2"><span className="text-fuchsia-500">▪</span><span><strong>+1 XP</strong> for every 1 USDC traded.</span></li>
                          <li className="flex items-start gap-2"><span className="text-green-500">▪</span><span><strong>+10 XP</strong> for every 1 USDC of net profit.</span></li>
                        </ul>
                        <p className="text-[10px] text-fuchsia-400 mt-3 font-bold italic">Smart trading beats big spending.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center text-zinc-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">${positionsValue.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Positions Value</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">${biggestWin.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Biggest Win</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingBets.length}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Predictions</p>
              </div>
            </div>
          </div>

          {/* Karta Grafu (PnL) */}
          <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[240px]">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <span className={netPnL >= 0 ? "text-green-500" : "text-fuchsia-500"}>{netPnL >= 0 ? "▲" : "▼"}</span> PROFIT/LOSS
                </p>
                <h2 className="text-4xl font-bold mt-2 font-sans">{netPnL >= 0 ? "+" : ""}${netPnL.toFixed(2)}</h2>
                <p className="text-xs text-zinc-500 mt-1">Past Month</p>
              </div>
              <div className="flex gap-3 text-[10px] font-bold text-zinc-500">
                <span className="hover:text-white cursor-pointer transition-colors">1D</span>
                <span className="hover:text-white cursor-pointer transition-colors">1W</span>
                <span className="text-fuchsia-500 bg-fuchsia-500/10 px-2 py-0.5 rounded cursor-pointer">1M</span>
                <span className="hover:text-white cursor-pointer transition-colors">ALL</span>
              </div>
            </div>

            {/* SVG Graf */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-32 opacity-80">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={netPnL >= 0 ? "#22c55e" : "#d946ef"} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={netPnL >= 0 ? "#22c55e" : "#d946ef"} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={generateChartPoints()} fill="url(#chartGradient)" />
              <polyline points={generateChartPoints().replace('0,100 ', '').replace(' 100,100', '')} fill="none" stroke={netPnL >= 0 ? "#22c55e" : "#d946ef"} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>

        {/* TABULKA POZIC / AKTIVITY */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-xl mt-8">
          <div className="flex justify-between items-center p-4 border-b border-white/5">
            <div className="flex gap-6 px-2">
              <button onClick={() => setActiveTab('Positions')} className={`text-sm font-bold pb-4 -mb-4 transition-colors ${activeTab === 'Positions' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Positions</button>
              <button onClick={() => setActiveTab('Activity')} className={`text-sm font-bold pb-4 -mb-4 transition-colors ${activeTab === 'Activity' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Activity</button>
            </div>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search positions" className="bg-[#0a0a0a] border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white outline-none focus:border-white/30 transition-colors w-48" />
            </div>
          </div>

          <div className="overflow-x-auto">
            {displayBets.length === 0 ? (
              <div className="p-16 text-center text-zinc-500 text-sm font-bold uppercase tracking-widest">No {activeTab.toLowerCase()} found.</div>
            ) : (
              <div className="min-w-[600px]">
                {/* Hlavička tabulky */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <div className="col-span-6">Market</div>
                  <div className="col-span-2 text-right">Avg</div>
                  <div className="col-span-2 text-right">Current</div>
                  <div className="col-span-2 text-right">Value</div>
                </div>

                {/* Řádky tabulky */}
                {displayBets.map((bet: any, i: number) => {
                  const market = safeMarkets.find((m: any) => m.id === bet.market_id || m.id === bet.marketId);
                  const entryPrice = bet.entryPrice || bet.entry_price || 50;
                  
                  // Získání aktuální ceny z marketPrices kontextu
                  const currentPriceObj = marketPrices[market?.id];
                  const currentPriceRaw = currentPriceObj ? (bet.type === 'VYBE' ? currentPriceObj.vibe : currentPriceObj.noVibe) : 0.5;
                  const currentPrice = Math.round(currentPriceRaw * 100);

                  const shares = (Number(bet.amount) / (entryPrice / 100)).toFixed(1);
                  const currentValue = (Number(shares) * (currentPrice / 100));
                  const profitLoss = currentValue - Number(bet.amount);
                  const profitLossPercent = ((profitLoss / Number(bet.amount)) * 100).toFixed(1);

                  return (
                    <div key={bet.id || i} onClick={() => market && router.push(`/?vybecard=${createSlug(market.title)}`)} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center cursor-pointer">
                      
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
                          {market?.imageUrl && <img src={market.imageUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold line-clamp-1">{market?.title || 'Unknown Market'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-black px-1.5 rounded ${bet.type === 'VYBE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {bet.type === 'VYBE' ? 'Yes' : 'No'} {entryPrice.toFixed(0)}¢
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">{shares} shares</span>
                            {activeTab === 'Activity' && bet.status && bet.status !== 'pending' && (
                              <span className={`text-[9px] uppercase tracking-widest font-black ml-2 ${bet.status === 'won' ? 'text-green-500' : 'text-red-500'}`}>({bet.status})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-mono text-sm">{entryPrice.toFixed(0)}¢</div>
                      <div className="col-span-2 text-right font-mono text-sm">{currentPrice.toFixed(0)}¢</div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-bold font-mono">${currentValue.toFixed(2)}</p>
                        {activeTab === 'Positions' && (
                           <p className={`text-[10px] font-bold font-mono mt-0.5 ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                             {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)} ({profitLoss >= 0 ? '+' : ''}{profitLossPercent}%)
                           </p>
                        )}
                        {activeTab === 'Activity' && bet.status === 'won' && (
                          <p className="text-[10px] font-bold font-mono mt-0.5 text-green-500">Payout: +${Number(bet.payout).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}