'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export const MARKETS = [
  { id: 1, category: 'Drama', imageUrl: '/taylor.jpeg', title: "Will Taylor Swift & Travis Kelce get engaged?", vibePrice: 0.73, noVibePrice: 0.27, volume: "$1.2M", volumeUsd: 1200000, endDate: "Dec 31, 2026" },
  { id: 2, category: 'Sports', imageUrl: '/paul-tyson.jpg', title: "Will Jake Paul knock out Mike Tyson?", vibePrice: 0.45, noVibePrice: 0.55, volume: "$850K", volumeUsd: 850000, endDate: "Jul 20, 2026" },
  { id: 3, category: 'Drama', imageUrl: '/kylie.jpeg', title: "Will Kylie Jenner announce another pregnancy this year?", vibePrice: 0.31, noVibePrice: 0.69, volume: "$420K", volumeUsd: 420000, endDate: "Dec 31, 2026" },
  { id: 4, category: 'Tech', imageUrl: '/tiktok.png', title: "Will TikTok be officially banned in the EU?", vibePrice: 0.15, noVibePrice: 0.85, volume: "$2.1M", volumeUsd: 2100000, endDate: "Jan 1, 2027" },
  { id: 5, category: 'Entertainment', imageUrl: '/mrbeast.jpeg', title: "Will MrBeast reach 500M subscribers by 2027?", vibePrice: 0.88, noVibePrice: 0.12, volume: "$3.4M", volumeUsd: 3400000, endDate: "Jan 1, 2027" },
  { id: 6, category: 'Drama', imageUrl: '/affleck.jpeg', title: "Will Ben Affleck & JLo finalize divorce this month?", vibePrice: 0.92, noVibePrice: 0.08, volume: "$150K", volumeUsd: 150000, endDate: "Nov 30, 2026" }
];

export const CATEGORIES = ['All', 'Trending', 'Music', 'Movies', 'Drama', 'Sports', 'Crypto', 'Tech', 'Entertainment'];

// PŘIDÁNO : any[] ABY TYPESCRIPT NEKŘIČEL KVŮLI AVATARŮM
const BASE_BOTS: any[] = [
  { id: 'bot1', name: "CryptoBro", address: "0x7F...92a1", points: 24500, color: "from-yellow-400 to-yellow-600", avatar: null },
  { id: 'bot2', name: "Satoshi99", address: "0x1A...4b2C", points: 18200, color: "from-zinc-300 to-zinc-500", avatar: null },
  { id: 'bot3', name: "VybeKing", address: "0x9C...11dF", points: 15840, color: "from-amber-600 to-orange-700", avatar: null },
  { id: 'bot4', name: "WhaleAlert", address: "0x4D...88eE", points: 12100, color: "from-blue-400 to-blue-600", avatar: null },
  { id: 'bot5', name: "DegenTrader", address: "0x2B...55fA", points: 9450, color: "from-purple-400 to-purple-600", avatar: null },
];

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(142.50);
  const [nickname, setNickname] = useState("Player_One");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [marketStatus, setMarketStatus] = useState<Record<number, 'VYBE' | 'NO_VYBE' | null>>({});
  
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  
  const [marketPrices, setMarketPrices] = useState<any>({ 
    1: {vibe: 0.73, noVibe: 0.27}, 2: {vibe: 0.45, noVibe: 0.55}, 
    3: {vibe: 0.31, noVibe: 0.69}, 4: {vibe: 0.15, noVibe: 0.85}, 
    5: {vibe: 0.88, noVibe: 0.12}, 6: {vibe: 0.92, noVibe: 0.08} 
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('vybecheck_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setIsLoggedIn(data.isLoggedIn ?? false);
      setWalletAddress(data.walletAddress ?? "");
      setBalance(data.balance ?? 142.50);
      setNickname(data.nickname ?? "Player_One");
      setAvatarUrl(data.avatarUrl ?? null);
      setMyBets(data.myBets ?? []);
      setMarketStatus(data.marketStatus ?? {});
      setIsDarkMode(data.isDarkMode ?? true);
      
      if (data.isDarkMode === false) document.documentElement.classList.remove('dark');
      
      if (data.chatMessages) {
        const validChats = data.chatMessages.filter((msg: any) => msg.marketId);
        setChatMessages(validChats);
      }
      
      if (data.marketPrices) setMarketPrices(data.marketPrices);
    }
    setIsLoaded(true);

    const syncTabs = (e: StorageEvent) => {
      if (e.key === 'vybecheck_data' && e.newValue) {
        const data = JSON.parse(e.newValue);
        setMyBets(data.myBets ?? []);
        setMarketStatus(data.marketStatus ?? {});
        setBalance(data.balance ?? 142.50);
        if (data.chatMessages) {
          setChatMessages(data.chatMessages.filter((msg: any) => msg.marketId));
        }
      }
    };
    window.addEventListener('storage', syncTabs);
    return () => window.removeEventListener('storage', syncTabs);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const dataToSave = { isLoggedIn, walletAddress, balance, nickname, avatarUrl, myBets, isDarkMode, chatMessages, marketPrices, marketStatus };
    localStorage.setItem('vybecheck_data', JSON.stringify(dataToSave));
  }, [isLoggedIn, walletAddress, balance, nickname, avatarUrl, myBets, isDarkMode, chatMessages, marketPrices, marketStatus, isLoaded]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => {
      const newMode = !prev;
      if (newMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newMode;
    });
  };

  const connectWallet = () => { setWalletAddress("0xbc88...e4a3"); setIsLoggedIn(true); };
  const handleLogout = () => { setIsLoggedIn(false); setWalletAddress(""); };
  
  const placeBet = (marketId: number, type: string) => { 
    if (marketStatus[marketId]) { alert("This market is already resolved!"); return; }
    if (balance >= 10) {
      const currentPrice = type === 'VYBE' ? marketPrices[marketId].vibe : marketPrices[marketId].noVibe;
      setBalance(b => b - 10);
      setMyBets(prev => [...prev, { id: Date.now(), marketId, type, amount: 10, entryPrice: currentPrice }]);

      setMarketPrices((prevPrices: any) => {
        const current = prevPrices[marketId];
        if (!current) return prevPrices;
        let newVibe = current.vibe;
        let newNoVibe = current.noVibe;
        if (type === 'VYBE') {
          newVibe = Math.min(0.98, newVibe + 0.02);
          newNoVibe = 1 - newVibe;
        } else {
          newNoVibe = Math.min(0.98, newNoVibe + 0.02);
          newVibe = 1 - newNoVibe;
        }
        return { ...prevPrices, [marketId]: { vibe: newVibe, noVibe: newNoVibe } };
      });
    }
  };

  const resolveMarket = (marketId: number, winningOutcome: 'VYBE' | 'NO_VYBE') => {
    if (marketStatus[marketId]) return; 
    const rawData = localStorage.getItem('vybecheck_data');
    const safeBets = rawData ? JSON.parse(rawData).myBets || myBets : myBets;

    setMarketStatus(prev => ({ ...prev, [marketId]: winningOutcome }));

    let totalPayout = 0;
    safeBets.forEach((bet: any) => {
      if (bet.marketId === marketId && bet.type === winningOutcome) {
         const shares = bet.amount / (bet.entryPrice || 0.5);
         totalPayout += shares * 1; 
      }
    });
    if (totalPayout > 0) setBalance(b => b + totalPayout);
  };
  
  const sendChatMessage = (marketId: number, text: string) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now(), marketId, user: nickname, avatar: avatarUrl, color: 'text-orange-500', text }]);
  };

  const addFunds = () => { setBalance(b => b + 100); };

  let userWins = 0;
  let totalWagered = 0;

  // OPRAVA: PŘIDÁNO (bet: any)
  myBets.forEach((bet: any) => {
    totalWagered += bet.amount;
    const status = marketStatus[bet.marketId];
    if (status && status === bet.type) userWins++;
  });

  const userPoints = 1000 + (totalWagered * 10) + (userWins * 500);
  const currentLeaderboard = [...BASE_BOTS];
  
  if (isLoggedIn) {
    currentLeaderboard.push({
      id: 'me',
      name: `${nickname} (You)`,
      address: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "",
      points: userPoints,
      color: "from-fuchsia-500 to-orange-500",
      avatar: avatarUrl
    });
  }

  currentLeaderboard.sort((a, b) => b.points - a.points);
  const dynamicLeaderboard = currentLeaderboard.slice(0, 5).map((user, index) => ({
    ...user,
    rank: index + 1
  }));

  return (
    <AppContext.Provider value={{
      isLoggedIn, walletAddress, balance, connectWallet, handleLogout,
      marketPrices, myBets, placeBet, chatMessages, sendChatMessage,
      isDarkMode, toggleDarkMode, selectedMarket, setSelectedMarket, 
      nickname, setNickname, avatarUrl, setAvatarUrl, addFunds,
      marketStatus, resolveMarket, dynamicLeaderboard 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);