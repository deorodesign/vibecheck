'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// === DUMMY DATA ===
export const CATEGORIES = ['All', 'Trending', 'Music', 'Movies', 'Drama', 'Sports', 'Crypto', 'Tech', 'Entertainment'];

export const MARKETS = [
  { id: 1, category: 'Drama', imageUrl: '/taylor.jpeg', title: "Will Taylor Swift & Travis Kelce get engaged?", vibePrice: 0.73, noVibePrice: 0.27, volume: "$1.2M", volumeUsd: 1200000, endDate: "Dec 31, 2026", resolutionSource: "Official announcement via their social media accounts or confirmation by reputable outlets (People, TMZ)." },
  { id: 2, category: 'Sports', imageUrl: '/paul-tyson.jpg', title: "Will Jake Paul knock out Mike Tyson?", vibePrice: 0.45, noVibePrice: 0.55, volume: "$850K", volumeUsd: 850000, endDate: "Jul 20, 2026", resolutionSource: "Official fight results announced in the ring and confirmed by the athletic commission." },
  { id: 3, category: 'Drama', imageUrl: '/kylie.jpeg', title: "Will Kylie Jenner announce another pregnancy this year?", vibePrice: 0.31, noVibePrice: 0.69, volume: "$420K", volumeUsd: 420000, endDate: "Dec 31, 2026", resolutionSource: "Official confirmation directly from Kylie Jenner's social media or her official publicist." },
  { id: 4, category: 'Tech', imageUrl: '/tiktok.png', title: "Will TikTok be officially banned in the EU?", vibePrice: 0.15, noVibePrice: 0.85, volume: "$2.1M", volumeUsd: 2100000, endDate: "Jan 1, 2027", resolutionSource: "Official legislative ruling published by the European Commission confirming a full ban." },
  { id: 5, category: 'Entertainment', imageUrl: '/mrbeast.jpeg', title: "Will MrBeast reach 500M subscribers by 2027?", vibePrice: 0.88, noVibePrice: 0.12, volume: "$3.4M", volumeUsd: 3400000, endDate: "Jan 1, 2027", resolutionSource: "Subscriber count exactly as displayed on the official MrBeast YouTube channel." },
  { id: 6, category: 'Drama', imageUrl: '/affleck.jpeg', title: "Will Ben Affleck & JLo finalize divorce this month?", vibePrice: 0.92, noVibePrice: 0.08, volume: "$150K", volumeUsd: 150000, endDate: "Nov 30, 2026", resolutionSource: "Public court records or official joint statement confirming the divorce is legally finalized." }
];

const INITIAL_MESSAGES = [
  { id: 1, marketId: 1, user: 'CryptoBro', text: 'She is wearing the ring already 👀', avatar: '', color: 'text-fuchsia-500', timestamp: '2026-03-01T10:00:00Z' },
  { id: 2, marketId: 1, user: 'Swiftie99', text: 'No way, they are focusing on careers rn.', avatar: '', color: 'text-orange-500', timestamp: '2026-03-01T10:05:00Z' }
];

const INITIAL_LEADERBOARD = [
  { id: '1', rank: 1, name: 'CryptoBro', address: '0x7f...92a1', points: 24500, color: 'from-yellow-400 to-yellow-600', avatar: '' },
  { id: '2', rank: 2, name: 'Satoshi99', address: '0x1A...4b2C', points: 18200, color: 'from-zinc-300 to-zinc-500', avatar: '' },
  { id: '3', rank: 3, name: 'VybeKing', address: '0x9C...11dF', points: 15840, color: 'from-orange-400 to-orange-600', avatar: '' },
];

interface AppContextType {
  isLoggedIn: boolean;
  walletAddress: string;
  balance: number;
  connectWallet: () => void;
  handleLogout: () => void;
  marketPrices: Record<number, { vibe: number, noVibe: number }>;
  myBets: Array<{ marketId: number, type: 'VYBE' | 'NO_VYBE', amount: number, entryPrice: number }>;
  placeBet: (marketId: number, type: 'VYBE' | 'NO_VYBE', amount?: number) => void;
  chatMessages: Array<any>;
  sendChatMessage: (marketId: number, text: string, senderNickname?: string, senderAvatar?: string) => void;
  selectedMarket: any | null;
  setSelectedMarket: (market: any | null) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  nickname: string;
  setNickname: (name: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  addFunds: () => void;
  marketStatus: Record<number, 'VYBE' | 'NO_VYBE'>;
  resolveMarket: (marketId: number, outcome: 'VYBE' | 'NO_VYBE') => void;
  dynamicLeaderboard: Array<any>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  
  // TOAST STAV
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [marketPrices, setMarketPrices] = useState<Record<number, { vibe: number, noVibe: number }>>({
    1: { vibe: 0.73, noVibe: 0.27 },
    2: { vibe: 0.45, noVibe: 0.55 },
    3: { vibe: 0.31, noVibe: 0.69 },
    4: { vibe: 0.15, noVibe: 0.85 },
    5: { vibe: 0.88, noVibe: 0.12 },
    6: { vibe: 0.92, noVibe: 0.08 },
  });
  
  const [myBets, setMyBets] = useState<Array<{ marketId: number, type: 'VYBE' | 'NO_VYBE', amount: number, entryPrice: number }>>([]);
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);
  const [selectedMarket, setSelectedMarket] = useState<any | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [nickname, setNickname] = useState("PLAYER_ONE");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [marketStatus, setMarketStatus] = useState<Record<number, 'VYBE' | 'NO_VYBE'>>({});
  const [dynamicLeaderboard, setDynamicLeaderboard] = useState(INITIAL_LEADERBOARD);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Funkce pro zobrazení moderní notifikace
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const connectWallet = () => {
    setIsLoggedIn(true);
    const mockAddress = `0xbc88${Math.floor(Math.random() * 10000)}e4a3`;
    setWalletAddress(mockAddress);
    setBalance(500);
    showToast(`Wallet connected! You received 500 USDC demo funds.`, 'success');
    
    setDynamicLeaderboard(prev => {
      if (prev.find(u => u.id === 'me')) return prev;
      return [...prev, { id: 'me', rank: 0, name: nickname, address: mockAddress.slice(0, 6) + '...' + mockAddress.slice(-4), points: 0, color: 'from-fuchsia-500 to-orange-500', avatar: avatarUrl }].sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setWalletAddress("");
    setBalance(0);
    setMyBets([]);
    setDynamicLeaderboard(INITIAL_LEADERBOARD);
    showToast("Logged out successfully.", "info");
  };

  const placeBet = (marketId: number, type: 'VYBE' | 'NO_VYBE', amount: number = 10) => {
    if (balance < amount) {
      showToast("Insufficient funds!", "error");
      return;
    }
    
    setBalance(prev => prev - amount);
    
    const currentMarketPrice = marketPrices[marketId] || { vibe: 0.5, noVibe: 0.5 };
    const currentPrice = type === 'VYBE' ? currentMarketPrice.vibe : currentMarketPrice.noVibe;
    
    setMyBets(prev => [...prev, { marketId, type, amount: amount, entryPrice: currentPrice }]);

    setMarketPrices(prev => {
      const p = prev[marketId] || { vibe: 0.5, noVibe: 0.5 };
      const moveFactor = Math.min(0.05, (amount / 500) * 0.1); 
      if (type === 'VYBE') {
        return { ...prev, [marketId]: { vibe: Math.min(0.99, p.vibe + moveFactor), noVibe: Math.max(0.01, p.noVibe - moveFactor) } };
      } else {
        return { ...prev, [marketId]: { vibe: Math.max(0.01, p.vibe - moveFactor), noVibe: Math.min(0.99, p.noVibe + moveFactor) } };
      }
    });

    showToast(`Successfully bought ${amount} USDC worth of ${type.replace('_', ' ')}!`, 'success');
  };

  const addFunds = () => {
    setBalance(prev => prev + 100);
    showToast("100 USDC Airdropped to your wallet!", "success");
  };

  const sendChatMessage = (marketId: number, text: string, senderNickname: string = "PLAYER", senderAvatar: string = "") => {
    const newMessage = { id: Date.now(), marketId, user: senderNickname, text, avatar: senderAvatar, color: "text-fuchsia-500", timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const resolveMarket = (marketId: number, outcome: 'VYBE' | 'NO_VYBE') => {
    setMarketStatus(prev => ({ ...prev, [marketId]: outcome }));
    let winnings = 0;
    myBets.forEach(bet => {
      if (bet.marketId === marketId && bet.type === outcome) {
        winnings += (bet.amount / bet.entryPrice) * 1;
      }
    });
    if (winnings > 0) {
      setBalance(prev => prev + winnings);
      showToast(`Market Resolved to ${outcome}! You won ${winnings.toFixed(2)} USDC!`, 'success');
    } else {
      showToast(`Market Resolved to ${outcome}. Better luck next time!`, 'info');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setDynamicLeaderboard(prev => prev.map(u => u.id === 'me' ? { ...u, name: nickname, avatar: avatarUrl } : u));
    }
  }, [nickname, avatarUrl, isLoggedIn]);

  return (
    <AppContext.Provider value={{ isLoggedIn, walletAddress, balance, connectWallet, handleLogout, marketPrices, myBets, placeBet, chatMessages, sendChatMessage, selectedMarket, setSelectedMarket, avatarUrl, setAvatarUrl, nickname, setNickname, isDarkMode, toggleDarkMode, addFunds, marketStatus, resolveMarket, dynamicLeaderboard, showToast }}>
      {children}
      
      {/* Vykreslení TOAST okénka */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl border backdrop-blur-md whitespace-nowrap ${
            toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' :
            toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' :
            'bg-zinc-100/90 dark:bg-zinc-900/90 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white'
          }`}>
            <span className="text-lg">
              {toast.type === 'success' ? '🔥' : toast.type === 'error' ? '🛑' : '💡'}
            </span>
            <span className="font-bold text-xs uppercase tracking-widest">{toast.msg}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}