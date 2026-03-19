'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../../context';

export default function PublicProfilePage() {
  const params = useParams();
  // TADY JE TA ZMĚNA: čteme params.id místo params.username
  const usernameParam = decodeURIComponent(params.id as string);
  const { markets, marketPrices } = useAppContext();

  const [profileData, setProfileData] = useState<any>(null);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndBets = async () => {
      // 1. Najdeme hráče podle přezdívky (ignorujeme velikost písmen)
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .ilike('nickname', usernameParam)
        .limit(1);

      if (users && users.length > 0) {
        const targetUser = users[0];
        setProfileData(targetUser);

        // 2. Vytáhneme všechny jeho sázky
        const { data: bets } = await supabase
          .from('bets')
          .select('*')
          .eq('user_address', targetUser.wallet_address)
          .order('created_at', { ascending: false });

        if (bets) {
          setUserBets(bets.map(b => ({ ...b, marketId: b.market_id, entryPrice: b.entry_price })));
        }
      }
      setLoading(false);
    };

    fetchUserAndBets();
  }, [usernameParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl md:text-4xl font-black italic uppercase text-zinc-900 dark:text-white mb-4">Vyber Not Found</h1>
        <p className="text-zinc-500 uppercase tracking-widest text-xs mb-8">This user doesn't exist or changed their name.</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-xs">Back to Markets</Link>
      </div>
    );
  }

  // --- STATISTIKY ---
  const enrichedBets = userBets.map((bet: any) => {
    const marketDetails = markets.find((m: any) => m.id === bet.marketId);
    return { ...bet, markets: marketDetails || { title: 'Unknown Market', image_url: '' } };
  });

  const activeBetsList = enrichedBets.filter((b: any) => b.status === 'pending' || !b.status);
  const resolvedBetsList = enrichedBets.filter((b: any) => b.status === 'won' || b.status === 'lost' || b.status === 'cashed_out');

  const totalVolume = enrichedBets.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  const wins = resolvedBetsList.filter((b: any) => b.status === 'won' || (b.status === 'cashed_out' && b.payout > b.amount)).length;
  const losses = resolvedBetsList.filter((b: any) => b.status === 'lost' || (b.status === 'cashed_out' && b.payout <= b.amount)).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white font-mono transition-colors duration-500 p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 mt-2 md:mt-0">
        
        <header className="w-full flex items-center justify-between mb-4 md:mb-8">
          <Link href="/" className="flex items-center gap-2 md:gap-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
            <div className="p-1.5 md:p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors shadow-sm">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </div>
            <span className="font-black text-[9px] md:text-xs uppercase tracking-widest">Back</span>
          </Link>
          <h1 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter cursor-default italic">
            Vyber Profile
          </h1>
        </header>

        {/* HLAVNÍ KARTA HRÁČE */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-fuchsia-500/5 to-transparent rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 text-center sm:text-left relative z-30">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-lg text-white border-4 border-white dark:border-[#0a0a0a] overflow-hidden shrink-0">
              {profileData.avatar_url ? <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : (profileData.nickname ? profileData.nickname.charAt(0).toUpperCase() : 'V')}
            </div>

            <div className="flex-1 w-full mt-2 sm:mt-0 flex flex-col items-center sm:items-start justify-center">
              <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest truncate max-w-[250px] sm:max-w-full">
                {profileData.nickname || 'ANONYMOUS VYBER'}
              </h2>
              
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <p className="text-[11px] sm:text-sm font-black text-fuchsia-500 uppercase tracking-widest bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  Season XP: <span className="font-mono">{profileData.xp_points || 0}</span>
                </p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                  Joined: {new Date(profileData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full border-t border-zinc-100 dark:border-zinc-800 pt-5 md:pt-6 mt-5 md:mt-6 relative z-10 text-center sm:text-left">
            <div>
              <p className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Volume Traded</p>
              <p className="text-xs sm:text-lg font-black font-mono">${totalVolume.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Active Positions</p>
              <p className="text-xs sm:text-lg font-black font-mono">{activeBetsList.length}</p>
            </div>
            <div>
              <p className="text-[8px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Win / Loss</p>
              <p className="text-xs sm:text-lg font-black font-mono">
                <span className="text-green-500">{wins}</span> <span className="text-zinc-300 dark:text-zinc-600">/</span> <span className="text-red-500">{losses}</span>
              </p>
            </div>
          </div>
        </div>

        {/* AKTIVNÍ POZICE */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-md">
          <h3 className="text-base sm:text-lg font-black uppercase italic tracking-widest mb-4 md:mb-5">Active Positions</h3>
          <div className="space-y-3">
            {activeBetsList.length === 0 ? (
              <div className="text-center py-6 md:py-8 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-[1rem] md:rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-950/50">
                <p className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-widest">No active positions right now.</p>
              </div>
            ) : (
              activeBetsList.map((bet: any) => {
                return (
                  <Link href={`/?vybecard=${bet.markets?.id}`} key={bet.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors gap-3">
                    <div className="flex items-center gap-3">
                      {(bet.markets?.image_url || bet.markets?.imageUrl) ? (
                        <img src={bet.markets?.image_url || bet.markets?.imageUrl} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-zinc-800 shrink-0"></div>
                      )}
                      <div>
                        <p className="font-bold text-[11px] sm:text-sm line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                        <p className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Holding: <span className={bet.type === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{bet.type}</span></p>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800 pt-2 sm:pt-0 mt-1 sm:mt-0">
                      <p className="font-black text-[10px] sm:text-sm font-mono text-zinc-500">Staked: {bet.amount} USDC</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* HISTORIE (ZAVŘENÉ POZICE) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-md">
          <h3 className="text-base sm:text-lg font-black uppercase italic tracking-widest mb-4 md:mb-5">Past Trades</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {resolvedBetsList.length === 0 ? (
              <div className="text-center py-6 md:py-8 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-[1rem] md:rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-950/50">
                <p className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-widest">No completed trades yet.</p>
              </div>
            ) : (
              resolvedBetsList.map((bet: any) => (
                <div key={bet.id} className="flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="pr-2">
                    <p className="font-bold text-[10px] sm:text-sm text-zinc-700 dark:text-zinc-300 line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                    <p className="text-[7px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                      {bet.type} | <span className={bet.status === 'won' ? 'text-green-500' : bet.status === 'cashed_out' ? 'text-blue-500' : 'text-red-500'}>{bet.status === 'cashed_out' ? 'SOLD' : bet.status}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-[9px] sm:text-xs text-zinc-500 font-mono">{bet.amount} USDC</p>
                    <p className={`text-[8px] sm:text-[10px] font-black font-mono tracking-widest mt-1 ${bet.status === 'won' || (bet.status === 'cashed_out' && bet.payout > bet.amount) ? 'text-green-500' : 'text-red-500'}`}>
                      {bet.status === 'won' || (bet.status === 'cashed_out' && bet.payout > bet.amount) ? '+' : ''}{(bet.payout || 0).toFixed(2)} USDC
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}