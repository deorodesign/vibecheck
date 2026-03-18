'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppContext, CATEGORIES } from './context';
// OPRAVENÁ CESTA: Jedna tečka, protože složka components je hned vedle page.tsx
import Chat from './components/chat'; 

export default function Page() {
  const {
    markets,
    isLoggedIn,
    isAuthLoading,
    walletAddress,
    balance,
    marketPrices,
    myBets,
    nickname,
    marketStatus,
    dynamicLeaderboard,
    showToast,
    isLoginModalOpen,
    setIsLoginModalOpen,
    handleLogout,
    loginWithTwitter,
    loginWithDiscord,
    loginWithEmail,
    loginWithGoogle,
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

  // OPRAVA TYPU: přidáno (b: any)
  const getMarketUserBets = (marketId: number) => myBets.filter((b: any) => b.marketId === marketId);

  return (
    <div className="min-h-screen bg-zinc-950 font-mono text-zinc-300 selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter cursor-default hover:scale-105 transition-transform origin-left">
              Vybecheck
            </h1>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mt-0.5 ml-0.5 hidden sm:block">
              Predict the culture
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthLoading ? (
              <div className="h-10 w-24 bg-white/5 rounded-2xl animate-pulse"></div>
            ) : isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bankroll</span>
                  <span className="text-sm font-black text-green-400">
                    {balance ? balance.toFixed(2) : '0.00'} <span className="text-[10px] text-zinc-500">USDC</span>
                  </span>
                </div>
                
                <Link href="/profile">
                  <div className="h-10 px-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all cursor-pointer group">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform">
                      {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest hidden sm:block truncate max-w-[100px]">
                      {nickname || 'User'}
                    </span>
                  </div>
                </Link>

                <button onClick={handleLogout} className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="group relative h-10 px-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all overflow-hidden">
                <span className="relative z-10">Log in</span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col xl:flex-row gap-8">
        
        {/* LEFT COLUMN: MARKETS */}
        <div className="flex-1 min-w-0">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-8 pb-2 fade-edges">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredMarkets.length === 0 ? (
              <div className="col-span-full py-20 text-center border border-white/5 border-dashed rounded-[2rem] bg-white/[0.02]">
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">No active markets</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Check back later for new drops.</p>
              </div>
            ) : (
              filteredMarkets.map((market: any) => {
                const prices = marketPrices[market.id] || { vibe: 0.5, noVibe: 0.5 };
                const vibePct = Math.round(prices.vibe * 100);
                const userBets = getMarketUserBets(market.id);
                
                // OPRAVA TYPŮ: přidáno (b: any) a (acc: number, curr: any)
                const hasVibeBet = userBets.some((b: any) => b.type === 'VYBE');
                const hasNoVibeBet = userBets.some((b: any) => b.type === 'NO_VYBE');
                const totalBetAmount = userBets.reduce((acc: number, curr: any) => acc + curr.amount, 0);
                
                const currentBetAmount = betAmounts[market.id] || 10;
                const status = marketStatus[market.id];

                return (
                  <div key={market.id} className="group bg-[#13131a] rounded-[2rem] border border-white/5 overflow-hidden hover:border-white/10 transition-colors flex flex-col relative shadow-xl">
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131a] via-[#13131a]/50 to-transparent z-10"></div>
                      {market.imageUrl && (
                        <img src={market.imageUrl} alt={market.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out" />
                      )}
                      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                        <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10">
                          Vol {market.volume}
                        </span>
                        {status && (
                          <span className={`backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${status === 'VYBE' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            Resolved: {status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col z-20 -mt-12">
                      <h2 className="text-xl font-black text-white leading-tight mb-4 drop-shadow-md">
                        {market.title}
                      </h2>

                      <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5">
                        <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">
                          <span>Current Vybe Check</span>
                        </div>
                        <div className="h-4 bg-zinc-900 rounded-full overflow-hidden flex ring-1 ring-white/5">
                          <div className="bg-green-500 h-full transition-all duration-500 ease-out" style={{ width: `${vibePct}%` }}></div>
                          <div className="bg-red-500 h-full transition-all duration-500 ease-out" style={{ width: `${100 - vibePct}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-black mt-3">
                          <span className="text-green-400">{vibePct}%</span>
                          <span className="text-red-400">{100 - vibePct}%</span>
                        </div>
                      </div>

                      {status ? (
                        <div className="mt-auto bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Market is closed</p>
                        </div>
                      ) : (
                        <div className="mt-auto space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount to bet (USDC)</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bal: {balance.toFixed(0)}</span>
                          </div>
                          <div className="flex gap-2 h-12">
                            <input 
                              type="number" 
                              value={currentBetAmount}
                              onChange={(e) => handleBetAmountChange(market.id, Number(e.target.value))}
                              className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 text-center text-sm font-black text-white outline-none focus:border-fuchsia-500 transition-colors"
                              min="1"
                            />
                            {[10, 50].map(amt => (
                              <button 
                                key={amt}
                                onClick={() => handleBetAmountChange(market.id, amt)}
                                className={`w-14 rounded-2xl text-[10px] font-black transition-colors ${currentBetAmount === amt ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                              >
                                +{amt}
                              </button>
                            ))}
                          </div>
                          
                          {totalBetAmount > 0 && (
                            <div className="flex items-center justify-between bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl px-4 py-3">
                              <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">
                                Vybechecked! ({totalBetAmount} USDC in play)
                              </span>
                              <span className="text-[10px] font-black bg-fuchsia-500 text-white px-2 py-0.5 rounded-lg">FLEX</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => {
                                if(!isLoggedIn) setIsLoginModalOpen(true);
                                else placeBet(market.id, 'VYBE', currentBetAmount);
                              }}
                              className={`relative overflow-hidden group h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                                hasVibeBet 
                                ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] border border-green-400' 
                                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30'
                              }`}
                            >
                              <span className="relative z-10">Vybe</span>
                              <div className="absolute inset-x-0 bottom-2 text-[8px] opacity-70 flex justify-center gap-1 z-10">
                                <span>Predict @ {vibePct}¢</span>
                              </div>
                            </button>
                            <button 
                              onClick={() => {
                                if(!isLoggedIn) setIsLoginModalOpen(true);
                                else placeBet(market.id, 'NO_VYBE', currentBetAmount);
                              }}
                              className={`relative overflow-hidden group h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                                hasNoVibeBet 
                                ? 'bg-red-500 text-black shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-red-400' 
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30'
                              }`}
                            >
                              <span className="relative z-10">No Vybe</span>
                              <div className="absolute inset-x-0 bottom-2 text-[8px] opacity-70 flex justify-center gap-1 z-10">
                                <span>Predict @ {100 - vibePct}¢</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-white/5">
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold text-center">
                          By trading, you agree to the <a href="#" className="underline decoration-zinc-700 hover:text-zinc-300 transition-colors">Terms & Conditions</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT & LEADERBOARD */}
        <div className="xl:w-[400px] shrink-0 flex flex-col gap-8">
          
          {/* CHAT */}
          <div className="h-[500px] xl:h-[600px] bg-[#13131a] rounded-[2rem] border border-white/5 shadow-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Hot Now</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat marketId={markets[0]?.id || 1} />
            </div>
          </div>

          {/* LEADERBOARD */}
          <div className="bg-[#13131a] rounded-[2rem] border border-white/5 p-6 shadow-xl">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-1">Top Vybers</h2>
            <p className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest mb-6">Top 5 win monthly airdrops!</p>
            
            <div className="space-y-3">
              {dynamicLeaderboard.map((user: any) => (
                <Link href={`/user/${user.id}`} key={user.rank}>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 hover:bg-white/5 border border-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-tr ${user.color} shadow-lg shadow-black/50 group-hover:scale-110 transition-transform`}>
                        {user.rank}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors truncate max-w-[120px]">
                          {user.name}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600">{user.address}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white">{user.points}</div>
                      <div className="text-[8px] font-black text-fuchsia-500 uppercase tracking-widest">XP</div>
                    </div>
                  </div>
                </Link>
              ))}
              {dynamicLeaderboard.length === 0 && (
                <div className="text-center py-6 border border-white/5 border-dashed rounded-2xl">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Loading leaderboard...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#13131a] border border-white/10 rounded-[2rem] p-8 shadow-2xl transform transition-all">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">Log In</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Connect to start trading culture.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={loginWithTwitter}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Continue with X
              </button>
              
              <button 
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button 
                onClick={loginWithDiscord}
                className="w-full flex items-center justify-center gap-3 bg-[#5865F2] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#4752C4] transition-all active:scale-95"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
                Continue with Discord
              </button>
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">or email</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-fuchsia-500 transition-colors"
              />
              <button 
                onClick={() => loginWithEmail(emailInput)}
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
              >
                Send Magic Link
              </button>
            </div>

            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="w-full mt-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}