'use client';

import Link from 'next/link';
import { useAppContext, MARKETS } from '../context'; // Cesta musí jít o úroveň výš (../context)

export default function ProfilePage() {
  const { 
    isLoggedIn, walletAddress, balance, myBets, 
    nickname, avatarUrl, dynamicLeaderboard 
  } = useAppContext();

  // Najdeme body přihlášeného uživatele z žebříčku
  const me = dynamicLeaderboard.find(u => u.id === 'me');
  const myPoints = me ? me.points : 0;

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex flex-col items-center justify-center p-4 transition-colors duration-500 font-sans">
        <div className="text-center p-8 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-xl max-w-md w-full">
          <span className="text-4xl block mb-4">👀</span>
          <h1 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-2">Not Connected</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">You need to log in to view your profile and bets.</p>
          <Link href="/" className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 inline-block">Go Home & Log In</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex flex-col items-center py-8 px-4 md:py-12 transition-colors duration-500 font-sans">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* NÁVRAT ZPĚT */}
        <div>
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
            <span>←</span> Back to Markets
          </Link>
        </div>

        {/* HLAVNÍ PROFILOVÁ KARTA */}
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 md:p-10 shadow-xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
          {/* Barevný glow efekt na pozadí */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-fuchsia-500/20 to-transparent"></div>
          
          <div className="relative z-10 flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#18181b] shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 border-4 border-white dark:border-[#18181b] shadow-lg flex items-center justify-center">
                <span className="text-3xl text-white font-black">{nickname.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <div className="relative z-10 flex flex-col items-center md:items-start flex-1 w-full text-center md:text-left">
            <h1 className="text-3xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-1">{nickname}</h1>
            <p className="text-zinc-500 font-mono text-xs mb-6 bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-md inline-block">{walletAddress}</p>
            
            <div className="grid grid-cols-2 gap-4 w-full md:max-w-md">
              <div className="bg-zinc-50 dark:bg-black/30 p-4 rounded-2xl border border-zinc-200 dark:border-white/5 flex flex-col items-center md:items-start">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Available USDC</span>
                <span className="text-2xl font-black text-green-500 italic">{balance.toFixed(2)}</span>
              </div>
              <div className="bg-fuchsia-50 dark:bg-fuchsia-500/10 p-4 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-500/20 flex flex-col items-center md:items-start">
                <span className="text-[10px] text-fuchsia-600/70 dark:text-fuchsia-400/70 font-bold uppercase tracking-widest mb-1">Season XP</span>
                <span className="text-2xl font-black text-fuchsia-600 dark:text-fuchsia-400 italic">{myPoints.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MANIFESTO / PHILOSOPHY - TO CO JSI CHTĚL PŘIDAT! */}
        <div className="bg-gradient-to-br from-zinc-900 to-black dark:from-[#18181b] dark:to-black border border-zinc-800 dark:border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[100px] group-hover:bg-fuchsia-500/30 transition-colors duration-700"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-white mb-4 flex items-center gap-3">
              <span className="text-fuchsia-500">⚡</span> The Vybecheck Philosophy
            </h2>
            
            <div className="space-y-4 text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
              <p>
                Traditional prediction markets are broken. They let you bet on politics, sports, and boring financial charts. But what about the <strong className="text-white">real internet</strong>? What about the culture that actually breaks the timeline?
              </p>
              <p>
                We built Vybecheck because we saw a massive gap. Nobody was letting you trade shares on the things discussed in every group chat: <em className="text-zinc-300">Will TikTok be banned? Will the biggest influencer get canceled? Who's dropping the next viral album?</em>
              </p>
              <p className="pt-2 border-t border-zinc-800/50">
                <strong className="text-fuchsia-400 uppercase tracking-widest text-xs block mb-1">Our Mission:</strong>
                If you can read the room, you should be able to profit from it. We are turning pop culture, internet drama, and modern events into a tangible asset class. Stop just scrolling. Trust your gut. <strong className="text-white">Check the vybe.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* MOJE SÁZKY */}
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-6">My Active Predictions</h2>
          
          {myBets.length === 0 ? (
            <div className="text-center p-8 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-100 dark:border-white/5 border-dashed">
              <p className="text-zinc-500 text-sm font-medium">You haven't placed any bets yet. Go find some vybes!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {myBets.map((bet, index) => {
                const market = MARKETS.find(m => m.id === bet.marketId);
                if (!market) return null;
                
                return (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 rounded-2xl bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 gap-4">
                    <div className="flex items-center gap-4">
                      <img src={market.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="market" />
                      <div className="flex flex-col max-w-sm">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2">{market.title}</span>
                        <span className="text-[10px] text-zinc-500 font-mono mt-1">Entry: {bet.entryPrice.toFixed(2)}¢</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t border-zinc-200 dark:border-white/5 sm:border-0 pt-3 sm:pt-0">
                      <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${bet.type === 'VYBE' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                        {bet.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm font-black font-mono text-zinc-900 dark:text-white">
                        {bet.amount} USDC
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}