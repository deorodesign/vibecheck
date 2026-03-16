'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export const CATEGORIES = ['All', 'Trending', 'Pop Culture', 'Gaming', 'Sports', 'Tech & Politics'];

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [markets, setMarkets] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [marketPrices, setMarketPrices] = useState<any>({});
  const [myBets, setMyBets] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [marketStatus, setMarketStatus] = useState<any>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [dynamicLeaderboard, setDynamicLeaderboard] = useState<any[]>([
    { id: 'user1', rank: 1, name: 'CryptoBro', address: '0x7f...92a1', points: 24500, avatar: '', color: 'from-yellow-400 to-yellow-600' },
    { id: 'user2', rank: 2, name: 'Satoshi99', address: '0x1a...4b2c', points: 18200, avatar: '', color: 'from-zinc-300 to-zinc-500' },
    { id: 'user3', rank: 3, name: 'VybeKing', address: '0x9c...11df', points: 15840, avatar: '', color: 'from-orange-400 to-orange-600' },
    { id: 'user4', rank: 4, name: 'DegenApe', address: '0x33...88cd', points: 12100, avatar: '', color: 'from-blue-400 to-blue-600' },
    { id: 'user5', rank: 5, name: 'CultureGod', address: '0x5e...22aa', points: 9500, avatar: '', color: 'from-green-400 to-green-600' },
  ]);

  const [toasts, setToasts] = useState<any[]>([]);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
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
    const fetchMarkets = async () => {
      const { data, error } = await supabase.from('markets').select('*').order('created_at', { ascending: false });
      if (data) {
        const formattedMarkets = data.map(m => ({
          ...m,
          imageUrl: m.image_url,
          volumeUsd: m.volume_usd,
          volume: `$${m.volume_usd || 0}`,
          resolutionSource: m.resolution_source
        }));
        setMarkets(formattedMarkets);
        
        let prices: any = {};
        let statuses: any = {};
        formattedMarkets.forEach((m: any) => {
          prices[m.id] = { vibe: 0.5, noVibe: 0.5 };
          if (m.is_resolved) {
            statuses[m.id] = m.winning_outcome;
          }
        });
        setMarketPrices(prices);
        setMarketStatus(statuses);
      }
    };
    fetchMarkets();
  }, []);

  const connectWallet = () => { setIsLoginModalOpen(true); };
  
  const loginWithEmail = async (email: string) => {
    if(!email) return showToast("Please enter an email", "error");
    setIsAuthLoading(true);
    setWalletAddress(email);
    setNickname(email.split('@')[0]);
    setBalance(500);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    setIsAuthLoading(false);
    showToast("Logged in successfully!", "success");
  };

  const loginWithTwitter = () => { loginWithEmail("twitter_user@vybecheck.xyz"); };
  const loginWithDiscord = () => { loginWithEmail("discord_user@vybecheck.xyz"); };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setWalletAddress('');
    setNickname('');
    setAvatarUrl('');
    setBalance(0);
    setMyBets([]);
    showToast("Logged out.", "info");
  };

  const sendChatMessage = (marketId: number, text: string, user: string, avatar: string) => {
    const userBetsForMarket = myBets.filter((bet: any) => bet.marketId === marketId);
    
    let finalBetType = null;
    
    if (userBetsForMarket.length > 0) {
      const hasVybe = userBetsForMarket.some(b => b.type === 'VYBE');
      const hasNoVybe = userBetsForMarket.some(b => b.type === 'NO_VYBE');
      
      if (hasVybe && hasNoVybe) {
        finalBetType = 'HEDGED';
      } else if (hasVybe) {
        finalBetType = 'VYBE';
      } else if (hasNoVybe) {
        finalBetType = 'NO_VYBE';
      }
    }
    
    const newMessage = {
      id: Date.now(),
      marketId,
      text,
      user,
      avatar,
      betType: finalBetType, 
      timestamp: new Date().toISOString(),
      color: 'text-fuchsia-500'
    };

    setChatMessages((prev: any) => [...prev, newMessage]);
  };

  const placeBet = (marketId: number, type: 'VYBE' | 'NO_VYBE', amount: number) => {
    if (balance < amount) {
      showToast("Insufficient balance!", "error");
      return;
    }
    
    setBalance(prev => prev - amount);
    
    const newBet = {
      id: Date.now(),
      marketId,
      type,
      amount,
      entryPrice: (marketPrices[marketId]?.[type === 'VYBE' ? 'vibe' : 'noVibe'] || 0.5) * 100
    };
    
    setMyBets(prev => [...prev, newBet]);
    showToast(`Successfully bet ${amount} USDC on ${type}!`, "success");
  };

  return (
    <AppContext.Provider value={{
      markets, setMarkets,
      isLoggedIn, setIsLoggedIn,
      isAuthLoading, setIsAuthLoading,
      walletAddress, setWalletAddress,
      balance, setBalance,
      marketPrices, setMarketPrices,
      myBets, setMyBets,
      chatMessages, setChatMessages, sendChatMessage,
      selectedMarket, setSelectedMarket,
      avatarUrl, setAvatarUrl,
      nickname, setNickname,
      isDarkMode, toggleDarkMode,
      marketStatus, setMarketStatus,
      dynamicLeaderboard,
      showToast,
      isLoginModalOpen, setIsLoginModalOpen,
      connectWallet, handleLogout,
      loginWithTwitter, loginWithDiscord, loginWithEmail,
      placeBet
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