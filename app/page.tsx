'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext, CATEGORIES } from './context';
import confetti from 'canvas-confetti';

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
    loginWithTwitter, loginWithDiscord, loginWithEmail, loginWithGoogle, claimShareReward
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState('The Feed');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [chatInput, setChatInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string, user: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [shareData, setShareData] = useState<{title: string, text: string, url: string} | null>(null);
  const [isFetchingTimeout, setIsFetchingTimeout] = useState(false);
  
  const [isBetting, setIsBetting] = useState(false);

  const chatTopRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const marketMessages = selectedMarket ? chatMessages.filter((msg: any) => msg.marketId === selectedMarket.id) : [];
  const mainMessages = marketMessages.filter((msg: any) => !msg.parentId);
  const sortedMainMessages = [...mainMessages].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const visibleMessages = sortedMainMessages.slice(0, visibleCount);

  useEffect(() => {
    const timer = setTimeout(() => setIsFetchingTimeout(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (markets.length === 0) return;
    if (vybecardParam) {
      let targetMarket = markets.find((m: any) => m.id.toString() === vybecardParam) || markets.find((m: any) => createSlug(m.title) === vybecardParam);
      if (targetMarket) {
        setSelectedMarket(targetMarket);
      } else {
        setSelectedMarket(null);
      }
    } else {
      setSelectedMarket(null);
    }
  }, [vybecardParam, markets]);

  const openMarket = (market: any) => {
    setSelectedMarket(market);
    setVisibleCount(10);
    router.push(`/?vybecard=${createSlug(market.title)}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsProfileOpen(false);
  };

  const closeMarket = () => {
    setSelectedMarket(null);
    router.push('/', { scroll: false });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const scrollToChatTop = () => chatTopRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSendChat = () => {
    if (chatInput.trim() && selectedMarket && isLoggedIn) {
      sendChatMessage(selectedMarket.id, chatInput, nickname, avatarUrl, replyingTo ? replyingTo.id : null);
      setChatInput("");
      setReplyingTo(null);
      scrollToChatTop();
    } else if (!isLoggedIn) setIsLoginModalOpen(true);
  };

  const getUserBetStatus = (userName: string, marketId: number) => {
    if (userName !== nickname) return null;
    const activeUserBetsOnThisMarket = myBets.filter((bet: any) => bet.marketId === marketId && (!bet.status || bet.status === 'pending'));
    const hasVybe = activeUserBetsOnThisMarket.some((b: any) => b.type === 'VYBE');
    const hasNoVibe = activeUserBetsOnThisMarket.some((b: any) => b.type === 'NO_VYBE');
    if (hasVybe && hasNoVibe) return 'HEDGED';
    if (hasVybe) return 'VYBE';
    if (hasNoVibe) return 'NO_VYBE';
    return null;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    }
    if (isProfileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const handleVote = (e: React.MouseEvent, marketId: number, type: 'VYBE' | 'NO_VYBE') => {
    e.stopPropagation();
    if (isBetting) return; 

    const amountToBet = parseFloat(betAmount);
    
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    } 
    if (isNaN(amountToBet) || amountToBet <= 0) {
      showToast("Please enter a valid amount.", "error");
      return;
    } 
    if (amountToBet > balance) {
      showToast("Insufficient balance!", "error");
      return;
    }

    setIsBetting(true);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    const colors = type === 'VYBE' ? ['#22c55e', '#16a34a', '#4ade80'] : ['#ef4444', '#dc2626', '#f87171'];

    confetti({
      particleCount: 60, spread: 60, angle: 90, startVelocity: 35, origin: { x, y }, colors: colors, zIndex: 100, disableForReducedMotion: true
    });

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    placeBet(marketId, type, amountToBet);

    setTimeout(() => {
      setIsBetting(false);
    }, 800);
  };

  const openShareModal = (type: 'ASK' | 'FLEX', market: any) => {
    const url = `${window.location.origin}/?vybecard=${createSlug(market.title)}`;
    let text = type === 'ASK' 
      ? `What's the vybe on this? 🔮\n\n"${market.title}"\n\nI'm checking the odds on @Vybecheck. Are you fading or following the crowd? 👀👇`
      : `I just took a position on\n"${market.title}"\n\nJoin me on Vybecheck and let's see who's right! 💸🔮`;
    setShareData({ title: market.title, text, url });
  };

  const executeShare = (platform: string) => {
    if (!shareData) return;
    if (isLoggedIn) claimShareReward();
    const { text, url } = shareData;
    
    if (platform === 'X') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    else if (platform === 'TELEGRAM') window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    else if (platform === 'WHATSAPP') window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
    else if (platform === 'COPY') {
      navigator.clipboard.writeText(`${text}\n\n${url}`);
      showToast("Link copied to clipboard!", "success");
    }
    setShareData(null);
  };

  const shortAddress = (addr: string) => {
    if (!addr) return "";
    if (addr.includes('@')) return ""; 
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  let filteredMarkets = markets;
  
  if (activeCategory !== 'The Feed' && activeCategory !== 'On Fire') {
    filteredMarkets = markets.filter((m: any) => {
      if (!m.category) return false;
      return m.category.trim().toLowerCase() === activeCategory.trim().toLowerCase();
    });
  }
  
  const sortedMarkets = [...filteredMarkets].sort((a: any, b: any) => {
    const aResolved = !!marketStatus[a.id];
    const bResolved = !!marketStatus[b.id];
    
    if (aResolved && !bResolved) return 1;
    if (!aResolved && bResolved) return -1;

    if (activeCategory === 'On Fire' && !aResolved && !bResolved) {
      const aPrices = marketPrices[a.id] || { vybePool: 0, noVybePool: 0 };
      const bPrices = marketPrices[b.id] || { vybePool: 0, noVybePool: 0 };
      const aTotal = (Number(a.volumeUsd) || 0) + (aPrices.vybePool || 0) + (aPrices.noVybePool || 0);
      const bTotal = (Number(b.volumeUsd) || 0) + (bPrices.vybePool || 0) + (bPrices.noVybePool || 0);
      return bTotal - aTotal;
    }
    
    return 0;
  });

  const isResolved = selectedMarket ? !!marketStatus[selectedMarket.id] : false;
  const winningOutcome = selectedMarket ? marketStatus[selectedMarket.id] : null;
  const currentPrices = selectedMarket ? (marketPrices[selectedMarket.id] || { vibe: 0.5, noVibe: 0.5 }) : null;
  const marketBetTotal = selectedMarket ? myBets.filter((b: any) => b.marketId === selectedMarket.id && (!b.status || b.status === 'pending')).reduce((sum: number, b: any) => sum + b.amount, 0) : 0;

  const headerContent = (
    <div className="sticky top-0 z-50 w-full flex flex-col items-center px-4 md:px-8 pt-6 pb-4 bg-zinc-50/90 dark:bg-[#0e0e12]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 transition-colors duration-500">
      <div className="w-full max-w-7xl flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 cursor-pointer" onClick={closeMarket}>Vybecheck</h1>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={toggleDarkMode} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm active:scale-95 transition-all text-black dark:text-white font-bold text-[10px] md:text-xs uppercase shrink-0">{isDarkMode ? "LGT" : "DRK"}</button>
          {isAuthLoading ? (
            <div className="flex items-center gap-2"><div className="w-20 h-9 md:w-24 md:h-10 rounded-full bg-zinc-200 dark:bg-white/5 animate-pulse"></div></div>
          ) : isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 md:gap-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2 md:px-5 md:py-2.5 rounded-full shadow-sm cursor-default shrink-0">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[11px] md:text-sm font-mono font-bold text-zinc-900 dark:text-white">{balance.toFixed(2)} <span className="text-zinc-500 hidden md:inline">USDC</span></span>
              </div>
              <div className="relative shrink-0" ref={dropdownRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-2 md:gap-3 px-2 md:px-4 h-9 md:h-10 rounded-full border transition-all shadow-sm active:scale-95 ${isProfileOpen ? 'bg-zinc-100 dark:bg-white/10 border-zinc-300 dark:border-white/30' : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10'}`}>
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover border border-zinc-200 dark:border-white/20" /> : <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 border border-zinc-200 dark:border-white/20 flex items-center justify-center font-black text-white text-[9px] md:text-[10px]">{nickname?.charAt(0).toUpperCase() || 'U'}</div>}
                  {shortAddress(walletAddress) && <span className="text-[9px] md:text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 hidden sm:inline">{shortAddress(walletAddress)}</span>}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 md:w-64 max-w-[90vw] bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5">
                      <div className="flex items-center justify-between mb-3"><span className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Wallet</span><Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Settings</Link></div>
                      <div className="flex items-center gap-3">
                        {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0" /> : <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex-shrink-0"></div>}
                        <div className="overflow-hidden"><p className="text-zinc-900 dark:text-white font-bold text-xs md:text-sm italic uppercase truncate">{nickname}</p></div>
                      </div>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-center gap-2 w-full px-3 py-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-all">Profile & Philosophy</Link>
                      <Link href="/how-it-works" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-[11px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">How it Works</Link>
                      <Link href="/faq" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-[11px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">F.A.Q.</Link>
                      <Link href="/rules" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-[11px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">Rules & Policies</Link>
                      <Link href="/disclaimer" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-[11px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors">Disclaimer</Link>
                      <Link href="/rewards" onClick={() => setIsProfileOpen(false)} className="text-left px-3 py-2.5 text-[11px] md:text-xs font-bold text-fuchsia-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 rounded-xl transition-colors">Airdrops & Rewards</Link>
                    </div>
                    
                    <div className="p-2 border-t border-zinc-100 dark:border-white/5 flex flex-col gap-1">
                      <span className="px-3 pt-1 pb-2 text-[9px] font-black uppercase tracking-widest text-zinc-400">Community</span>
                      <a href="https://discord.gg/wVAWCNZJ" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 text-[11px] md:text-xs font-bold text-zinc-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                        👾 Join Discord
                      </a>
                      <a href="https://x.com/vybecheck_xyz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 text-[11px] md:text-xs font-bold text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors">
                        🐦 Follow on X
                      </a>
                      <a href="mailto:hello@vybecheck.xyz" className="flex items-center gap-2 px-3 py-2.5 text-[11px] md:text-xs font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-colors">
                        📧 Contact Support
                      </a>
                    </div>

                    <div className="p-2 border-t border-zinc-100 dark:border-white/5"><button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2.5 text-[11px] md:text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-colors">Log Out</button></div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="px-5 md:px-6 h-9 md:h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95 shrink-0">Log In</button>
          )}
        </div>
      </div>
      {!selectedMarket && (
        <div className="w-full max-w-7xl overflow-x-auto flex gap-2 pb-2 hide-scrollbar">
          {CATEGORIES.map((cat: any) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all shadow-sm ${activeCategory === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10'}`}>{cat}</button>
          ))}
        </div>
      )}
    </div>
  );

  const rightSidebar = (
    <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-36 lg:self-start mt-8 lg:mt-0">
      <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-5 md:p-6 border border-zinc-200 dark:border-white/5 shadow-sm">
        <h3 className="text-zinc-900 dark:text-white font-black italic uppercase mb-5 md:mb-6 flex items-center gap-2 tracking-tight text-sm md:text-base">Hot Now</h3>
        <div className="flex flex-col gap-4 md:gap-5">
          {markets.slice(0, 3).map((m: any) => (
            <div key={m.id} onClick={() => openMarket(m)} className="flex gap-4 items-center cursor-pointer group">
              <img src={m.imageUrl || m.image_url} alt={m.title} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover object-top shadow-sm group-hover:scale-105 transition-transform shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] md:text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:text-fuchsia-500 transition-colors">{m.title}</p>
                <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono mt-1">${(Number(m.volumeUsd || m.volume_usd || 0) + (marketPrices[m.id]?.vybePool || 0) + (marketPrices[m.id]?.noVybePool || 0)).toLocaleString('en-US', {maximumFractionDigits: 0})}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-[#18181b] rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 md:p-6 border-b border-zinc-200 dark:border-white/5 bg-gradient-to-br from-fuchsia-500/10 to-orange-500/10 relative">
          <h3 className="text-zinc-900 dark:text-white font-black italic uppercase tracking-tight flex items-center gap-2 text-lg md:text-xl relative z-10">Top Vybers</h3>
          <p className="text-[9px] md:text-[10px] text-fuchsia-600 dark:text-fuchsia-400 uppercase font-bold mt-2 relative z-10 bg-white/50 dark:bg-black/20 inline-block px-2 py-1 rounded">Top 3 win airdrops every 14 days!</p>
        </div>
        <div className="flex flex-col p-2">
          {dynamicLeaderboard.map((user: any) => (
            <Link href={`/user/${encodeURIComponent(user.name)}`} key={user.id} className="flex items-center justify-between p-3 md:p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3 md:gap-4">
                <span className={`font-black italic text-base md:text-lg w-4 text-center ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-zinc-400' : user.rank === 3 ? 'text-amber-600' : 'text-zinc-300 dark:text-zinc-600'}`}>{user.rank}</span>
                <div className="flex items-center gap-2 md:gap-3">
                  {user.avatar ? <img src={user.avatar} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover shadow-sm shrink-0" alt="Avatar" /> : <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr ${user.color} shrink-0`}></div>}
                  <div className="flex flex-col">
                    <span className="font-bold text-[11px] md:text-xs text-zinc-900 dark:text-white group-hover:text-fuchsia-500 transition-colors truncate max-w-[80px] sm:max-w-[120px]">{user.name}</span>
                  </div>
                </div>
              </div>
              <span className="font-black font-mono text-xs md:text-sm text-zinc-900 dark:text-white shrink-0">{user.points.toLocaleString('en-US')}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const loginModalContent = isLoginModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}>
      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-2"><h2 className="text-2xl md:text-3xl font-black italic uppercase text-zinc-900 dark:text-white mb-1 md:mb-2">Log In</h2><p className="text-zinc-500 text-[10px] md:text-xs font-medium uppercase tracking-widest">Connect to start trading culture.</p></div>
        <div className="flex flex-col gap-3">
          <button onClick={loginWithTwitter} className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-all font-black uppercase tracking-widest text-[11px] md:text-sm shadow-md active:scale-95">Continue with X</button>
          <button onClick={loginWithGoogle} className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-white text-black border border-zinc-200 font-black uppercase tracking-widest text-[11px] md:text-xs shadow-md active:scale-95 transition-all">
            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Gmail
          </button>
          <button onClick={loginWithDiscord} className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-[#5865F2] text-white hover:bg-[#4752C4] font-black uppercase tracking-widest text-[11px] md:text-sm shadow-md active:scale-95">Continue with Discord</button>
        </div>
        <div className="relative flex items-center py-2"><div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div><span className="flex-shrink-0 mx-3 md:mx-4 text-zinc-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Or Email</span><div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div></div>
        <div className="flex flex-col gap-2">
          <input type="email" placeholder="name@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-[11px] md:text-sm outline-none focus:border-fuchsia-500 text-zinc-900 dark:text-white" />
          <button onClick={() => loginWithEmail(emailInput)} className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white hover:bg-zinc-200 font-black uppercase tracking-widest text-[11px] md:text-sm active:scale-95">Send Magic Link</button>
        </div>
        <button onClick={() => setIsLoginModalOpen(false)} className="mt-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors w-full">Cancel</button>
      </div>
    </div>
  );

  const shareModalContent = shareData && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShareData(null)}>
      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-1">
          <h2 className="text-xl md:text-2xl font-black italic uppercase mb-2">Share the Vybe</h2>
          <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest line-clamp-2 mb-4">"{shareData.title}"</p>
          <div className="inline-block bg-gradient-to-r from-fuchsia-500/10 to-orange-500/10 border border-fuchsia-500/20 text-fuchsia-500 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm">🎁 Get +50 USDC & +50 XP daily!</div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => executeShare('X')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-transform shadow-md"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.93H5.078z"/></svg><span className="text-[10px] font-black uppercase tracking-widest">X (Twitter)</span></button>
          <button onClick={() => executeShare('TELEGRAM')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#229ED9] text-white hover:scale-105 transition-transform shadow-md"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.32.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg><span className="text-[10px] font-black uppercase tracking-widest">Telegram</span></button>
          <button onClick={() => executeShare('WHATSAPP')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#25D366] text-white hover:scale-105 transition-transform shadow-md"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.375-.883-.711-1.48-1.591-1.653-1.89-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg><span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span></button>
          <button onClick={() => executeShare('COPY')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-200 text-zinc-900 dark:bg-white/10 dark:text-white hover:scale-105 transition-transform shadow-md"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg><span className="text-[10px] font-black uppercase tracking-widest">Copy Link</span></button>
        </div>
        <button onClick={() => setShareData(null)} className="mt-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors w-full py-2">Cancel</button>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center font-sans bg-zinc-50 dark:bg-[#0e0e12] transition-colors duration-500 relative overflow-hidden">
      {headerContent}
      
      {markets.length === 0 ? (
        !isFetchingTimeout ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-zinc-500">Loading Vybecards...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-32 opacity-70 animate-in fade-in duration-700">
            <span className="text-5xl md:text-6xl mb-6">👨‍🍳</span>
            <p className="font-black text-lg md:text-xl uppercase italic tracking-widest text-zinc-400">Admin is cooking...</p>
            <p className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-zinc-600 mt-3 border border-zinc-200 dark:border-white/10 px-4 py-2 rounded-full">No active markets right now.</p>
          </div>
        )
      ) : selectedMarket ? (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8 py-4 md:py-6 px-3 sm:px-4 animate-in slide-in-from-bottom-8 duration-500">
          <div className="w-full lg:flex-1 flex flex-col gap-5 md:gap-6">
            <div className="w-full aspect-video rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative shadow-xl border border-zinc-200 dark:border-white/5">
              <img src={selectedMarket.imageUrl || selectedMarket.image_url} alt={selectedMarket.title} className={`absolute inset-0 w-full h-full object-cover object-top ${isResolved ? 'grayscale' : ''}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/40 dark:from-[#0e0e12] dark:via-[#0e0e12]/40 to-transparent"></div>
              <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/60 backdrop-blur-md text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-mono font-bold tracking-widest border border-white/10 z-20 shadow-lg">Vol: ${(Number(selectedMarket.volumeUsd || selectedMarket.volume_usd || 0) + (marketPrices[selectedMarket.id]?.vybePool || 0) + (marketPrices[selectedMarket.id]?.noVybePool || 0)).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
            </div>
            <div className="flex flex-col gap-4 md:gap-5 -mt-12 md:-mt-20 relative z-10 px-1 md:px-8">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 md:gap-4 px-2 md:px-0">
                <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white uppercase italic drop-shadow-lg flex-1">
                  {selectedMarket.title}
                </h1>
                
                <button 
                  onClick={() => openShareModal('ASK', selectedMarket)}
                  className="shrink-0 w-fit self-start sm:self-auto flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl group relative overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-500/20 to-orange-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  <svg className="w-3.5 h-3.5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 105.368-2.684z" /></svg>
                  <span className="relative z-10">Share & Earn <span className="hidden sm:inline">50 USDC</span></span>
                </button>
              </div>

              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-md">
                <h3 className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 md:mb-4">Current Vybe Check</h3>
                <div className="relative h-10 md:h-12 bg-zinc-100 dark:bg-black/50 rounded-2xl overflow-hidden flex items-center mb-5 md:mb-6 border border-zinc-200 dark:border-white/5 shadow-inner">
                  <div className="h-full bg-green-500 flex items-center px-3 md:px-4 justify-start transition-all duration-500 ease-out shadow-[0_0_20px_rgba(34,197,94,0.6)]" style={{ width: `${(currentPrices?.vibe || 0.5) * 100}%` }}><span className="text-white dark:text-black font-black italic text-xs md:text-sm z-10">{((currentPrices?.vibe || 0.5) * 100).toFixed(0)}%</span></div>
                  <div className="h-full bg-red-500 flex items-center px-3 md:px-4 justify-end transition-all duration-500 ease-out shadow-[0_0_20px_rgba(239,68,68,0.6)]" style={{ width: `${(currentPrices?.noVibe || 0.5) * 100}%` }}><span className="text-white dark:text-black font-black italic text-xs md:text-sm z-10">{((currentPrices?.noVibe || 0.5) * 100).toFixed(0)}%</span></div>
                </div>
                {!isResolved && (
                  <div className="mb-5 md:mb-6 p-3 md:p-4 bg-zinc-50 dark:bg-white/5 rounded-xl md:rounded-2xl border border-zinc-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-2 md:mb-3"><label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-400 tracking-widest">Amount to Bet (USDC)</label><span className="text-[9px] md:text-[10px] font-bold text-zinc-500">Bal: {balance.toFixed(2)}</span></div>
                    <div className="flex gap-2"><input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="flex-1 min-w-0 bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 md:px-3 md:py-3 font-mono font-bold text-xs md:text-sm focus:outline-none focus:border-fuchsia-500 text-zinc-900 dark:text-white" /><button onClick={() => setBetAmount(prev => ((parseFloat(prev) || 0) + 10).toString())} className="shrink-0 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-zinc-200 dark:bg-white/10 text-[9px] md:text-[10px] font-bold hover:bg-zinc-300 transition-colors">+10</button><button onClick={() => setBetAmount(prev => ((parseFloat(prev) || 0) + 50).toString())} className="shrink-0 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-zinc-200 dark:bg-white/10 text-[9px] md:text-[10px] font-bold hover:bg-zinc-300 transition-colors">+50</button></div>
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {marketBetTotal > 0 && (
                    <div className="w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm animate-in zoom-in-95"><span className="font-black text-[10px] md:text-xs uppercase tracking-widest truncate mr-2">Vybechecked! ({marketBetTotal} USDC In Play)</span><button onClick={() => openShareModal('FLEX', selectedMarket)} className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-md shrink-0">FLEX</button></div>
                  )}
                  {isResolved ? (
                    <div className="w-full text-center p-5 md:p-6 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex flex-col gap-2"><h4 className="font-black italic uppercase text-zinc-900 dark:text-white text-lg md:text-xl">Market Resolved</h4><p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">Winning Outcome: <span className={winningOutcome === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{winningOutcome}</span></p></div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3 md:gap-4 relative">
                        <button disabled={isBetting} onClick={(e) => handleVote(e, selectedMarket.id, 'VYBE')} className={`relative overflow-hidden p-4 md:p-5 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 font-black text-lg md:text-2xl uppercase italic text-green-600 dark:text-green-400 shadow-sm transition-all ${isBetting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-100 dark:hover:bg-green-500/20 active:scale-95'}`}>
                          VYBE
                        </button>
                        <button disabled={isBetting} onClick={(e) => handleVote(e, selectedMarket.id, 'NO_VYBE')} className={`relative overflow-hidden p-4 md:p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 font-black text-lg md:text-2xl uppercase italic text-red-600 dark:text-red-400 shadow-sm transition-all ${isBetting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-95'}`}>
                          NO VYBE
                        </button>
                      </div>
                      <p className="text-center text-[8px] md:text-[9px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed px-2 md:px-4">
                        By trading, you agree to the <Link href="/rules" className="underline hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Rules & Policies</Link>. All trades use <strong>virtual USDC</strong> for entertainment. Winning trades yield virtual profits and <strong>Season XP</strong> for the monthly leaderboard.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-md"><h3 className="text-[9px] md:text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 md:mb-4">Resolution Rules</h3><div className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed"><p className="mb-3">This market will resolve to <strong className="text-green-500">VYBE</strong> if the specified event officially occurs before the resolution date.</p><div className="p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-white/5"><p className="text-[9px] md:text-[10px] font-bold uppercase text-zinc-400 mb-1 tracking-widest">Resolution Source:</p><p className="text-zinc-900 dark:text-zinc-200 text-xs md:text-sm">{selectedMarket.resolutionSource || selectedMarket.resolution_source}</p></div></div></div>
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2rem] shadow-md overflow-hidden flex flex-col">
                <div ref={chatTopRef} />
                <div className="p-4 md:p-5 border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 flex items-center justify-between"><h3 className="text-zinc-900 dark:text-white font-black italic uppercase tracking-tight text-sm md:text-base">Live Chat</h3></div>
                <div className="p-3 md:p-4 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20">
                  {replyingTo && (<div className="flex items-center justify-between bg-fuchsia-500/10 px-3 py-1.5 rounded-t-lg border-x border-t border-fuchsia-500/20 text-[8px] md:text-[9px] font-medium text-fuchsia-500 mb-[-1px]"><span>Replying to <strong>@{replyingTo.user}</strong></span><button onClick={() => setReplyingTo(null)} className="font-bold hover:text-fuchsia-700">✕</button></div>)}
                  <div className="relative flex items-center"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder={isLoggedIn ? (replyingTo ? "Write a reply..." : "Share your vybe...") : "Log in to chat..."} className={`w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 px-3 md:px-4 py-2.5 md:py-3 text-[10px] md:text-xs outline-none focus:border-fuchsia-500 text-zinc-900 dark:text-white ${replyingTo ? 'rounded-b-xl rounded-tr-xl' : 'rounded-xl'}`} /><button onClick={handleSendChat} className="absolute right-2 p-2 text-zinc-400 hover:text-fuchsia-500 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button></div>
                </div>
                <div className="p-4 md:p-5 flex flex-col gap-5 md:gap-6 max-h-[500px] md:max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {visibleMessages.length === 0 ? <p className="text-center text-zinc-400 py-8 md:py-10 italic text-[10px] md:text-[11px]">Be the first to share your thoughts!</p> : 
                    visibleMessages.map((msg: any) => {
                      const userBadge = getUserBetStatus(msg.user, selectedMarket.id);
                      const replies = marketMessages.filter((r: any) => r.parentId === msg.id).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                      return (
                        <div key={msg.id} className="flex flex-col gap-2">
                          <div className="flex items-start gap-2">
                            {msg.avatar ? <img src={msg.avatar} alt="" className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover mt-1 flex-shrink-0" /> : <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 mt-1 flex-shrink-0" />}
                            <div className="flex flex-col gap-1 w-full text-[10px] md:text-[11px]">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/user/${encodeURIComponent(msg.user)}`} className="font-black uppercase tracking-widest text-[8px] md:text-[9px] text-fuchsia-500 hover:underline">{msg.user}</Link>
                                <span className="text-[7px] md:text-[8px] text-zinc-400 font-mono">{formatTimeAgo(msg.timestamp)}</span>
                                {userBadge && <span className="px-1 md:px-1.5 py-[1px] rounded bg-green-500/10 border border-green-500/20 text-[6px] md:text-[7px] font-black text-green-500 uppercase italic tracking-widest">{userBadge}</span>}
                              </div>
                              <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed bg-zinc-100 dark:bg-white/5 p-2.5 md:p-3 rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-white/10 inline-block w-fit max-w-[95%] text-[11px] md:text-xs">{msg.text}</span>
                              <div className="flex items-center gap-3 md:gap-4 mt-0.5 ml-1">
                                <button onClick={() => toggleLikeMessage(msg.id, nickname)} className={`text-[8px] md:text-[9px] font-bold transition-colors ${(msg.likedBy || []).includes(nickname) ? 'text-fuchsia-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}>♥ {(msg.likedBy || []).length || ''} Likes</button>
                                <button onClick={() => setReplyingTo({ id: msg.id, user: msg.user })} className="text-[8px] md:text-[9px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Reply</button>
                              </div>
                              
                              {replies.length > 0 && (
                                <div className="flex flex-col gap-2 md:gap-3 ml-6 md:ml-8 pl-2 md:pl-3 border-l border-zinc-200 dark:border-white/10 mt-1">
                                  {replies.map((reply: any) => (
                                    <div key={reply.id} className="flex items-start gap-2">
                                      <Link href={`/user/${encodeURIComponent(reply.user)}`} className="flex-shrink-0 mt-0.5">
                                        {reply.avatar ? (
                                          <img src={reply.avatar} alt="" className="w-4 h-4 md:w-5 md:h-5 rounded-full object-cover shadow-sm" />
                                        ) : (
                                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 opacity-80 shadow-sm" />
                                        )}
                                      </Link>
                                      <div className="flex flex-col gap-1 w-full">
                                        <div className="flex items-center gap-2">
                                          <Link href={`/user/${encodeURIComponent(reply.user)}`} className="font-black uppercase tracking-widest text-[7px] md:text-[8px] text-zinc-400 hover:text-fuchsia-500 hover:underline transition-colors">
                                            {reply.user}
                                          </Link>
                                          <span className="text-[6px] md:text-[7px] text-zinc-400 dark:text-zinc-500 font-mono">{formatTimeAgo(reply.timestamp)}</span>
                                        </div>
                                        <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed bg-zinc-100 dark:bg-white/5 p-2 md:p-2.5 rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-white/10 inline-block w-fit max-w-[95%] text-[10px] md:text-[11px]">
                                          {reply.text}
                                        </span>
                                        <div className="flex items-center gap-3 md:gap-4 mt-0.5 ml-1">
                                          <button onClick={() => toggleLikeMessage(reply.id, nickname)} className={`text-[8px] md:text-[9px] font-bold transition-colors ${(reply.likedBy || []).includes(nickname) ? 'text-fuchsia-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}>
                                            ♥ {(reply.likedBy || []).length || ''} Likes
                                          </button>
                                        </div>
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
                <div className="p-3 md:p-4 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-black/20">
                  {sortedMainMessages.length > visibleCount ? <button onClick={() => setVisibleCount(prev => prev + 10)} className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-white/5 hover:bg-zinc-100 text-zinc-900 dark:text-white rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-white/10 shadow-sm transition-all active:scale-95">Show more</button> : <span className="text-[9px] md:text-[10px] text-zinc-400 font-medium italic">End of conversation</span>}
                  <button onClick={scrollToChatTop} className="text-[8px] md:text-[9px] font-black uppercase text-zinc-400 hover:text-fuchsia-500 flex items-center gap-1 transition-colors">Back to top</button>
                </div>
              </div>
            </div>
          </div>
          {rightSidebar}
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8 py-6 md:py-8 px-3 sm:px-4">
          <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
            {sortedMarkets.map((market: any) => {
              const prices = marketPrices[market.id] || { vibe: 0.5, noVibe: 0.5, vybePool: 0, noVybePool: 0 };
              const isRes = !!marketStatus[market.id];
              const userBetType = getUserBetStatus(nickname, market.id);

              return (
                <div key={market.id} onClick={() => openMarket(market)} className={`w-full flex flex-col group bg-white dark:bg-[#18181b] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-white/5 transition-all cursor-pointer ${isRes ? 'opacity-60 hover:opacity-100' : 'hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-xl'}`}>
                  <div className="aspect-video w-full shrink-0 relative overflow-hidden bg-black/10">
                    <img src={market.imageUrl || market.image_url} alt="" className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ${isRes ? 'grayscale' : 'group-hover:scale-105'}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 dark:from-[#18181b] dark:via-[#18181b]/10 to-transparent z-10" />
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/60 backdrop-blur-md text-white px-2 py-1 md:px-2.5 md:py-1 rounded-md text-[8px] md:text-[9px] font-mono font-bold tracking-widest border border-white/10 z-20">Vol: ${(Number(market.volumeUsd || market.volume_usd || 0) + (prices.vybePool || 0) + (prices.noVybePool || 0)).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
                    
                    {!isRes && (
                       <button onClick={(e) => { e.stopPropagation(); openShareModal('ASK', market); }} className="absolute bottom-4 right-4 z-30 px-3 py-2 bg-black/60 hover:bg-black/90 text-white rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10 shadow-lg flex items-center gap-1.5 transition-all active:scale-95">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 105.368-2.684z" /></svg>
                         Share & Earn
                       </button>
                    )}
                  </div>

                  <div className="p-5 md:p-6 relative z-20 flex flex-col flex-1 bg-white dark:bg-[#18181b]">
                    <div className="flex justify-between items-start mb-3 md:mb-4 h-10 md:h-12 gap-2">
                        <h2 className="text-base md:text-lg font-black leading-tight text-zinc-900 dark:text-white uppercase italic line-clamp-2">{market.title}</h2>
                        {userBetType && <span className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[6px] md:text-[7px] font-black text-green-500 uppercase italic tracking-widest shrink-0 mt-0.5">{userBetType}</span>}
                    </div>

                    <div className="mb-4 md:mb-5 p-3 rounded-2xl bg-zinc-50 dark:bg-black/30 border border-zinc-100 dark:border-white/5 shadow-inner">
                      <div className="flex justify-between items-center mb-2 px-1"><span className="text-[10px] md:text-xs font-black text-green-500 uppercase italic">{(prices.vibe * 100).toFixed(0)}% Vybe</span><span className="text-[10px] md:text-xs font-black text-red-500 uppercase italic">{(prices.noVibe * 100).toFixed(0)}% No Vybe</span></div>
                      <div className="relative h-2 md:h-2.5 bg-zinc-100 dark:bg-black/40 rounded-full overflow-hidden flex border border-zinc-100 dark:border-white/5"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${prices.vibe * 100}%` }} /><div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${prices.noVibe * 100}%` }} /></div>
                    </div>
                    
                    <div className="mt-auto flex flex-col gap-2">{isRes ? <div className="w-full text-center py-2.5 md:py-3 rounded-xl bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/5"><p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Winner: <span className={marketStatus[market.id] === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{marketStatus[market.id]}</span></p></div> : <div className="grid grid-cols-2 gap-2"><div className="p-2.5 md:p-3 rounded-xl bg-zinc-50 dark:bg-green-500/5 group-hover:bg-green-500/10 border border-zinc-100 dark:border-green-500/20 text-green-600 dark:text-green-400 font-black italic uppercase text-[10px] md:text-xs text-center transition-colors">Vybe</div><div className="p-2.5 md:p-3 rounded-xl bg-zinc-50 dark:bg-red-500/5 group-hover:bg-red-500/10 border border-zinc-100 dark:border-red-500/20 text-red-600 dark:text-red-400 font-black italic uppercase text-[10px] md:text-xs text-center transition-colors">No Vybe</div></div>}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {rightSidebar}
        </div>
      )}
      {loginModalContent}
      {shareModalContent}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div></div>}><HomeContent /></Suspense>
  );
}