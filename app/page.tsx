'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppContext, CATEGORIES } from './context';
// Cesta k chatu - ujisti se, že máš soubor app/components/chat.tsx
import Chat from './components/chat'; 

export default function Page() {
  const {
    markets,
    isLoggedIn,
    isAuthLoading,
    balance,
    marketPrices,
    myBets,
    nickname,
    marketStatus,
    dynamicLeaderboard,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithTwitter,
    loginWithDiscord,
    loginWithEmail,
    loginWithGoogle, // Tato funkce musí být v context.tsx
    placeBet,
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState('All');
  const [emailInput, setEmailInput] = useState('');
  const [betAmounts, setBetAmounts] = useState<any>({});
  
  const filteredMarkets = activeCategory === 'All' 
    ? markets 
    : markets.filter((m: any) => m.category === activeCategory);

  const handleBetAmountChange = (marketId: number, amount: number) => {
    setBetAmounts((prev: any) => ({ ...prev, [marketId]: amount }));
  };

  const getMarketUserBets = (marketId: number) => myBets.filter((b: any) => b.marketId === marketId);

  if (isAuthLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-zinc-500 uppercase tracking-widest">Loading Vybecheck...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-mono text-zinc-300 selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      
      {/* POZNÁMKA: Header (Logo, Bankroll) je nyní v Navbar.tsx. 
          Pokud ho tam ještě nemáš, doporučuji ho tam dát podle předchozí instrukce.
      */}

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col xl:flex-row gap-8">
        
        {/* LEVÝ SLOUPEC: MARKETY */}
        <div className="flex-1 min-w-0">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-8 pb-2">
            {CATEGORIES.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                  ? 'bg-white text-black shadow-lg shadow-white/5' 
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMarkets.map((market: any) => {
              const prices = marketPrices[market.id] || { vibe: 0.5, noVibe: 0.5 };
              const vibePct = Math.round(prices.vibe * 100);
              const userBets = getMarketUserBets(market.id);
              const hasVibeBet = userBets.some((b: any) => b.type === 'VYBE');
              const hasNoVibeBet = userBets.some((b: any) => b.type === 'NO_VYBE');
              const currentBetAmount = betAmounts[market.id] || 10;

              return (
                <div key={market.id} className="bg-[#13131a] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col shadow-xl transition-all hover:border-white/10">
                  <div className="relative h-48 w-full">
                    {market.imageUrl && (
                      <img src={market.imageUrl} alt="" className="w-full h-full object-cover opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13131a] to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-black/50 backdrop-blur-md text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border border-white/10">
                        Vol {market.volume}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 -mt-8 relative z-10 flex-1 flex flex-col">
                    <h2 className="text-xl font-black text-white mb-4 line-clamp-2">{market.title}</h2>
                    
                    <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5">
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full transition-all" style={{ width: `${vibePct}%` }}></div>
                        <div className="bg-red-500 h-full transition-all" style={{ width: `${100 - vibePct}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-black mt-3">
                        <span className="text-green-400 uppercase">{vibePct}% VYBE</span>
                        <span className="text-red-400 uppercase">{100 - vibePct}% NO</span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <input 
                        type="number" 
                        value={currentBetAmount}
                        onChange={(e) => handleBetAmountChange(market.id, Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-center text-white focus:border-fuchsia-500 outline-none transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => isLoggedIn ? placeBet(market.id, 'VYBE', currentBetAmount) : setIsLoginModalOpen(true)}
                          className={`py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${hasVibeBet ? 'bg-green-500 text-black' : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'}`}
                        >
                          Vybe
                        </button>
                        <button 
                          onClick={() => isLoggedIn ? placeBet(market.id, 'NO_VYBE', currentBetAmount) : setIsLoginModalOpen(true)}
                          className={`py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${hasNoVibeBet ? 'bg-red-500 text-black' : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'}`}
                        >
                          No Vybe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRAVÝ SLOUPEC: CHAT & LEADERBOARD */}
        <div className="xl:w-[400px] flex flex-col gap-8">
          <div className="h-[600px] bg-[#13131a] rounded-[2rem] border border-white/5 shadow-xl overflow-hidden">
            <Chat marketId={markets[0]?.id || 1} />
          </div>

          <div className="bg-[#13131a] rounded-[2rem] border border-white/5 p-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Top Vybers</h3>
            <div className="space-y-4">
              {dynamicLeaderboard.map((user: any) => (
                <div key={user.rank} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-tr ${user.color}`}>
                      {user.rank}
                    </div>
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">{user.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{user.points} <span className="text-[10px] text-zinc-600">XP</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- LOGIN MODAL SE VŠEMI MOŽNOSTMI --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#13131a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
            
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Log In</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Join the culture</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* X / Twitter */}
              <button 
                onClick={loginWithTwitter}
                className="w-full flex items-center justify-center gap-4 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Continue with X
              </button>
              
              {/* GOOGLE (GMAIL) */}
              <button 
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-4 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Discord */}
              <button 
                onClick={loginWithDiscord}
                className="w-full flex items-center justify-center gap-4 bg-[#5865F2] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#4752C4] transition-all active:scale-95 shadow-lg shadow-[#5865F2]/10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
                Continue with Discord
              </button>
            </div>

            <div className="flex items-center gap-4 my-8 opacity-20">
              <div className="flex-1 h-px bg-white"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">OR</span>
              <div className="flex-1 h-px bg-white"></div>
            </div>

            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black text-white focus:border-fuchsia-500 outline-none transition-colors placeholder:text-zinc-700"
              />
              <button 
                onClick={() => loginWithEmail(emailInput)}
                className="w-full bg-zinc-900 text-zinc-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all active:scale-95"
              >
                Send Magic Link
              </button>
            </div>

            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="w-full mt-8 text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}