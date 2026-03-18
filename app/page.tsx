'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext, CATEGORIES } from './context';

const createSlug = (title: string) => {
  return title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

function formatTimeAgo(dateString: string) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vybecardParam = searchParams.get('vybecard');
  const {
    markets, isLoggedIn, isAuthLoading, walletAddress, balance, handleLogout,
    marketPrices, myBets, placeBet, chatMessages, sendChatMessage, toggleLikeMessage,
    selectedMarket, setSelectedMarket, avatarUrl, nickname,
    isDarkMode, toggleDarkMode, marketStatus, dynamicLeaderboard,
    showToast, isLoginModalOpen, setIsLoginModalOpen,
    loginWithTwitter, loginWithDiscord, loginWithEmail, loginWithGoogle
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState('All');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [flexMarket, setFlexMarket] = useState<any>(null);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [chatInput, setChatInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string, user: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const chatTopRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // LOGIKA CHATU: Filtrování zpráv pro konkrétní market a vlákna
  const marketMessages = selectedMarket ? chatMessages.filter((msg: any) => msg.marketId === selectedMarket.id) : [];
  const mainMessages = marketMessages.filter((msg: any) => !msg.parentId);
  const sortedMainMessages = [...mainMessages].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const visibleMessages = sortedMainMessages.slice(0, visibleCount);

  useEffect(() => {
    if (markets.length === 0) return;
    if (vybecardParam) {
      let targetMarket = markets.find((m: any) => m.id.toString() === vybecardParam) || markets.find((m: any) => createSlug(m.title) === vybecardParam);
      if (targetMarket && targetMarket.id !== selectedMarket?.id) setSelectedMarket(targetMarket);
    } else if (selectedMarket) {
      setSelectedMarket(null);
    }
  }, [vybecardParam, markets]);

  const openMarket = (market: any) => {
    setSelectedMarket(market);
    setVisibleCount(10);
    router.push(`/?vybecard=${createSlug(market.title)}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const closeMarket = () => {
    setSelectedMarket(null);
    router.push('/', { scroll: false });
  };

  const handleSendChat = () => {
    if (chatInput.trim() && selectedMarket && isLoggedIn) {
      sendChatMessage(selectedMarket.id, chatInput, nickname, avatarUrl, replyingTo ? replyingTo.id : null);
      setChatInput("");
      setReplyingTo(null);
    } else if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    }
  };

  const handleVote = (e: React.MouseEvent, marketId: number, type: 'VYBE' | 'NO_VYBE') => {
    e.stopPropagation();
    const amount = parseFloat(betAmount);
    if (!isLoggedIn) setIsLoginModalOpen(true);
    else if (isNaN(amount) || amount <= 0) showToast("Enter a valid amount", "error");
    else placeBet(marketId, type, amount);
  };

  const shortAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Not Connected";

  const sortedMarkets = [...markets].filter(m => activeCategory === 'All' || m.category === activeCategory);

  const headerContent = (
    <div className="sticky top-0 z-50 w-full flex flex-col items-center px-4 md:px-8 pt-6 pb-4 bg-zinc-50/90 dark:bg-[#0e0e12]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 transition-colors">
      <div className="w-full max-w-7xl flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 cursor-pointer" onClick={closeMarket}>Vybecheck</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold">{isDarkMode ? "LGT" : "DRK"}</button>
          {isLoggedIn ? (
            <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-2.5 rounded-full">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{balance.toFixed(2)} USDC</span>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500"></button>
            </div>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="px-6 h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-black uppercase">Log In</button>
          )}
        </div>
      </div>
      {!selectedMarket && (
        <div className="w-full max-w-7xl overflow-x-auto flex gap-2 pb-2 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-white/5 text-zinc-500 border border-zinc-200 dark:border-white/10'}`}>{cat}</button>
          ))}
        </div>
      )}
    </div>
  );

  const loginModalContent = isLoginModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}>
      <div className="bg-white dark:bg-[#18181b] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-2">
          <h2 className="text-3xl font-black italic uppercase text-zinc-900 dark:text-white">Log In</h2>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Connect to start trading culture.</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={loginWithTwitter} className="w-full py-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-sm shadow-md">Continue with X</button>
          
          {/* GOOGLE BUTTON */}
          <button onClick={loginWithGoogle} className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-white text-black border border-zinc-200 font-black uppercase tracking-widest text-sm shadow-md">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Gmail
          </button>

          <button onClick={loginWithDiscord} className="w-full py-3.5 rounded-xl bg-[#5865F2] text-white font-black uppercase tracking-widest text-sm shadow-md">Continue with Discord</button>
        </div>
        <div className="relative flex items-center py-2"><div className="flex-grow border-t dark:border-white/10"></div><span className="mx-4 text-zinc-400 text-[10px] font-bold uppercase">Or Email</span><div className="flex-grow border-t dark:border-white/10"></div></div>
        <input type="email" placeholder="name@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-zinc-900 dark:text-white" />
        <button onClick={() => loginWithEmail(emailInput)} className="w-full py-3.5 rounded-xl bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-black uppercase tracking-widest text-sm">Send Magic Link</button>
        <button onClick={() => setIsLoginModalOpen(false)} className="mt-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">Cancel</button>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-[#0e0e12] transition-colors duration-500 relative">
      {headerContent}
      {selectedMarket ? (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-8 py-6 px-4">
          <div className="w-full lg:flex-1 flex flex-col gap-6">
            <div className="w-full aspect-video rounded-[2rem] overflow-hidden relative shadow-xl border border-zinc-200 dark:border-white/5">
              <img src={selectedMarket.imageUrl || selectedMarket.image_url} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-[#0e0e12] via-transparent to-transparent"></div>
            </div>
            <div className="flex flex-col gap-5 px-0 md:px-8">
              <h1 className="text-3xl md:text-4xl font-black uppercase italic drop-shadow-lg text-zinc-900 dark:text-white">{selectedMarket.title}</h1>
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 shadow-md">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-4">Current Vybe Check</h3>
                <div className="relative h-12 bg-zinc-100 dark:bg-black/50 rounded-2xl overflow-hidden flex items-center mb-6">
                  <div className="h-full bg-green-500 flex items-center px-4 transition-all duration-500" style={{ width: `${(marketPrices[selectedMarket.id]?.vibe || 0.5) * 100}%` }}>
                    <span className="text-white font-black italic text-sm">{((marketPrices[selectedMarket.id]?.vibe || 0.5) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-full bg-red-500 flex items-center px-4 transition-all duration-500" style={{ width: `${(marketPrices[selectedMarket.id]?.noVibe || 0.5) * 100}%` }}>
                    <span className="text-white font-black italic text-sm">{((marketPrices[selectedMarket.id]?.noVibe || 0.5) * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-6"><input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 font-mono font-bold text-sm text-zinc-900 dark:text-white" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={(e) => handleVote(e, selectedMarket.id, 'VYBE')} className="p-5 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 font-black text-xl uppercase italic text-green-600 dark:text-green-400">VYBE</button>
                  <button onClick={(e) => handleVote(e, selectedMarket.id, 'NO_VYBE')} className="p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 font-black text-xl uppercase italic text-red-600 dark:text-red-400">NO VYBE</button>
                </div>
              </div>
            </div>
            {/* --- RECONSTRUCTED INTERACTIVE CHAT --- */}
            <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-md overflow-hidden flex flex-col mx-4 md:mx-8">
              <div className="p-5 border-b border-zinc-200 dark:border-white/5 font-black italic uppercase tracking-tight flex justify-between items-center">
                <span>Live Chat</span>
              </div>
              
              {/* KOLONKA NA PSANÍ NAHOŘE */}
              <div className="p-4 bg-zinc-50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/5">
                {replyingTo && (
                  <div className="mb-2 flex justify-between items-center bg-fuchsia-500/10 p-2 rounded-lg border border-fuchsia-500/20">
                    <span className="text-[10px] font-bold text-fuchsia-500">Replying to {replyingTo.user}</span>
                    <button onClick={() => setReplyingTo(null)} className="text-[10px] font-black text-fuchsia-500">✕</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder={isLoggedIn ? "Share your vybe..." : "Log in to chat..." } className="flex-1 bg-white dark:bg-black/50 border dark:border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-fuchsia-500" />
                  <button onClick={handleSendChat} className="px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">Send</button>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-6 max-h-[600px] overflow-y-auto scrollbar-hide">
                {visibleMessages.length === 0 ? <p className="text-center text-zinc-400 py-10 italic text-[11px]">Be the first to share your thoughts!</p> : 
                  visibleMessages.map((msg: any) => {
                    const replies = marketMessages.filter((r: any) => r.parentId === msg.id);
                    return (
                      <div key={msg.id} className="flex flex-col gap-3">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 mt-1 flex-shrink-0"></div>
                          <div className="flex flex-col gap-1 w-full text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="font-black uppercase text-fuchsia-500">{msg.user}</span>
                              <span className="text-[8px] text-zinc-400">{formatTimeAgo(msg.timestamp)}</span>
                            </div>
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium bg-zinc-100 dark:bg-white/5 p-3 rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-white/5 inline-block w-fit max-w-[95%]">{msg.text}</span>
                            
                            {/* INTERAKTIVNÍ PRVKY: LIKE A REPLY */}
                            <div className="flex gap-4 mt-1 px-1">
                              <button onClick={() => toggleLikeMessage(msg.id, nickname)} className={`text-[9px] font-bold uppercase transition-colors ${(msg.likedBy || []).includes(nickname) ? 'text-fuchsia-500' : 'text-zinc-500'}`}>
                                {(msg.likedBy || []).length} Likes
                              </button>
                              <button onClick={() => setReplyingTo({ id: msg.id, user: msg.user })} className="text-[9px] font-bold uppercase text-zinc-500 hover:text-white transition-colors">Reply</button>
                            </div>

                            {/* VÝPIS ODPOVĚDÍ (VLÁKNO) */}
                            {replies.length > 0 && (
                              <div className="mt-3 flex flex-col gap-3 border-l-2 border-zinc-100 dark:border-white/5 pl-4 ml-1">
                                {replies.map((reply: any) => (
                                  <div key={reply.id} className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex-shrink-0"></div>
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-black uppercase text-zinc-500 text-[9px]">{reply.user}</span>
                                        <span className="text-[7px] text-zinc-500">{formatTimeAgo(reply.timestamp)}</span>
                                      </div>
                                      <span className="text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-white/5 p-2 rounded-xl border border-zinc-100 dark:border-white/5">{reply.text}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
          {/* SIDEBAR */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6">
            <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-6 border border-zinc-200 dark:border-white/5 shadow-sm">
              <h3 className="text-zinc-900 dark:text-white font-black italic uppercase mb-6 tracking-tight">Leaderboard</h3>
              <div className="flex flex-col gap-3">
                {dynamicLeaderboard.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-500">{u.rank}. {u.name}</span>
                    <span className="font-black text-zinc-900 dark:text-white">{u.points} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8 px-4">
          {sortedMarkets.map((market: any) => (
            <div key={market.id} onClick={() => openMarket(market)} className="group bg-white dark:bg-[#18181b] rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-white/5 cursor-pointer hover:shadow-xl transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img src={market.imageUrl || market.image_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#18181b] via-transparent"></div>
              </div>
              <div className="p-6">
                <h2 className="text-sm font-black uppercase italic text-zinc-900 dark:text-white h-10 line-clamp-2">{market.title}</h2>
                <div className="mt-4 flex flex-col gap-2">
                   <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                     <span className="text-green-500">{((marketPrices[market.id]?.vibe || 0.5) * 100).toFixed(0)}% Vybe</span>
                     <span className="text-red-500">{((marketPrices[market.id]?.noVibe || 0.5) * 100).toFixed(0)}% No</span>
                   </div>
                   <div className="h-1.5 w-full bg-zinc-100 dark:bg-black/40 rounded-full overflow-hidden flex">
                     <div className="h-full bg-green-500" style={{ width: `${(marketPrices[market.id]?.vibe || 0.5) * 100}%` }}></div>
                     <div className="h-full bg-red-500" style={{ width: `${(marketPrices[market.id]?.noVibe || 0.5) * 100}%` }}></div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {loginModalContent}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e12] flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}