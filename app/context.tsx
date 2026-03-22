'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import Link from 'next/link';

// NOVÉ KATEGORIE
export const CATEGORIES = ['The Feed', 'On Fire', 'Internet Drama', 'The Boring Stuff', 'Degen Moves', 'Pure Vybe'];

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

  const [latestArchive, setLatestArchive] = useState<any>(null);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [isTop3Winner, setIsTop3Winner] = useState(false);
  const [playerRank, setPlayerRank] = useState<number | null>(null);

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
    if (data) {
      setMyBets(data.map(b => ({ ...b, marketId: b.market_id, entryPrice: b.entry_price })));
    }
  }, []);

  const handleSupabaseSession = useCallback(async (session: any) => {
    setIsAuthLoading(true);
    resetAppStaleState();

    if (session && session.user) {
      const userEmail = session.user.email;
      const { data: user } = await supabase.from('users').select('nickname, balance, xp_points, avatar_url').eq('wallet_address', userEmail).single();
      
      if (user) {
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

  const fetchData = useCallback(async () => {
    const { data: marketsData } = await supabase.from('markets').select('*').order('created_at', { ascending: false });
    const { data: allBets } = await supabase.from('bets').select('market_id, type, amount, status');

    if (marketsData) {
      setMarkets(marketsData.map(m => ({ ...m, imageUrl: m.image_url, volumeUsd: m.volume_usd, volume: `$${m.volume_usd || 0}`, resolutionSource: m.resolution_source })));
      
      let pools: any = {};
      marketsData.forEach((m: any) => { pools[m.id] = { vybe: 0, noVybe: 0 }; });

      if (allBets) {
        allBets.forEach((b: any) => {
          if (b.status === 'cashed_out') return;
          if (!pools[b.market_id]) pools[b.market_id] = { vybe: 0, noVybe: 0 };
          if (b.type === 'VYBE') pools[b.market_id].vybe += Number(b.amount);
          if (b.type === 'NO_VYBE') pools[b.market_id].noVybe += Number(b.amount);
        });
      }

      let prices: any = {};
      let statuses: any = {};
      
      marketsData.forEach((m: any) => {
        const vp = pools[m.id].vybe;
        const np = pools[m.id].noVybe;
        const LIQUIDITY = 100;
        let v = (vp + LIQUIDITY) / (vp + np + (LIQUIDITY * 2));
        v = Math.max(0.01, Math.min(0.99, v)); 
        prices[m.id] = { vibe: v, noVibe: 1 - v, vybePool: vp, noVybePool: np };
        if (m.is_resolved) statuses[m.id] = m.winning_outcome;
      });
      
      setMarketPrices(prices);
      setMarketStatus(statuses);
    }

    const { data: chatData } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
    if (chatData) {
      setChatMessages(chatData.map(c => ({ id: c.id, marketId: c.market_id, parentId: c.parent_id || null, text: c.text, user: c.user_name, avatar: c.avatar_url || '', betType: c.bet_type, timestamp: c.created_at, color: c.color || 'text-fuchsia-500', likedBy: c.liked_by || [] })));
    }

    const { data: usersData } = await supabase.from('users').select('*').order('xp_points', { ascending: false }).limit(10);
    if (usersData) {
      const colors = ['from-yellow-400 to-yellow-600', 'from-zinc-300 to-zinc-500', 'from-orange-400 to-orange-600', 'from-blue-400 to-blue-600', 'from-green-400 to-green-600'];
      setDynamicLeaderboard(usersData.map((u, i) => {
        const isEmail = u.wallet_address && u.wallet_address.includes('@');
        const displayAddress = isEmail ? '' : (u.wallet_address ? `${u.wallet_address.substring(0, 4)}...${u.wallet_address.slice(-4)}` : '');
        
        return {
          id: u.wallet_address || `unknown-${i}`, 
          rank: i + 1, 
          name: u.nickname || 'Anonymous Vyber',
          address: displayAddress,
          points: u.xp_points || 0, 
          avatar: u.avatar_url || '', 
          color: colors[i] || 'from-fuchsia-400 to-fuchsia-600' 
        };
      }));
    }

    const { data: archiveData } = await supabase.from('season_archives').select('*').order('season_date', { ascending: false }).limit(1).single();
    if (archiveData) {
      setLatestArchive(archiveData);
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData && sessionData.session && sessionData.session.user && sessionData.session.user.email) {
      const { data: betsData } = await supabase.from('bets').select('*').eq('user_address', sessionData.session.user.email);
      if (betsData) {
        setMyBets(betsData.map(b => ({ ...b, marketId: b.market_id, entryPrice: b.entry_price })));
      }
    }
  }, []);

  useEffect(() => {
    let betSubscription: any = null;

    fetchData();

    betSubscription = supabase.channel('realtime-vybe')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bets' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'season_archives' }, () => fetchData()) 
      .subscribe();

    return () => { if (betSubscription) supabase.removeChannel(betSubscription); };
  }, [fetchData]);

  useEffect(() => {
    if (isLoggedIn && walletAddress && latestArchive) {
      const seenArchiveId = localStorage.getItem('seen_season_archive_id');
      
      if (seenArchiveId !== latestArchive.id.toString()) {
        const topPlayers = latestArchive.top_players || [];
        const index = topPlayers.findIndex((p: any) => p.wallet_address === walletAddress);
        
        // ZMĚNA ZDE: Upozorní jen hráče v Top 3
        if (index !== -1 && index < 3) {
          setIsTop3Winner(true);
          setPlayerRank(index + 1);
        } else {
          setIsTop3Winner(false);
          setPlayerRank(index !== -1 ? index + 1 : null);
        }
        
        setTimeout(() => setShowSeasonModal(true), 1500);
      }
    }
  }, [isLoggedIn, walletAddress, latestArchive]);

  const closeSeasonModal = () => {
    if (latestArchive) {
      localStorage.setItem('seen_season_archive_id', latestArchive.id.toString());
    }
    setShowSeasonModal(false);
  };

  const connectWallet = () => setIsLoginModalOpen(true);
  
  const loginWithEmail = async (email: string) => {
    if(!email) return showToast("Please enter an email", "error");
    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email, options: { emailRedirectTo: window.location.origin }});
    if (error) { showToast(`Error: ${error.message}`, "error"); setIsAuthLoading(false); } 
    else { showToast("Magic Link sent! Check your inbox.", "success"); setIsLoginModalOpen(false); }
  };
  const loginWithTwitter = async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: 'x' as any }); if(error) showToast(error.message, "error"); };
  const loginWithDiscord = async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: 'discord' }); if(error) showToast(error.message, "error"); };
  const loginWithGoogle = async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { queryParams: { access_type: 'offline', prompt: 'consent' } }}); if(error) showToast(error.message, "error"); };

  const handleLogout = async () => {
    resetAppStaleState();
    await supabase.auth.signOut();
    localStorage.removeItem('vybe_session'); 
    showToast("Logged out.", "info");
    window.location.reload();
  };

  const sendChatMessage = async (marketId: number, text: string, user: string, avatar: string, parentId: string | null = null) => {
    const activeUserBetsForMarket = myBets.filter((bet: any) => bet.marketId === marketId && (!bet.status || bet.status === 'pending'));
    let finalBetType = null;
    if (activeUserBetsForMarket.length > 0) {
      if (activeUserBetsForMarket.some(b => b.type === 'VYBE') && activeUserBetsForMarket.some(b => b.type === 'NO_VYBE')) finalBetType = 'HEDGED';
      else if (activeUserBetsForMarket.some(b => b.type === 'VYBE')) finalBetType = 'VYBE';
      else if (activeUserBetsForMarket.some(b => b.type === 'NO_VYBE')) finalBetType = 'NO_VYBE';
    }
    const tempMessage = { id: crypto.randomUUID(), marketId, parentId, text, user, avatar, betType: finalBetType, timestamp: new Date().toISOString(), color: 'text-fuchsia-500', likedBy: [] };
    
    setChatMessages((prev: any) => [...prev, tempMessage]);
    await supabase.from('chat_messages').insert([{ market_id: marketId, parent_id: parentId, user_name: user, avatar_url: avatar, text: text, bet_type: finalBetType, color: 'text-fuchsia-500', liked_by: [] }]);
  };

  const toggleLikeMessage = async (messageId: string, userName: string) => {
    if (!userName) return;

    const messageToLike = chatMessages.find(m => m.id === messageId);
    if (!messageToLike) return;

    const currentLikes = messageToLike.likedBy || [];
    const newLikes = currentLikes.includes(userName)
      ? currentLikes.filter((u: string) => u !== userName)
      : [...currentLikes, userName];

    setChatMessages((prev: any) => prev.map((msg: any) => {
      if (msg.id === messageId) return { ...msg, likedBy: newLikes };
      return msg;
    }));

    const { error } = await supabase.from('chat_messages').update({ liked_by: newLikes }).eq('id', messageId);
    if (error) console.error("Error saving like:", error.message);
  };

  const placeBet = async (marketId: number, type: 'VYBE' | 'NO_VYBE', amount: number) => {
    if (balance < amount) return showToast("Insufficient balance!", "error");
    const currentPriceRaw = marketPrices[marketId]?.[type === 'VYBE' ? 'vibe' : 'noVibe'] || 0.5;
    const entryPrice = currentPriceRaw * 100;

    const { data, error } = await supabase.rpc('place_bet_secure', {
      p_market_id: marketId, p_user_address: walletAddress, p_user_name: nickname, p_bet_type: type, p_amount: amount, p_entry_price: entryPrice
    });

    if (error) { 
      showToast(`Transaction failed: ${error.message}`, "error");
    } else if (data && data.success) {
      setBalance(data.new_balance);
      setUserXp(data.new_xp);
      setMyBets(prev => [...prev, { id: data.bet_id, marketId, type, amount, entryPrice, status: 'pending' }]);
      fetchData();
      showToast(`Successfully bet ${amount} USDC!`, "success");
    }
  };

  const cashOutBet = async (betId: number, currentPriceRaw: number) => {
    const betToSell = myBets.find(b => b.id === betId);
    if (!betToSell) return;

    const shares = betToSell.amount / (betToSell.entryPrice / 100);
    const cashOutValue = shares * (currentPriceRaw / 100);

    const { data, error } = await supabase.rpc('cash_out_bet', {
      p_bet_id: betId, p_user_address: walletAddress, p_cash_out_value: cashOutValue
    });

    if (error) {
      showToast(`Cash out failed: ${error.message}`, "error");
    } else if (data && data.success) {
      setBalance(data.new_balance);
      setMyBets(prev => prev.map(b => b.id === betId ? { ...b, status: 'cashed_out', payout: cashOutValue } : b));
      fetchData();
      const profit = cashOutValue - betToSell.amount;
      const profitText = profit >= 0 ? `+${profit.toFixed(2)}` : `${profit.toFixed(2)}`;
      showToast(`Cashed out for ${cashOutValue.toFixed(2)} USDC (${profitText})`, "success");
    }
  };

  const claimReliefFund = async () => {
    setIsAuthLoading(true);
    const { data, error } = await supabase.rpc('claim_relief_fund', { p_wallet_address: walletAddress });
    if (error) showToast(`Error: ${error.message}`, "error");
    else if (data && data.success) { setBalance(data.new_balance); showToast(`+50 USDC added to your Bankroll! Stay in the game.`, "success"); } 
    else if (data && !data.success) showToast(data.message, "error");
    setIsAuthLoading(false);
  };

  const claimShareReward = async () => {
    if (!walletAddress) return;
    const { data, error } = await supabase.rpc('claim_share_reward', { p_wallet_address: walletAddress });
    if (error) console.error(error);
    else if (data && data.success) { setBalance(data.new_balance); setUserXp(data.new_xp); showToast(data.message, "success"); } 
    else if (data && !data.success) showToast(data.message, "info");
  };

  return (
    <AppContext.Provider value={{
      markets, setMarkets, isLoggedIn, setIsLoggedIn, isAuthLoading, setIsAuthLoading,
      walletAddress, setWalletAddress, balance, setBalance, userXp, setUserXp,
      marketPrices, setMarketPrices, myBets, setMyBets, chatMessages, setChatMessages, sendChatMessage, toggleLikeMessage,
      selectedMarket, setSelectedMarket, avatarUrl, setAvatarUrl, nickname, setNickname,
      isDarkMode, toggleDarkMode, marketStatus, setMarketStatus, dynamicLeaderboard,
      showToast, isLoginModalOpen, setIsLoginModalOpen, connectWallet, handleLogout,
      loginWithTwitter, loginWithDiscord, loginWithEmail, loginWithGoogle, placeBet, cashOutBet,
      claimReliefFund, claimShareReward, fetchData
    }}>
      {children}
      
      {showSeasonModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className={`relative w-full max-w-md p-8 md:p-10 rounded-[2rem] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500 overflow-hidden ${isTop3Winner ? 'bg-gradient-to-b from-yellow-500/10 to-zinc-950 border-2 border-yellow-500/50' : 'bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10'}`}>
            
            {isTop3Winner && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>}

            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl mb-6 shadow-inner bg-zinc-100 dark:bg-black">
              {isTop3Winner ? '🏆' : '🔄'}
            </div>

            <h2 className={`text-2xl md:text-3xl font-black uppercase italic mb-3 tracking-tighter ${isTop3Winner ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600' : 'text-zinc-900 dark:text-white'}`}>
              {isTop3Winner ? 'You won the season!' : 'Season Ended'}
            </h2>
            
            <div className="text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
              {isTop3Winner ? (
                <>
                  <p className="mb-4">Incredible! You finished <strong>#{playerRank}</strong> on the leaderboard this season.</p>
                  <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs md:text-sm">
                    <strong className="block uppercase tracking-widest mb-1">Your Reward: 50 Real USDC</strong>
                    If you haven't already, please go to your profile and save your Web3 Payout Wallet address so we can airdrop your prize!
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4">The previous season has officially closed and the top players have been archived. All Season XP has been reset to 0.</p>
                  <p className="text-fuchsia-500 font-bold">Your Bankroll remains untouched. The race for the next airdrop starts right now.</p>
                </>
              )}
            </div>

            <div className="flex flex-col w-full gap-3">
              {isTop3Winner && (
                <Link href="/profile" onClick={closeSeasonModal} className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black uppercase tracking-widest text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
                  Set Payout Wallet
                </Link>
              )}
              <button onClick={closeSeasonModal} className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm hover:scale-105 active:scale-95 transition-all ${isTop3Winner ? 'bg-transparent text-zinc-500 hover:text-white' : 'bg-black text-white dark:bg-white dark:text-black shadow-lg'}`}>
                {isTop3Winner ? 'I already did this' : 'Let\'s Go'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toasts.map(toast => (
        <div key={toast.id} className={`fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
          toast.type === 'success' ? 'bg-green-50/95 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400' : 
          toast.type === 'error' ? 'bg-red-50/95 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400' : 
          'bg-zinc-50/95 dark:bg-white/10 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white'
        } backdrop-blur-md pointer-events-none`}>
          {toast.type === 'success' && <span className="text-lg">✓</span>}
          {toast.type === 'error' && <span className="text-lg font-black">!</span>}
          <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      ))}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}