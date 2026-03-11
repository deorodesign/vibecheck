'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// TVOJE ORIGINÁLNÍ KARTY S LOKÁLNÍMI OBRÁZKY
export const MARKETS = [
  { 
    id: 1, 
    title: "Will Taylor Swift & Travis Kelce get engaged?", 
    volume: "$1.2M", 
    volumeUsd: 1200000, 
    category: "Pop Culture", 
    imageUrl: "/taylor.jpeg", 
    resolutionSource: "Official announcement on Instagram/X by either party." 
  },
  { 
    id: 2, 
    title: "Will Jake Paul knock out Mike Tyson?", 
    volume: "$850K", 
    volumeUsd: 850000, 
    category: "Sports", 
    imageUrl: "/paul-tyson.jpg", 
    resolutionSource: "Official match decision." 
  },
  { 
    id: 3, 
    title: "Will Kylie Jenner announce another pregnancy this year?", 
    volume: "$420K", 
    volumeUsd: 420000, 
    category: "Pop Culture", 
    imageUrl: "/kylie.jpeg", 
    resolutionSource: "Confirmation via official social media." 
  },
  { 
    id: 4, 
    title: "Will TikTok be banned in the EU by end of year?", 
    volume: "$2.1M", 
    volumeUsd: 2100000, 
    category: "Tech & Politics", 
    imageUrl: "/tiktok.png", 
    resolutionSource: "Official EU legislation passage." 
  },
  { 
    id: 5, 
    title: "Will MrBeast reach 500M subscribers by 2027?", 
    volume: "$3.4M", 
    volumeUsd: 3400000, 
    category: "Trending", 
    imageUrl: "/mrbeast.jpeg", 
    resolutionSource: "Official YouTube subscriber count." 
  },
  { 
    id: 6, 
    title: "Will Ben Affleck & JLo finalize divorce this month?", 
    volume: "$150K", 
    volumeUsd: 150000, 
    category: "Pop Culture", 
    imageUrl: "/affleck.jpeg", 
    resolutionSource: "Official court filing." 
  }
];

export const CATEGORIES = ['All', 'Trending', 'Pop Culture', 'Gaming', 'Sports', 'Tech & Politics'];

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  useEffect(() => {
    const checkUser = async (session: any) => {
      if (!session?.user) return;
      const { user } = session;
      
      let { data: dbUser, error } = await supabase.from('users').select('*').eq('id', user.id).single();

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

      setIsLoggedIn(true);
      setWalletAddress(dbUser?.wallet_address || "0x" + user.id.substring(0, 6) + "..." + user.id.substring(user.id.length - 4));
      setBalance(dbUser?.balance || 500);
      setNickname(dbUser?.nickname || "Vyber");
      setAvatarUrl(dbUser?.avatar_url || "");
      setIsLoginModalOpen(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkUser(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkUser(session);
      else setIsLoggedIn(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (Object.keys(marketPrices).length === 0) {
      const initialPrices: any = {};
      MARKETS.forEach(m => { initialPrices[m.id] = { vibe: 0.5, noVibe: 0.5 }; });
      initialPrices[1] = { vibe: 0.73, noVibe: 0.27 };
      setMarketPrices(initialPrices);
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const connectWallet = () => setIsLoginModalOpen(true);

  // --- LOGINS ---
  const loginWithTwitter = async () => {
    // TADY JE TA DŮLEŽITÁ OPRAVA NA 'x'
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'x', 
      options: { redirectTo: `${window.location.origin}/` } 
    });
    if (error) showToast("Error connecting to X.", "error");
  };

  const loginWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'discord', 
      options: { redirectTo: `${window.location.origin}/` } 
    });
    if (error) showToast("Error connecting to Discord.", "error");
  };

  const loginWithEmail = async (email: string) => {
    if (!email) {
      showToast("Please enter an email address.", "error");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ 
      email: email, 
      options: { emailRedirectTo: `${window.location.origin}/` } 
    });
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Magic link sent! Check your email.", "success");
      setIsLoginModalOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setWalletAddress("");
    setBalance(0);
    setNickname("");
    setAvatarUrl("");
    showToast("Logged out successfully.", "success");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const placeBet = (marketId: number, type: 'VYBE' | 'NO_VYBE', amount: number) => {
    if (balance < amount) {
      showToast("Insufficient balance!", "error");
      return;
    }
    setBalance(prev => prev - amount);
    setMyBets(prev => [...prev, { marketId, type, amount, entryPrice: marketPrices[marketId][type === 'VYBE' ? 'vibe' : 'noVibe'] * 100 }]);
    
    setMarketPrices((prev: any) => {
      const current = prev[marketId];
      const move = Math.min(0.05, amount / 1000);
      let newVibe = type === 'VYBE' ? current.vibe + move : current.vibe - move;
      newVibe = Math.max(0.01, Math.min(0.99, newVibe));
      return { ...prev, [marketId]: { vibe: newVibe, noVibe: 1 - newVibe } };
    });
    showToast(`Successfully placed ${amount} USDC!`, "success");
  };

  const sendChatMessage = (marketId: number, text: string, user: string, avatar: string) => {
    setChatMessages(prev => [...prev, { id: Date.now(), marketId, text, user, avatar, color: 'text-fuchsia-500' }]);
  };

  return (
    <AppContext.Provider value={{
      isLoggedIn, walletAddress, balance, connectWallet, handleLogout,
      marketPrices, myBets, placeBet, chatMessages, sendChatMessage,
      selectedMarket, setSelectedMarket, avatarUrl, nickname,
      isDarkMode, toggleDarkMode, marketStatus, dynamicLeaderboard, showToast,
      isLoginModalOpen, setIsLoginModalOpen, 
      loginWithTwitter, loginWithDiscord, loginWithEmail
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