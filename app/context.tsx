'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export const MARKETS = [
  { id: 1, title: "Will Taylor Swift & Travis Kelce get engaged?", volume: "$1.2M", volumeUsd: 1200000, category: "Pop Culture", imageUrl: "/taylor.jpeg", resolutionSource: "Official announcement on Instagram/X by either party." },
  { id: 2, title: "Will Jake Paul knock out Mike Tyson?", volume: "$850K", volumeUsd: 850000, category: "Sports", imageUrl: "/paul-tyson.jpg", resolutionSource: "Official match decision." },
  { id: 3, title: "Will Kylie Jenner announce another pregnancy this year?", volume: "$420K", volumeUsd: 420000, category: "Pop Culture", imageUrl: "/kylie.jpeg", resolutionSource: "Confirmation via official social media." },
  { id: 4, title: "Will TikTok be banned in the EU by end of year?", volume: "$2.1M", volumeUsd: 2100000, category: "Tech & Politics", imageUrl: "/tiktok.png", resolutionSource: "Official EU legislation passage." },
  { id: 5, title: "Will MrBeast reach 500M subscribers by 2027?", volume: "$3.4M", volumeUsd: 3400000, category: "Trending", imageUrl: "/mrbeast.jpeg", resolutionSource: "Official YouTube subscriber count." },
  { id: 6, title: "Will Ben Affleck & JLo finalize divorce this month?", volume: "$150K", volumeUsd: 150000, category: "Pop Culture", imageUrl: "/affleck.jpeg", resolutionSource: "Official court filing." }
];

export const CATEGORIES = ['All', 'Trending', 'Pop Culture', 'Gaming', 'Sports', 'Tech & Politics'];

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); 
  
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
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

  // === NAČTĚNÍ PROFILU A SÁZEK ===
  useEffect(() => {
    const checkUser = async (session: any) => {
      if (!session?.user) {
        setIsLoggedIn(false);
        setIsAuthLoading(false); 
        return;
      }
      const { user } = session;
      let { data: dbUser } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (!dbUser) {
        const newUser = {
          id: user.id,
          nickname: user.user_metadata.preferred_username || user.user_metadata.full_name || user.email?.split('@')[0] || 'Vyber',
          avatar_url: user.user_metadata.avatar_url || '',
          balance: 500.00,
          xp_points: 0
        };
        const { data: insertedUser } = await supabase.from('users').insert(newUser).select().single();
        dbUser = insertedUser;
      }
      const { data: dbBets } = await supabase.from('bets').select('*').eq('user_id', user.id);
      if (dbBets) {
        const formattedBets = dbBets.map(b => ({
          marketId: b.market_id,
          type: b.type,
          amount: Number(b.amount),
          entryPrice: Number(b.entry_price)
        }));
        setMyBets(formattedBets);
      }
      setIsLoggedIn(true);
      setWalletAddress(dbUser?.wallet_address || "");
      setBalance(Number(dbUser?.balance) || 500);
      setNickname(dbUser?.nickname || "Vyber");
      setAvatarUrl(dbUser?.avatar_url || "");
      setIsLoginModalOpen(false);
      setIsAuthLoading(false); 
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkUser(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkUser(session);
      else { setIsLoggedIn(false); setIsAuthLoading(false); setMyBets([]); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // === MULTIPLAYER CHAT LOGIKA ===
  useEffect(() => {
    // 1. Načtení existující historie chatu při startu
    const fetchChatHistory = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true }) // Od nejstarších po nejnovější
        .limit(500);
        
      if (data) {
        const formatted = data.map(msg => ({
          id: msg.id,
          marketId: msg.market_id,
          text: msg.text,
          user: msg.nickname,
          avatar: msg.avatar_url,
          color: 'text-fuchsia-500'
        }));
        setChatMessages(formatted);
      }
    };
    
    fetchChatHistory();

    // 2. Přihlášení k Realtime kanálu
    const chatChannel = supabase.channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        // Jakmile do databáze spadne nová zpráva, okamžitě ji přidáme na obrazovku!
        const newMsg = payload.new;
        setChatMessages(prev => [...prev, {
          id: newMsg.id,
          marketId: newMsg.market_id,
          text: newMsg.text,
          user: newMsg.nickname,
          avatar: newMsg.avatar_url,
          color: 'text-fuchsia-500'
        }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(marketPrices).length === 0) {
      const initialPrices: any = {};
      MARKETS.forEach(m => { initialPrices[m.id] = { vibe: 0.5, noVibe: 0.5 }; });
      initialPrices[1] = { vibe: 0.73, noVibe: 0.27 };
      setMarketPrices(initialPrices);
    }
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
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false); setWalletAddress(""); setBalance(0); setNickname(""); setAvatarUrl(""); setMyBets([]);
  };

  const updateNickname = async (newNickname: string) => {
    if (!isLoggedIn) return;
    setNickname(newNickname);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await supabase.from('users').update({ nickname: newNickname }).eq('id', session.user.id);
  };

  const updateWalletAddress = async (newAddress: string) => {
    if (!isLoggedIn) return;
    setWalletAddress(newAddress);
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
      const current = prev[marketId];
      const move = Math.min(0.05, amount / 1000);
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

  // === UPRAVENÉ ODESÍLÁNÍ ZPRÁV DO DATABÁZE ===
  const sendChatMessage = async (marketId: number, text: string, user: string, avatar: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // My tu zprávu jen pošleme do databáze. Jakmile se tam uloží, náš Realtime Listener (viz useEffect nahoře)
    // ji uvidí a okamžitě ji sám propíše do obrazovky nám i všem ostatním lidem na webu.
    const { error } = await supabase.from('chat_messages').insert({
      market_id: marketId,
      user_id: session.user.id,
      nickname: user,
      avatar_url: avatar,
      text: text
    });

    if (error) {
      showToast("Error sending message.", "error");
      console.error(error);
    }
  };

  return (
    <AppContext.Provider value={{
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