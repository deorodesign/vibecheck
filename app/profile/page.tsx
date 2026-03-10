'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppContext, MARKETS } from '../context';

export default function Profile() {
  const { 
    isLoggedIn, walletAddress, balance, connectWallet, handleLogout,
    marketPrices, myBets, avatarUrl, nickname,
    isDarkMode, toggleDarkMode, setSelectedMarket,
    setNickname, setAvatarUrl, addFunds, marketStatus, dynamicLeaderboard
  } = useAppContext();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempNickname, setTempNickname] = useState(nickname);
  const [tempAvatar, setTempAvatar] = useState(avatarUrl || "");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const openSettings = () => {
    setTempNickname(nickname);
    setTempAvatar(avatarUrl || "");
    setIsSettingsOpen(true);
    setIsProfileOpen(false);
  };

  const saveSettings = () => {
    setNickname(tempNickname);
    setAvatarUrl(tempAvatar);
    setIsSettingsOpen(false);
  };

  const shortAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Not Connected";

  let wins = 0;
  let losses = 0;
  let totalPnL = 0;

  const groupedObj = myBets.reduce((acc: any, bet: any) => {
    const key = `${bet.marketId}-${bet.type}`;
    const entryPrice = bet.entryPrice || 0.5; 
    if (!acc[key]) {
      acc[key] = { ...bet, amount: 0, totalCost: 0 };
    }
    acc[key].amount += bet.amount;
    acc[key].totalCost += (bet.amount * entryPrice);
    acc[key].avgEntry = acc[key].totalCost / acc[key].amount;
    return acc;
  }, {});

  const groupedBets = Object.values(groupedObj);

  groupedBets.forEach((bet: any) => {
    const status = marketStatus[bet.marketId];
    if (status) {
      if (status === bet.type) {
        wins++;
        const shares = bet.amount / bet.avgEntry;
        const payout = shares * 1;
        totalPnL += (payout - bet.amount); 
      } else {
        losses++;
        totalPnL -= bet.amount; 
      }
    }
  });

  const totalPositions = groupedBets.length;

  const headerContent = (
    <div className="sticky top-0 z-50 w-full flex flex-col items-center px-4 md:px-8 pt-6 pb-4 bg-zinc-50/90 dark:bg-[#0e0e12]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 transition-colors duration-500">
      <div className="w-full max-w-7xl flex justify-between items-center mb-6">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          BACK TO FEED
        </Link>
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
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Wallet</span>
                         <button onClick={openSettings} className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">⚙️ Settings</button>
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
                    <div className="p-2 border-b border-zinc-100 dark:border-white/5">
                      <div className="block w-full text-center px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-500/10 rounded-xl">
                        📍 You are here
                      </div>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link href="/terms#technology" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">Technology</Link>
                      <Link href="/terms#policies" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">Policies</Link>
                      <Link href="/terms#rules" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">Rules</Link>
                      <Link href="/terms#rewards" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-xs font-bold text-fuchsia-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 rounded-xl transition-colors">Rewards</Link>
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
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center font-sans bg-zinc-50 dark:bg-[#0e0e12] transition-colors duration-500 relative">
      {headerContent}
      
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-8 py-8 px-4">
        
        <div className="w-full lg:flex-1 flex flex-col gap-8">
          
          <div className="w-full bg-white dark:bg-[#18181b] rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-8">
             <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
             
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-fuchsia-500 to-orange-500 shadow-lg shrink-0 z-10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-[#18181b]" />
                ) : (
                  <div className="w-full h-full rounded-full bg-zinc-900 dark:bg-black border-4 border-white dark:border-[#18181b] flex items-center justify-center text-4xl md:text-5xl">👾</div>
                )}
             </div>

             <div className="flex flex-col z-10 w-full overflow-hidden items-center md:items-start text-center md:text-left">
               {/* OPRAVENÁ ČÁST PRO MOBIL - Zamezení přetékání jména a tužky */}
               <div className="flex items-center justify-center md:justify-start gap-2 mb-1 w-full min-w-0">
                 <h1 className="text-2xl md:text-4xl font-black italic uppercase text-zinc-900 dark:text-white tracking-tight truncate max-w-[75%] sm:max-w-none">
                   {nickname} 
                 </h1>
                 <button onClick={openSettings} className="text-xl md:text-2xl opacity-50 hover:opacity-100 hover:scale-110 transition-all cursor-pointer shrink-0">✏️</button>
               </div>
               
               <p className="text-[10px] md:text-xs font-mono text-zinc-500 mb-6">{shortAddress(walletAddress)}</p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 w-full">
                 <div>
                   <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Total Balance</p>
                   <p className="text-xl md:text-2xl font-mono font-black text-zinc-900 dark:text-white">{balance.toFixed(2)} <span className="text-xs md:text-sm font-bold text-zinc-500">USDC</span></p>
                 </div>
                 
                 <div className="px-4 border-x md:border-r-0 border-zinc-200 dark:border-white/10">
                   <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Realized P&L</p>
                   <div className="flex flex-col">
                     <span className={`text-xl md:text-2xl font-mono font-black ${totalPnL > 0 ? 'text-green-500' : totalPnL < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                       {totalPnL > 0 ? '+' : ''}{totalPnL.toFixed(2)} <span className="text-xs md:text-sm font-bold opacity-70">USDC</span>
                     </span>
                     <span className="text-[9px] font-bold mt-0.5 tracking-widest text-zinc-500">
                       <span className="text-green-500">{wins}W</span> / <span className="text-red-500">{losses}L</span>
                     </span>
                   </div>
                 </div>

                 <div className="hidden sm:block">
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Positions</p>
                   <p className="text-2xl font-mono font-black text-zinc-900 dark:text-white">{totalPositions}</p>
                 </div>
               </div>
             </div>
          </div>

          <div>
            <h2 className="text-xl font-black italic uppercase text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-yellow-500">⚡</span> My Trade History
            </h2>
            <div className="flex flex-col gap-4">
              {groupedBets.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-[#18181b] rounded-[2rem] border border-dashed border-zinc-300 dark:border-white/10 text-zinc-500 font-bold uppercase text-xs tracking-widest">
                  No active positions
                </div>
              ) : (
                groupedBets.map((bet: any) => {
                  const market = MARKETS.find(m => m.id === bet.marketId);
                  if (!market) return null;
                  const isVybe = bet.type === 'VYBE';
                  const currentPrices = marketPrices[market.id] || { vibe: 0.5, noVibe: 0.5 };
                  const currentPrice = isVybe ? currentPrices.vibe : currentPrices.noVibe;
                  
                  const mStatus = marketStatus[market.id];
                  const isResolved = !!mStatus;
                  const isWin = isResolved && mStatus === bet.type;
                  const isLoss = isResolved && mStatus !== bet.type;

                  return (
                    <Link 
                      href="/" 
                      onClick={() => setSelectedMarket(market)}
                      key={`${bet.marketId}-${bet.type}`} 
                      className={`flex flex-col md:flex-row items-center p-4 rounded-[2rem] border shadow-sm gap-6 relative overflow-hidden group transition-all cursor-pointer ${isWin ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/30' : isLoss ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30' : 'bg-white dark:bg-[#18181b] border-zinc-200 dark:border-white/5 hover:border-fuchsia-500/50 hover:shadow-lg hover:-translate-y-0.5'}`}
                    >
                       <img src={market.imageUrl} alt={market.title} className={`w-full md:w-40 h-28 rounded-2xl object-cover shadow-md z-10 ${isResolved ? 'opacity-50 grayscale' : ''}`} />
                       
                       <div className="flex-1 z-10 w-full pr-2 flex flex-col justify-between h-full">
                         <div>
                           <h3 className="text-sm font-black italic uppercase text-zinc-900 dark:text-white mb-4 leading-tight group-hover:text-fuchsia-500 transition-colors">{market.title}</h3>
                           <div className="flex justify-between items-end w-full">
                             <div className="flex flex-col gap-1.5">
                               <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Prediction</span>
                               <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isVybe ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                                 {bet.type}
                               </span>
                             </div>
                             
                             <div className="flex flex-col items-end gap-1.5">
                               <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                                 {isWin ? '🏆 YOU WON' : isLoss ? '💀 YOU LOST' : 'Total Value'}
                               </span>
                               <div className="text-right">
                                 <span className={`font-mono font-black text-xl ${isWin ? 'text-green-500' : isLoss ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'}`}>{bet.amount} <span className="text-[10px] text-zinc-500">USDC</span></span>
                               </div>
                               {!isResolved && (
                                 <div className="flex items-center gap-2 mt-0.5">
                                   <span className="font-mono font-bold text-[9px] text-zinc-500 bg-zinc-100 dark:bg-black/50 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/5">
                                     Avg Entry: {(bet.avgEntry * 100).toFixed(0)}¢
                                   </span>
                                   <span className="font-mono font-bold text-[9px] text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-200 dark:border-fuchsia-500/20">
                                     Current: {(currentPrice * 100).toFixed(0)}¢
                                   </span>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                         
                         {!isResolved && (
                           <button 
                             onClick={(e) => { 
                               e.preventDefault(); 
                               e.stopPropagation(); 
                               alert("Early cash-out trading is coming in V2! For now, positions are held until market resolution."); 
                             }}
                             className="mt-4 w-full py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:hover:text-white dark:hover:border-white/20 transition-all bg-white/50 dark:bg-black/20"
                           >
                             Sell / Cash Out
                           </button>
                         )}
                       </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-36 lg:self-start">
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
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black italic uppercase text-zinc-900 dark:text-white mb-6">Profile Settings</h2>

            <div className="flex flex-col gap-5 mb-8">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nickname</label>
                <input type="text" value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-zinc-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Avatar URL</label>
                <input type="text" value={tempAvatar} onChange={(e) => setTempAvatar(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 text-zinc-900 dark:text-white" />
              </div>

              <div className="pt-5 border-t border-zinc-200 dark:border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Bankroll</label>
                <button onClick={() => { addFunds(); setIsSettingsOpen(false); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500/20 to-orange-500/20 hover:from-fuchsia-500/30 hover:to-orange-500/30 border border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400 font-bold text-xs uppercase tracking-widest transition-all">
                  💰 Claim 100 USDC Airdrop
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-widest transition-colors">Cancel</button>
              <button onClick={saveSettings} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:opacity-90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-fuchsia-500/25">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}