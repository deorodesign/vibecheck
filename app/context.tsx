'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const checkSession = async () => {
      const savedSession = localStorage.getItem('vybe_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          
          const { data: user } = await supabase.from('users').select('balance, xp_points').eq('wallet_address', session.walletAddress).single();
          
          let finalBalance = 500;
          let finalXp = 0;

          if (user) {
            finalBalance = user.balance;
            finalXp = user.xp_points || 0;
          } else {
            await supabase.from('users').insert([{
              wallet_address: session.walletAddress,
              nickname: session.nickname,
              balance: 500,
              xp_points: 0
            }]);
          }
          
          setWalletAddress(session.walletAddress);
          setNickname(session.nickname);
          setBalance(finalBalance);
          setUserXp(finalXp);
          setIsLoggedIn(true);
          fetchUserBets(session.walletAddress);
        } catch (e) {
          localStorage.removeItem('vybe_session');
        }
      }
      setIsAuthLoading(false);
    };
    checkSession();
  }, []);

  const fetchUserBets = async (address: string) => {
    const { data } = await supabase.from('bets').select('*').eq('user_address', address);
    if (data) {
      setMyBets(data.map(b => ({ ...b, marketId: b.market_id, entryPrice: b.entry_price })));
    }
  };

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

      const { data: usersData } = await supabase.from('users').select('*').order('xp_points', { ascending: false }).limit(5);
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
          name: u.nickname || 'Unknown User',
          address: u.wallet_address ? `${u.wallet_address.substring(0, 4)}...${u.wallet_address.slice(-4)}` : '0x...',
          points: u.xp_points || 0, 
          avatar: '',
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
    
    const generatedNickname = email.split('@')[0];
    const { data: existingUser } = await supabase.from('users').select('*').eq('wallet_address', email).single();

    let currentBalance = 500;
    let currentXp = 0;

    if (existingUser) {
      currentBalance = existingUser.balance;
      currentXp = existingUser.xp_points || 0;
    } else {
      await supabase.from('users').insert([{ 
        wallet_address: email, 
        nickname: generatedNickname, 
        balance: 500,
        xp_points: 0
      }]);
    }

    setWalletAddress(email);
    setNickname(generatedNickname);
    setBalance(currentBalance);
    setUserXp(currentXp);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    setIsAuthLoading(false);
    
    localStorage.setItem('vybe_session', JSON.stringify({ walletAddress: email, nickname: generatedNickname }));
    showToast(`Welcome back, ${generatedNickname}!`, "success");
  };

  const loginWithTwitter = () => loginWithEmail("twitter_user@vybecheck.xyz");
  const loginWithDiscord = () => loginWithEmail("discord_user@vybecheck.xyz");

  const handleLogout = () => {
    localStorage.removeItem('vybe_session');
    setIsLoggedIn(false);
    setWalletAddress('');
    setNickname('');
    setAvatarUrl('');
    setBalance(0);
    setUserXp(0);
    setMyBets([]);
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
    const tempMessage = {
      id: localId, marketId, parentId, text, user, avatar, betType: finalBetType, 
      timestamp: new Date().toISOString(), color: 'text-fuchsia-500', likedBy: []
    };
    setChatMessages((prev: any) => [...prev, tempMessage]);

    await supabase.from('chat_messages').insert([{
      market_id: marketId,
      parent_id: parentId,
      user_name: user,
      avatar_url: avatar,
      text: text,
      bet_type: finalBetType,
      color: 'text-fuchsia-500'
    }]);
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
    if (balance < amount) {
      showToast("Insufficient balance!", "error");
      return;
    }

    const currentPrice = marketPrices[marketId]?.[type === 'VYBE' ? 'vibe' : 'noVibe'] || 0.5;
    const entryPrice = currentPrice * 100;

    const earnedXp = amount * 10;
    
    const { data: currentUserData } = await supabase.from('users').select('balance, xp_points').eq('wallet_address', walletAddress).single();
    
    const currentDbBalance = currentUserData ? currentUserData.balance : balance;
    const currentDbXp = currentUserData ? (currentUserData.xp_points || 0) : userXp;

    const newBalance = currentDbBalance - amount;
    const newXp = currentDbXp + earnedXp;

    // Okamžitá úprava UI
    setBalance(newBalance);
    setUserXp(newXp);
    
    // Zápis do tabulky users
    await supabase.from('users').update({ balance: newBalance, xp_points: newXp }).eq('wallet_address', walletAddress);

    const tempBet = { id: crypto.randomUUID(), marketId, type, amount, entryPrice };
    setMyBets(prev => [...prev, tempBet]);

    setMarketPrices((prev: any) => {
      const current = prev[marketId] || { vibe: 0.5, noVibe: 0.5 };
      const shift = amount / 1000; 
      let newVibe = type === 'VYBE' ? Math.min(0.95, current.vibe + shift) : Math.max(0.05, current.vibe - shift);
      return { ...prev, [marketId]: { vibe: newVibe, noVibe: 1 - newVibe } };
    });

    // Zápis do tabulky bets
    const { data, error } = await supabase.from('bets').insert([{
      market_id: marketId, user_address: walletAddress, user_name: nickname, type: type, amount: amount, entry_price: entryPrice
    }]).select();

    if (error) {
      console.error("Supabase Error:", error);
      // OPRAVA: Ukáže přesný error z databáze a neukáže success
      showToast(`DB Error: ${error.message}`, "error");
    } else if (data) {
      // OPRAVA: Success notifikace vyskočí POUZE když se sázka úspěšně uloží do DB
      setMyBets(prev => prev.map(b => b.id === tempBet.id ? { ...data[0], marketId: data[0].market_id, entryPrice: data[0].entry_price } : b));
      showToast(`Successfully bet ${amount} USDC on ${type}! (+${earnedXp} XP)`, "success");
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
      loginWithTwitter, loginWithDiscord, loginWithEmail, placeBet
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