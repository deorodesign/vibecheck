'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';

export const CATEGORIES = ['All', 'Trending', 'Pop Culture', 'Gaming', 'Sports', 'Tech & Politics'];

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [markets, setMarkets] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [userXp, setUserXp] = useState(0);
  const [marketPrices, setMarketPrices] = useState<any>({});
  const [myBets, setMyBets] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [marketStatus, setMarketStatus] = useState<any>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  
  const [dynamicLeaderboard, setDynamicLeaderboard] = useState<any[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const resetAppStaleState = useCallback(() => {
    setWalletAddress('');
    setNickname('');
    setBalance(0);
    setUserXp(0);
    setAvatarUrl('');
    setMyBets([]); 
    setSelectedMarket(null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSupabaseSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSupabaseSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserBets = useCallback(async (address: string) => {
    setMyBets([]); 
    const { data, error } = await supabase.from('bets').select('*').eq('user_address', address);
    if (error) {
      console.error("Error fetching bets:", error);
      return;
    }
    if (data) {
      setMyBets(data.map(b => ({ ...b, marketId: b.market_id, entryPrice: b.entry_price })));
    }
  }, []);

  const handleSupabaseSession = useCallback(async (session: any) => {
    setIsAuthLoading(true);
    resetAppStaleState();

    if (session && session.user) {
      const userEmail = session.user.email;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('nickname, balance, xp_points, avatar_url')
        .eq('wallet_address', userEmail)
        .single();
      
      if (error) {
        console.warn("User profile not found in DB yet, trigger might be delayed.");
        setNickname(userEmail?.split('@')[0] || 'User');
        setBalance(0); 
        setUserXp(0);
      } else if (user) {
        setNickname(user.nickname || userEmail?.split('@')[0] || 'User');
        setBalance(user.balance || 0);
        setUserXp(user.xp_points || 0);
        setAvatarUrl(user.avatar_url || '');
      }
      
      setWalletAddress(userEmail);
      setIsLoggedIn(true);
      fetchUserBets(userEmail);
    } else {
      setIsLoggedIn(false);
    }
    setIsAuthLoading(false);
  }, [resetAppStaleState, fetchUserBets]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: marketsData } = await supabase.from('markets').select('*').order('created_at', { ascending: false });
      if (marketsData) {
        setMarkets(marketsData.map(m => ({
          ...m, imageUrl: m.image_url, volumeUsd: m.volume_usd, volume: `$${m.volume_usd || 0}`, resolutionSource: m.resolution_source
        })));
        let prices: any = {};
        let statuses: any = {};
        marketsData.forEach((m: any) => {
          prices[m.id] = { vibe: 0.5, noVibe: 0.5 };
          if (m.is_resolved) statuses[m.id] = m.winning_outcome;
        });
        setMarketPrices(prices);
        setMarketStatus(statuses);
      }

      const { data: chatData } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
      if (chatData) {
        setChatMessages(chatData.map(c => ({
          id: c.id,
          marketId: c.market_id,
          parentId: c.parent_id || null, 
          text: c.text,
          user: c.user_name,
          avatar: c.avatar_url || '',
          betType: c.bet_type,
          timestamp: c.created_at,
          color: c.color || 'text-fuchsia-500',
          likedBy: c.liked_by || []
        })));
      }

      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('xp_points', { ascending: false })
        .limit(10);
        
      if (usersData) {
        const colors = [
          'from-yellow-400 to-yellow-600', 
          'from-zinc-300 to-zinc-500',     
          'from-orange-400 to-orange-600', 
          'from-blue-400 to-blue-600',     
          'from-green-400 to-green-600'    
        ];
        
        setDynamicLeaderboard(usersData.map((u, i) => ({
          id: u.wallet_address || `unknown-${i}`,
          rank: i + 1,
          name: u.nickname || 'Anonymous Vyber',
          address: u.wallet_address ? `${u.wallet_address.substring(0, 4)}...${u.wallet_address.slice(-4)}` : '0x...',
          points: u.xp_points || 0, 
          avatar: u.avatar_url || '',
          color: colors[i] || 'from-fuchsia-400 to-fuchsia-600' 
        })));
      }
    };
    
    fetchData();
  }, []);

  const connectWallet = () => setIsLoginModalOpen(true);
  
  const loginWithEmail = async (email: string) => {
    if(!email) return showToast("Please enter an email", "error");
    setIsAuthLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      showToast(`Error: ${error.message}`, "error");
      setIsAuthLoading(false);
    } else {
      showToast("Magic Link sent! Check your inbox.", "success");
      setIsLoginModalOpen(false); 
    }
  };

  const loginWithTwitter = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'x' as any });
    if (error) showToast(error.message, "error");
  };

  const loginWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'discord' });
    if (error) showToast(error.message, "error");
  };

  // --- NOVÁ FUNKCE PRO GOOGLE PŘIHLÁŠENÍ ---
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) showToast(error.message, "error");
  };
  // ----------------------------------------

  const handleLogout = async () => {
    resetAppStaleState();
    await supabase.auth.signOut();
    localStorage.removeItem('vybe_session'); 
    showToast("Logged out.", "info");
    window.location.reload();
  };

  const sendChatMessage = async (marketId: number, text: string, user: string, avatar: string, parentId: string | null = null) => {
    const userBetsForMarket = myBets.filter((bet: any) => bet.marketId === marketId);
    let finalBetType = null;
    if (userBetsForMarket.length > 0) {
      const hasVybe = userBetsForMarket.some(b => b.type === 'VYBE');
      const hasNoVybe = userBetsForMarket.some(b => b.type === 'NO_VYBE');
      if (hasVybe && hasNoVybe) finalBetType = 'HEDGED';
      else if (hasVybe) finalBetType = 'VYBE';
      else if (hasNoVybe) finalBetType = 'NO_VYBE';
    }
    const localId = crypto.randomUUID();
    const tempMessage = { id: localId, marketId, parentId, text, user, avatar, betType: finalBetType, timestamp: new Date().toISOString(), color: 'text-fuchsia-500', likedBy: [] };
    setChatMessages((prev: any) => [...prev, tempMessage]);
    await supabase.from('chat_messages').insert([{ market_id: marketId, parent_id: parentId, user_name: user, avatar_url: avatar, text: text, bet_type: finalBetType, color: 'text-fuchsia-500' }]);
  };

  const toggleLikeMessage = (messageId: string, userName: string) => {
    if (!userName) return;
    setChatMessages((prev: any) => prev.map((msg: any) => {
      if (msg.id === messageId) {
        const currentLikes = msg.likedBy || [];
        const hasLiked = currentLikes.includes(userName);
        return { ...msg, likedBy: hasLiked ? currentLikes.filter((u: string) => u !== userName) : [...currentLikes, userName] };
      }
      return msg;
    }));
  };

  const placeBet = async (marketId: number, type: 'VYBE' | 'NO_VYBE', amount: number) => {
    if (balance < amount) return showToast("Insufficient balance!", "error");
    
    const currentPrice = marketPrices[marketId]?.[type === 'VYBE' ? 'vibe' : 'noVibe'] || 0.5;
    const entryPrice = currentPrice * 100;

    const { data, error } = await supabase.rpc('place_bet_secure', {
      p_market_id: marketId,
      p_user_address: walletAddress,
      p_user_name: nickname,
      p_bet_type: type,
      p_amount: amount,
      p_entry_price: entryPrice
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      showToast(`Transaction failed: ${error.message}`, "error");
    } else if (data && data.success) {
      setBalance(data.new_balance);
      setUserXp(data.new_xp);

      const tempBet = { 
        id: data.bet_id, 
        marketId, 
        type, 
        amount, 
        entryPrice 
      };
      setMyBets(prev => [...prev, tempBet]);

      setMarketPrices((prev: any) => {
        const current = prev[marketId] || { vibe: 0.5, noVibe: 0.5 };
        const shift = amount / 1000; 
        let newVibe = type === 'VYBE' ? Math.min(0.95, current.vibe + shift) : Math.max(0.05, current.vibe - shift);
        return { ...prev, [marketId]: { vibe: newVibe, noVibe: 1 - newVibe } };
      });

      showToast(`Successfully bet ${amount} USDC on ${type}!`, "success");
    }
  };

  return (
    <AppContext.Provider value={{
      markets, setMarkets, isLoggedIn, setIsLoggedIn, isAuthLoading, setIsAuthLoading,
      walletAddress, setWalletAddress, balance, setBalance, userXp, setUserXp,
      marketPrices, setMarketPrices,
      myBets, setMyBets, chatMessages, setChatMessages, sendChatMessage, toggleLikeMessage,
      selectedMarket, setSelectedMarket, avatarUrl, setAvatarUrl, nickname, setNickname,
      isDarkMode, toggleDarkMode, marketStatus, setMarketStatus, dynamicLeaderboard,
      showToast, isLoginModalOpen, setIsLoginModalOpen, connectWallet, handleLogout,
      loginWithTwitter, loginWithDiscord, loginWithEmail, loginWithGoogle, placeBet // <-- PŘIDÁNO SEM
    }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`animate-in slide-in-from-bottom-5 fade-in duration-300 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            toast.type === 'success' ? 'bg-green-50/95 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400' : 
            toast.type === 'error' ? 'bg-red-50/95 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400' : 
            'bg-zinc-50/95 dark:bg-white/10 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white'
          } backdrop-blur-md`}>
            {toast.type === 'success' && <span className="text-lg">✓</span>}
            {toast.type === 'error' && <span className="text-lg font-black">!</span>}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}