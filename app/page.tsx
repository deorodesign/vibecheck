'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppContext, MARKETS, CATEGORIES } from './context';

export default function Home() {
  const { 
    isLoggedIn, walletAddress, balance, connectWallet, handleLogout,
    marketPrices, myBets, placeBet, chatMessages, sendChatMessage,
    selectedMarket, setSelectedMarket, avatarUrl, nickname,
    isDarkMode, toggleDarkMode, marketStatus, dynamicLeaderboard,
    showToast
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState('All');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [flexMarket, setFlexMarket] = useState<any>(null);
  
  const [betAmount, setBetAmount] = useState<string>("10");
  const [chatInput, setChatInput] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const marketChat = selectedMarket ? chatMessages.filter((msg: any) => msg.marketId === selectedMarket.id) : [];  
  const prevChatLengthRef = useRef(marketChat.length);
  const prevMarketIdRef = useRef<number | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    if (!selectedMarket) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      prevMarketIdRef.current = null;
      return;
    }
    if (selectedMarket.id !== prevMarketIdRef.current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      prevMarketIdRef.current = selectedMarket.id;
    } else if (marketChat.length > prevChatLengthRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevChatLengthRef.current = marketChat.length;
  }, [selectedMarket, marketChat.length]);

  const handleVote = (e: React.MouseEvent, marketId: number, type: 'VYBE' | 'NO_VYBE') => {
    e.stopPropagation();
    const amountToBet = parseFloat(betAmount);
    
    if (!isLoggedIn) {
      connectWallet();
    } else if (isNaN(amountToBet) || amountToBet <= 0) {
      showToast("Please enter a valid amount.", "error");
    } else if (amountToBet > balance) {
      showToast("Insufficient balance!", "error");
    } else {
      placeBet(marketId, type, amountToBet);
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim() && selectedMarket && isLoggedIn) {
      sendChatMessage(selectedMarket.id, chatInput, nickname, avatarUrl);
      setChatInput("");
    }
  };

  const handleFlex = (e: React.MouseEvent, market: any) => {
    e.stopPropagation();
    setFlexMarket(market);
  };

  const shortAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Not Connected";
  
  let filteredMarkets = MARKETS;
  if (activeCategory === 'Trending') {
    filteredMarkets = [...MARKETS].sort((a, b) => b.volumeUsd - a.volumeUsd);
  } else if (activeCategory !== 'All') {
    filteredMarkets = MARKETS.filter(m => m.category === activeCategory);
  }

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    const aResolved = !!marketStatus[a.id];
    const bResolved = !!marketStatus[b.id];
    if (aResolved === bResolved) return 0;
    return aResolved ? 1 : -1; 
  });

  const headerContent = (
    <div className="sticky top-0 z-50 w-full flex flex-col items-center px-4 md:px-8 pt-6 pb-4 bg-zinc-50/90 dark:bg-[#0e0e12]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 transition-colors duration-500">
      <div className="w-full max-w-7xl flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 cursor-pointer" onClick={() => { setSelectedMarket(null); window.scrollTo(0, 0); }}>Vybecheck</h1>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm active:scale-95 transition-all text-black dark:text-white">
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          {!isLoggedIn ? (
            <button onClick={connectWallet} className="px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md">Log In / Sign Up</button>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 md:px-5 py-2.5 rounded-full shadow-sm cursor-default">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-xs md:text-sm font-mono font-bold text-zinc-900 dark:text-white">{balance.toFixed(2)} <span className="text-zinc-500 hidden md:inline">USDC</span></span>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-3 px-3 h-10 rounded-full border transition-all shadow-sm active:scale-95 ${isProfileOpen ? 'bg-zinc-100 dark:bg-white/10 border-zinc-300 dark:border-white/30' : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10'}`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-white/20" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 border border-zinc-200 dark:border-white/20"></div>
                  )}
                  <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 hidden sm:inline">{shortAddress(walletAddress)}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 max-w-[90vw] bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Havička s peněženkou */}
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Wallet</span>
                         <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">⚙️ Settings</Link>
                      </div>
                      <div className="flex items-center gap-3">
                         {avatarUrl ? (
                           <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex-shrink-0"></div>
                         )}
                         <div className="overflow-hidden">
                           <p className="text-zinc-900 dark:text-white font-bold text-sm italic uppercase truncate">{walletAddress}</p>
                         </div>
                      </div>
                    </div>
                    
                    {/* SEZNAM ODKAZŮ - Profil je teď hned na prvním místě! */}
                    <div className="p-2 flex flex-col gap-1">
                      <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-fuchsia-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 rounded-xl transition-colors">
                        <span>⚡</span> Profile & Philosophy
                      </Link>
                      <Link href="/how-it-works" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">How it Works</Link>
                      <Link href="/rules" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">Rules & Policies</Link>
                      <Link href="/disclaimer" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">Disclaimer</Link>
                      <Link href="/rewards" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-xs font-bold text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-colors">Airdrops & Rewards</Link>
                    </div>

                    <div className="p-2 border-t border-zinc-100 dark:border-white/5">
                      <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                        Log Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {!selectedMarket && (
        <div className="w-full max-w-7xl overflow-x-auto flex gap-2 pb-2 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${activeCategory === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-white dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'}`}>{cat}</button>
          ))}
        </div>
      )}
    </div>
  );

  const rightSidebar = (
    <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-36 lg:self-start mt-8 lg:mt-0">
      <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-6 border border-zinc-200 dark:border-white/5 shadow-sm">
        <h3 className="text-zinc-900 dark:text-white font-black italic uppercase mb-6 flex items-center gap-2 tracking-tight"><span className="text-xl">🔥</span> Hot Now</h3>
        <div className="flex flex-col gap-5">
          {MARKETS.slice(0, 3).map(m => (
            <div key={m.id} onClick={() => { setSelectedMarket(m); window.scrollTo(0, 0); setIsProfileOpen(false); }} className="flex gap-4 items-center cursor-pointer group">
              <img src={m.imageUrl} alt={m.title} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
              <div className="flex-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:text-fuchsia-500 transition-colors">{m.title}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">{m.volume}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181b] rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-white/5 bg-gradient-to-br from-fuchsia-500/10 to-orange-500/10 relative">
          <h3 className="text-zinc-900 dark:text-white font-black italic uppercase tracking-tight flex items-center gap-2 text-xl relative z-10"><span>🏆</span> Top Vybers</h3>
          <p className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400 uppercase font-bold mt-2 relative z-10 bg-white/50 dark:bg-black/20 inline-block px-2 py-1 rounded">Top 5 win monthly airdrops! 🎁</p>
        </div>
        <div className="flex flex-col p-2">
          {dynamicLeaderboard.map((user: any) => (
            <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${user.id === 'me' ? 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-500/20' : 'hover:bg-zinc-50 dark:hover:bg-white/5'}`}>
              <div className="flex items-center gap-4">
                <span className={`font-black italic text-lg w-4 ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-zinc-400' : user.rank === 3 ? 'text-amber-600' : 'text-zinc-300 dark:text-zinc-600'}`}>{user.rank}</span>
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover shadow-sm border border-zinc-200 dark:border-white/10" alt="Avatar" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${user.color} shadow-sm`}></div>
                  )}
                  <div className="flex flex-col">
                    <span className={`font-bold text-xs ${user.id === 'me' ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-zinc-900 dark:text-white'}`}>{user.name}</span>
                    <span className="text-[9px] font-mono text-zinc-500">{user.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-black font-mono text-sm ${user.id === 'me' ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-zinc-900 dark:text-white'}`}>{user.points.toLocaleString('en-US')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const flexModalContent = flexMarket && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setFlexMarket(null)}>
      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
         <div className="text-center mb-2">
           <h2 className="text-2xl font-black italic uppercase text-zinc-900 dark:text-white mb-1">Flex Your Position</h2>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest line-clamp-1">"{flexMarket.title}"</p>
         </div>
         <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=I just bet on "%0A${encodeURIComponent(flexMarket.title)}"%0A%0AJoin me on Vybecheck! 🔥&url=https://vybecheck.com`, '_blank')} className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-black text-white hover:bg-zinc-800 dark:hover:bg-zinc-900 transition-colors font-black uppercase tracking-widest text-sm shadow-md">Post to X</button>
         <button onClick={() => setFlexMarket(null)} className="mt-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest transition-colors w-full py-2">Close</button>
      </div>
    </div>
  );

  if (selectedMarket) {
    const currentPrices = marketPrices[selectedMarket.id] || { vibe: 0.5, noVibe: 0.5 };
    const marketBetTotal = myBets.filter((b: any) => b.marketId === selectedMarket.id).reduce((sum: number, b: any) => sum + b.amount, 0);
    const isResolved = !!marketStatus[selectedMarket.id];
    const winningOutcome = marketStatus[selectedMarket.id];

    return (
      <main className="flex min-h-screen flex-col items-center font-sans bg-zinc-50 dark:bg-[#0e0e12] transition-colors duration-500 relative">
        {headerContent}
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-8 py-6 px-4 animate-in slide-in-from-bottom-8 duration-500">
          <div className="w-full lg:flex-1 flex flex-col gap-6">
            <div className="w-full h-[200px] md:h-[280px] rounded-[2rem] overflow-hidden relative shadow-xl border border-zinc-200 dark:border-white/5">
              <img src={selectedMarket.imageUrl} alt={selectedMarket.title} className={`absolute inset-0 w-full h-full object-cover ${isResolved ? 'grayscale' : ''}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/40 dark:from-[#0e0e12] dark:via-[#0e0e12]/40 to-transparent transition-colors duration-500"></div>
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest border border-white/10 z-20 shadow-lg">Vol: {selectedMarket.volume}</div>
            </div>

            <div className="flex flex-col gap-5 -mt-16 md:-mt-20 relative z-10 px-0 md:px-8">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white uppercase italic drop-shadow-lg px-4 md:px-0">{selectedMarket.title}</h1>
              
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-5 md:p-6 shadow-md mx-4 md:mx-0">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Current Vybe Check</h3>
                
                <div className="relative h-12 bg-zinc-100 dark:bg-black/50 rounded-2xl overflow-hidden flex items-center shadow-inner mb-6 border border-zinc-200 dark:border-white/5">
                  <div className="h-full bg-green-500 flex items-center px-4 justify-start relative shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all duration-500 ease-out" style={{ width: `${currentPrices.vibe * 100}%` }}>
                    <span className="text-white dark:text-black font-black italic text-sm z-10">{(currentPrices.vibe * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-full bg-red-500 flex items-center px-4 justify-end relative shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all duration-500 ease-out" style={{ width: `${currentPrices.noVibe * 100}%` }}>
                    <span className="text-white dark:text-black font-black italic text-sm z-10">{(currentPrices.noVibe * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {!isResolved && (
                  <div className="mb-6 p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Amount to Bet (USDC)</label>
                      <span className="text-[10px] font-bold text-zinc-500">Bal: {balance.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={betAmount} 
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="flex-1 min-w-0 bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-3 font-mono font-bold text-sm focus:outline-none focus:border-fuchsia-500 text-zinc-900 dark:text-white"
                        placeholder="0.00"
                      />
                      <button onClick={() => setBetAmount(prev => ((parseFloat(prev) || 0) + 10).toString())} className="shrink-0 px-3 sm:px-4 py-3 rounded-xl bg-zinc-200 dark:bg-white/10 text-[10px] font-bold hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors">+10</button>
                      <button onClick={() => setBetAmount(prev => ((parseFloat(prev) || 0) + 50).toString())} className="shrink-0 px-3 sm:px-4 py-3 rounded-xl bg-zinc-200 dark:bg-white/10 text-[10px] font-bold hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors">+50</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {marketBetTotal > 0 && (
                    <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm animate-in zoom-in-95">
                      <span className="font-black text-xs md:text-sm uppercase tracking-widest">✓ Vybechecked! ({marketBetTotal} USDC In Play)</span>
                      <button onClick={(e) => handleFlex(e, selectedMarket)} className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md">FLEX</button>
                    </div>
                  )}
                  {isResolved ? (
                    <div className="w-full text-center p-6 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center gap-2">
                       <h4 className="font-black italic uppercase text-zinc-900 dark:text-white text-xl">Market Resolved</h4>
                       <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Winning Outcome: <span className={winningOutcome === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{winningOutcome}</span></p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={(e) => handleVote(e, selectedMarket.id, 'VYBE')} className="group/btn flex flex-col items-center justify-center p-5 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 hover:bg-green-100 dark:hover:bg-green-500 transition-all active:scale-95 shadow-sm">
                        <span className="text-green-600 dark:text-green-400 group-hover/btn:text-green-700 dark:group-hover/btn:text-black font-black text-xl md:text-2xl uppercase italic">VYBE</span>
                        <span className="text-[10px] text-green-600/70 dark:text-green-500/70 font-bold uppercase mt-1 dark:group-hover/btn:text-black/70">Predict @ {(currentPrices.vibe * 100).toFixed(0)}¢</span>
                      </button>
                      <button onClick={(e) => handleVote(e, selectedMarket.id, 'NO_VYBE')} className="group/btn flex flex-col items-center justify-center p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500 transition-all active:scale-95 shadow-sm">
                        <span className="text-red-600 dark:text-red-400 group-hover/btn:text-red-700 dark:group-hover/btn:text-black font-black text-xl md:text-2xl uppercase italic">NO VYBE</span>
                        <span className="text-[10px] text-red-600/70 dark:text-red-500/70 font-bold uppercase mt-1 dark:group-hover/btn:text-black/70">Predict @ {(currentPrices.noVibe * 100).toFixed(0)}¢</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-md mx-4 md:mx-0">
                <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Resolution Rules</h3>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  <p className="mb-3">This market will resolve to <strong className="text-green-500">VYBE</strong> if the specified event officially occurs before the resolution date.</p>
                  <div className="p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-white/5 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Resolution Source:</p>
                    <p className="text-zinc-900 dark:text-zinc-200">{selectedMarket.resolutionSource}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-md mx-4 md:mx-0 overflow-hidden flex flex-col h-[400px]">
                <div className="p-5 border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 flex items-center justify-between">
                   <h3 className="text-zinc-900 dark:text-white font-black italic uppercase tracking-tight flex items-center gap-2"><span className="text-xl">💬</span> Live Chat</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-xs hide-scrollbar">
                   {marketChat.map((msg: any) => (
                     <div key={msg.id} className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       {msg.avatar ? <img src={msg.avatar} alt={msg.user} className="w-5 h-5 rounded-full object-cover mt-1 flex-shrink-0" /> : <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 mt-1 flex-shrink-0 opacity-80" />}
                       <div className="flex flex-col gap-1">
                         <span className={`font-black uppercase tracking-widest text-[9px] ${msg.color || 'text-fuchsia-500'}`}>{msg.user}</span>
                         <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{msg.text}</span>
                       </div>
                     </div>
                   ))}
                   <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-[#18181b]">
                  <div className="relative flex items-center">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder={isLoggedIn ? "Type a message..." : "Log in to chat..."} className="w-full bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors text-zinc-900 dark:text-white" />
                    <button onClick={handleSendChat} className="absolute right-2 p-2 text-zinc-400 hover:text-fuchsia-500 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {rightSidebar}
        </div>
        {flexModalContent}
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center font-sans bg-zinc-50 dark:bg-[#0e0e12] transition-colors duration-500 relative">
      {headerContent}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-8 py-8 px-4">
        <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {sortedMarkets.map((market) => {
            const currentPrices = marketPrices[market.id] || { vibe: 0.5, noVibe: 0.5 };
            const isResolved = !!marketStatus[market.id];
            const winningOutcome = marketStatus[market.id];

            return (
              <div key={market.id} onClick={() => { setSelectedMarket(market); window.scrollTo(0, 0); setIsProfileOpen(false); }} className={`w-full flex flex-col group bg-white dark:bg-[#18181b] rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-white/5 transition-all cursor-pointer ${isResolved ? 'opacity-60 hover:opacity-100' : 'hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-xl'}`}>
                <div className="h-44 w-full shrink-0 relative overflow-hidden">
                  <img src={market.imageUrl} alt={market.title} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isResolved ? 'grayscale' : 'group-hover:scale-105'}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 dark:from-[#18181b] dark:via-[#18181b]/20 to-transparent z-10" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[9px] font-mono font-bold tracking-widest border border-white/10 z-20">Vol: {market.volume}</div>
                </div>
                
                <div className="p-6 relative z-20 flex flex-col flex-1 bg-white dark:bg-[#18181b]">
                  <h2 className="text-lg font-black leading-tight text-zinc-900 dark:text-white uppercase italic mb-4 line-clamp-2 h-12">{market.title}</h2>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5 px-1">
                      <span className="text-[10px] font-black text-green-500 uppercase italic">{(currentPrices.vibe * 100).toFixed(0)}%</span>
                      <span className="text-[10px] font-black text-red-500 uppercase italic">{(currentPrices.noVibe * 100).toFixed(0)}%</span>
                    </div>
                    <div className="relative h-2 bg-zinc-100 dark:bg-black/40 rounded-full overflow-hidden flex border border-zinc-100 dark:border-white/5">
                      <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${currentPrices.vibe * 100}%` }} />
                      <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${currentPrices.noVibe * 100}%` }} />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    {isResolved ? (
                      <div className="w-full text-center py-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Winner: <span className={winningOutcome === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{winningOutcome}</span></p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-green-500/5 group-hover:bg-green-500/10 border border-zinc-100 dark:border-green-500/20 text-green-600 dark:text-green-400 font-black italic uppercase text-xs text-center transition-colors">Vybe</div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-red-500/5 group-hover:bg-red-500/10 border border-zinc-100 dark:border-red-500/20 text-red-600 dark:text-red-400 font-black italic uppercase text-xs text-center transition-colors">No Vybe</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {rightSidebar}
      </div>
      {flexModalContent}
    </main>
  );
}