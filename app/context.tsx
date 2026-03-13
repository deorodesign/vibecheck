'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// ZDE UŽ NEJSOU NATVRDO NAPSÁNÉ KARTY!
export const CATEGORIES = ['All', 'Trending', 'Pop Culture', 'Gaming', 'Sports', 'Tech & Politics'];

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); 
  
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [markets, setMarkets] = useState<any[]>([]); // NOVÝ STAV PRO REÁLNÉ KARTY Z DB
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [marketPrices, setMarketPrices] = useState<any>({});
  const [myBets, setMyBets] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [marketStatus, setMarketStatus] = useState<any>({});
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const dynamicLeaderboard = [
    { id: '1', rank: 1, name: 'CryptoBro', address: '0x7f...92a1', points: 24500, color: 'from-yellow-400 to-yellow-600' },
    { id: '2', rank: 2, name: 'Satoshi99', address: '0x1a...4b2c', points: 18200, color: 'from-zinc-300 to-zinc-500' },
    { id: '3', rank: 3, name: 'VybeKing', address: '0x9c...11df', points: 15840, color: 'from-orange-400 to-orange-600' },
    { id: 'me', rank: isLoggedIn ? 4 : 999, name: isLoggedIn ? nickname : 'PLAYER_ONE', address: isLoggedIn ? walletAddress : '0xbc...e4a3', points: isLoggedIn ? 12500 : 0, avatar: isLoggedIn ? avatarUrl : null, color: 'from-fuchsia-500 to-orange-500' },
  ].sort((a, b) => a.rank - b.rank);

  // === NAČTENÍ REÁLNÝCH TRHŮ Z DATABÁZE ===
  useEffect(() => {
    const fetchMarkets = async () => {
      const { data: dbMarkets } = await supabase.from('markets').select('*').order('created_at', { ascending: false });
      if (dbMarkets) {
        const formattedMarkets = dbMarkets.map(m => ({
          id: m.id,
          title: m.title,
          imageUrl: m.image_url,
          category: m.category,
          volume: `$${m.volume_usd || 0}`,
          volumeUsd: m.volume_usd || 0,
          resolutionSource: m.resolution_source
        }));
        setMarkets(formattedMarkets);

        // Nastavíme úvodní ceny 50/50 a vyřešené markety
        const initialPrices: any = {};
        const statuses: any = {};
        formattedMarkets.forEach(m => { initialPrices[m.id] = { vibe: 0.5, noVibe: 0.5 }; });
        dbMarkets.forEach(m => { if (m.is_resolved) statuses[m.id] = m.winning_outcome; });
        
        setMarketPrices(prev => Object.keys(prev).length > 0 ? prev : initialPrices);
        setMarketStatus(statuses);
      }
    };
    fetchMarkets();
  }, []);

  // === NAČTĚNÍ PROFILU A SÁZEK ===
  useEffect(() => {
    const checkUser = async (session: any) => {
      if (!session?.user) { setIsLoggedIn(false); setIsAuthLoading(false); return; }
      const { user } = session;
      let { data: dbUser } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (!dbUser) {
        const newUser = { id: user.id, nickname: user.user_metadata.preferred_username || user.user_metadata.full_name || user.email?.split('@')[0] || 'Vyber', avatar_url: user.user_metadata.avatar_url || '', balance: 500.00, xp_points: 0 };
        const { data: insertedUser } = await supabase.from('users').insert(newUser).select().single();
        dbUser = insertedUser;
      }
      const { data: dbBets } = await supabase.from('bets').select('*').eq('user_id', user.id);
      if (dbBets) {
        setMyBets(dbBets.map(b => ({ marketId: b.market_id, type: b.type, amount: Number(b.amount), entryPrice: Number(b.entry_price) })));
      }
      setIsLoggedIn(true); setWalletAddress(dbUser?.wallet_address || ""); setBalance(Number(dbUser?.balance) || 500); setNickname(dbUser?.nickname || "Vyber"); setAvatarUrl(dbUser?.avatar_url || ""); setIsLoginModalOpen(false); setIsAuthLoading(false); 
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkUser(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkUser(session); else { setIsLoggedIn(false); setIsAuthLoading(false); setMyBets([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // === MULTIPLAYER CHAT ===
  useEffect(() => {
    const fetchChatHistory = async () => {
      const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(500);
      if (data) setChatMessages(data.map(msg => ({ id: msg.id, marketId: msg.market_id, text: msg.text, user: msg.nickname, avatar: msg.avatar_url, color: 'text-fuchsia-500' })));
    };
    fetchChatHistory();

    const chatChannel = supabase.channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const newMsg = payload.new;
        setChatMessages(prev => [...prev, { id: newMsg.id, marketId: newMsg.market_id, text: newMsg.text, user: newMsg.nickname, avatar: newMsg.avatar_url, color: 'text-fuchsia-500' }]);
      }).subscribe();

    return () => { supabase.removeChannel(chatChannel); };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark');
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const connectWallet = () => setIsLoginModalOpen(true);
  const loginWithTwitter = async () => { await supabase.auth.signInWithOAuth({ provider: 'x', options: { redirectTo: `${window.location.origin}/` } }); };
  const loginWithDiscord = async () => { await supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: `${window.location.origin}/` } }); };
  const loginWithEmail = async (email: string) => {
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email: email, options: { emailRedirectTo: `${window.location.origin}/` } });
    if (error) showToast(error.message, "error"); else { showToast("Magic link sent!", "success"); setIsLoginModalOpen(false); }
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setIsLoggedIn(false); setWalletAddress(""); setBalance(0); setNickname(""); setAvatarUrl(""); setMyBets([]); };
  const updateNickname = async (newNickname: string) => {
    if (!isLoggedIn) return; setNickname(newNickname);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await supabase.from('users').update({ nickname: newNickname }).eq('id', session.user.id);
  };
  const updateWalletAddress = async (newAddress: string) => {
    if (!isLoggedIn) return; setWalletAddress(newAddress);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await supabase.from('users').update({ wallet_address: newAddress }).eq('id', session.user.id);
  };
  const toggleDarkMode = () => { setIsDarkMode(!isDarkMode); document.documentElement.classList.toggle('dark'); };

  const placeBet = async (marketId: number, type: 'VYBE' | 'NO_VYBE', amount: number) => {
    if (balance < amount) { showToast("Insufficient balance!", "error"); return; }
    const entryPrice = marketPrices[marketId][type === 'VYBE' ? 'vibe' : 'noVibe'] * 100;
    const newBalance = balance - amount;

    setBalance(newBalance);
    setMyBets(prev => [...prev, { marketId, type, amount, entryPrice }]);
    setMarketPrices((prev: any) => {
      const current = prev[marketId]; const move = Math.min(0.05, amount / 1000);
      let newVibe = type === 'VYBE' ? current.vibe + move : current.vibe - move;
      newVibe = Math.max(0.01, Math.min(0.99, newVibe));
      return { ...prev, [marketId]: { vibe: newVibe, noVibe: 1 - newVibe } };
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('users').update({ balance: newBalance }).eq('id', session.user.id);
      await supabase.from('bets').insert({ user_id: session.user.id, market_id: marketId, type: type, amount: amount, entry_price: entryPrice });
    }
    showToast(`Successfully placed ${amount} USDC!`, "success");
  };

  const sendChatMessage = async (marketId: number, text: string, user: string, avatar: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('chat_messages').insert({ market_id: marketId, user_id: session.user.id, nickname: user, avatar_url: avatar, text: text });
  };

  return (
    <AppContext.Provider value={{
      markets, // <-- TADY SE PŘEDÁVAJÍ REÁLNÉ KARTY Z DB
      isLoggedIn, isAuthLoading, walletAddress, balance, connectWallet, handleLogout,
      marketPrices, myBets, placeBet, chatMessages, sendChatMessage,
      selectedMarket, setSelectedMarket, avatarUrl, nickname,
      isDarkMode, toggleDarkMode, marketStatus, dynamicLeaderboard, showToast,
      isLoginModalOpen, setIsLoginModalOpen, loginWithTwitter, loginWithDiscord, loginWithEmail,
      updateNickname, updateWalletAddress
    }}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${toastMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'} backdrop-blur-md`}>
            <span className="font-black italic uppercase tracking-widest text-xs">{toastMessage.text}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);