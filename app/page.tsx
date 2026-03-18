'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext, CATEGORIES } from './context';
import Chat from './components/chat'; 

const createSlug = (title: string) => {
  return title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vybecardParam = searchParams.get('vybecard');
  const {
    markets, isLoggedIn, isAuthLoading, balance, handleLogout,
    marketPrices, placeBet, selectedMarket, setSelectedMarket, 
    avatarUrl, nickname, isDarkMode, toggleDarkMode, marketStatus, 
    isLoginModalOpen, setIsLoginModalOpen,
    loginWithTwitter, loginWithDiscord, loginWithEmail, loginWithGoogle
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState('All');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [emailInput, setEmailInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (markets.length === 0) return;
    if (vybecardParam) {
      let targetMarket = markets.find((m: any) => m.id.toString() === vybecardParam) || 
                         markets.find((m: any) => createSlug(m.title) === vybecardParam);
      if (targetMarket && targetMarket.id !== selectedMarket?.id) setSelectedMarket(targetMarket);
    } else if (selectedMarket) {
      setSelectedMarket(null);
    }
  }, [vybecardParam, markets]);

  const openMarket = (market: any) => {
    setSelectedMarket(market);
    router.push(`/?vybecard=${createSlug(market.title)}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const closeMarket = () => {
    setSelectedMarket(null);
    router.push('/', { scroll: false });
  };

  const handleVote = (e: React.MouseEvent, marketId: number, type: 'VYBE' | 'NO_VYBE') => {
    e.stopPropagation();
    const amount = parseFloat(betAmount);
    if (!isLoggedIn) setIsLoginModalOpen(true);
    else placeBet(marketId, type, amount);
  };

  const headerContent = (
    <div className="sticky top-0 z-50 w-full flex flex-col items-center px-4 md:px-8 pt-6 pb-4 bg-zinc-50/90 dark:bg-[#0e0e12]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 transition-colors">
      <div className="w-full max-w-7xl flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 cursor-pointer" onClick={closeMarket}>Vybecheck</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-[10px] font-bold">{isDarkMode ? "LGT" : "DRK"}</button>
          {isLoggedIn ? (
            <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-2.5 rounded-full shadow-sm">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{balance.toFixed(2)} <span className="text-[10px] text-zinc-500">USDC</span></span>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 border-2 border-white/10 overflow-hidden">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-black text-[10px]">{nickname?.charAt(0).toUpperCase()}</div>}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <Link href="/profile" className="block px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-900 dark:text-white">Profile Settings</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Log Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="px-6 h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md">Log In</button>
          )}
        </div>
      </div>
      {!selectedMarket && (
        <div className="w-full max-w-7xl overflow-x-auto flex gap-2 pb-2 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg' : 'bg-white dark:bg-white/5 text-zinc-500 border border-zinc-200 dark:border-white/10'}`}>{cat}</button>
          ))}
        </div>
      )}
    </div>
  );

  const loginModalContent = isLoginModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm shadow-2xl" onClick={() => setIsLoginModalOpen(false)}>
      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <h2 className="text-3xl font-black italic uppercase text-zinc-900 dark:text-white">Log In</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Join the culture</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={loginWithTwitter} className="w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs shadow-md active:scale-95 transition-all">Continue with X</button>
          <button onClick={loginWithGoogle} className="flex items-center justify-center gap-4 w-full py-4 rounded-2xl bg-white text-black border border-zinc-200 font-black uppercase tracking-widest text-xs shadow-md active:scale-95 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Gmail
          </button>
          <button onClick={loginWithDiscord} className="w-full py-4 rounded-2xl bg-[#5865F2] text-white font-black uppercase tracking-widest text-xs shadow-md active:scale-95">Continue with Discord</button>
        </div>
        <div className="relative flex items-center py-4 opacity-20"><div className="flex-grow border-t dark:border-white"></div><span className="mx-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">OR</span><div className="flex-grow border-t dark:border-white"></div></div>
        <input type="email" placeholder="name@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-4 text-xs font-bold outline-none text-zinc-900 dark:text-white" />
        <button onClick={() => loginWithEmail(emailInput)} className="w-full py-4 rounded-xl bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-black uppercase tracking-widest text-[10px]">Send Magic Link</button>
        <button onClick={() => setIsLoginModalOpen(false)} className="mt-6 text-zinc-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-[#0e0e12] transition-colors duration-500">
      {headerContent}
      {selectedMarket ? (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-8 py-6 px-4">
          <div className="w-full lg:flex-1 flex flex-col gap-6">
            <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-zinc-200 dark:border-white/5">
              <img src={selectedMarket.imageUrl || selectedMarket.image_url} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-[#0e0e12] via-transparent to-transparent"></div>
            </div>
            <div className="flex flex-col gap-5 px-0 md:px-8 -mt-16 md:-mt-24 relative z-10">
              <h1 className="text-3xl md:text-5xl font-black uppercase italic drop-shadow-2xl text-zinc-900 dark:text-white px-4 md:px-0 leading-tight">{selectedMarket.title}</h1>
              <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl mx-4 md:mx-0">
                <div className="relative h-14 bg-zinc-100 dark:bg-black/50 rounded-2xl overflow-hidden flex items-center mb-8 border border-zinc-200 dark:border-white/5">
                  <div className="h-full bg-green-500 flex items-center px-6 transition-all duration-700" style={{ width: `${(marketPrices[selectedMarket.id]?.vibe || 0.5) * 100}%` }}>
                    <span className="text-white font-black italic text-lg">{((marketPrices[selectedMarket.id]?.vibe || 0.5) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-full bg-red-500 flex items-center px-6 justify-end transition-all duration-700" style={{ width: `${(marketPrices[selectedMarket.id]?.noVibe || 0.5) * 100}%` }}>
                    <span className="text-white font-black italic text-lg">{((marketPrices[selectedMarket.id]?.noVibe || 0.5) * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex gap-3 mb-6">
                  <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-4 font-mono font-black text-lg text-zinc-900 dark:text-white focus:border-fuchsia-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={(e) => handleVote(e, selectedMarket.id, 'VYBE')} className="p-6 rounded-[1.5rem] bg-green-500 text-white font-black text-2xl uppercase italic shadow-lg active:scale-95 transition-all">VYBE</button>
                  <button onClick={(e) => handleVote(e, selectedMarket.id, 'NO_VYBE')} className="p-6 rounded-[1.5rem] bg-red-500 text-white font-black text-2xl uppercase italic shadow-lg active:scale-95 transition-all">NO VYBE</button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-8 h-[700px] sticky top-32">
             <Chat marketId={selectedMarket.id} />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10 px-4">
          {markets.filter(m => activeCategory === 'All' || m.category === activeCategory).map((market: any) => {
            const isResolved = !!marketStatus[market.id];
            const winningOutcome = marketStatus[market.id];
            return (
              <div key={market.id} onClick={() => openMarket(market)} className="group bg-white dark:bg-[#18181b] rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-white/5 cursor-pointer hover:shadow-2xl transition-all">
                <div className="aspect-video relative overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                  <img src={market.imageUrl || market.image_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#18181b] via-transparent"></div>
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white border border-white/10 uppercase italic tracking-widest shadow-lg">Vol: ${market.volumeUsd || market.volume_usd || 0}</div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h2 className="text-lg font-black uppercase italic text-zinc-900 dark:text-white h-12 line-clamp-2 leading-tight group-hover:text-fuchsia-500 transition-colors">{market.title}</h2>
                  <div className="mt-6 flex flex-col gap-3">
                     <div className="flex justify-between text-[9px] font-black uppercase italic tracking-widest">
                       <span className="text-green-500">{((marketPrices[market.id]?.vibe || 0.5) * 100).toFixed(0)}% Vybe</span>
                       <span className="text-red-500">{((marketPrices[market.id]?.noVibe || 0.5) * 100).toFixed(0)}% No</span>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 dark:bg-black/40 rounded-full overflow-hidden flex border border-zinc-100 dark:border-white/5 shadow-inner">
                       <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${(marketPrices[market.id]?.vibe || 0.5) * 100}%` }}></div>
                       <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${(marketPrices[market.id]?.noVibe || 0.5) * 100}%` }}></div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {loginModalContent}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e12] flex items-center justify-center font-black uppercase italic tracking-widest text-fuchsia-500">Loading Vybecheck...</div>}>
      <HomeContent />
    </Suspense>
  );
}