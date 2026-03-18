'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { balance, userXp, myBets, markets, isAuthLoading, nickname, avatarUrl, walletAddress, showToast } = useAppContext();
  
  // Stavy pro Wallet
  const [payoutAddress, setPayoutAddress] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);

  // Stavy pro Profil (Jméno a Avatar)
  const [inputName, setInputName] = useState('');
  const [inputAvatar, setInputAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const baseStartingBalance = 500;

  // 1. NAČTENÍ ULOŽENÉ PENĚŽENKY ZE SUPABASE
  useEffect(() => {
    const fetchWallet = async () => {
      if (walletAddress) {
        const { data } = await supabase
          .from('users')
          .select('payout_wallet')
          .eq('wallet_address', walletAddress)
          .single();
          
        if (data && data.payout_wallet) {
          setPayoutAddress(data.payout_wallet);
        }
      }
    };
    fetchWallet();
  }, [walletAddress]);

  // Synchronizace s kontextem pro Profil
  useEffect(() => {
    setInputName(nickname || '');
    setInputAvatar(avatarUrl || '');
  }, [nickname, avatarUrl]);

  // 2. BEZPEČNÉ ULOŽENÍ PENĚŽENKY PŘES RPC FUNKCI
  const saveWallet = async () => {
    if (!payoutAddress.trim()) {
      return showToast('Please enter a valid wallet address.', 'error');
    }
    
    setSavingWallet(true);
    
    const { error } = await supabase.rpc('save_payout_wallet', {
      p_wallet: payoutAddress.trim()
    });

    if (error) {
      showToast(`Error saving wallet: ${error.message}`, 'error');
    } else {
      showToast('Payout wallet saved successfully!', 'success');
    }
    
    setSavingWallet(false);
  };

  // 3. FUNKCE PRO ULOŽENÍ JMÉNA A AVATARU
  const saveProfile = async () => {
    if (!inputName.trim()) {
      return showToast('Nickname cannot be empty.', 'error');
    }

    setSavingProfile(true);

    try {
      // Zde volejte svou aktualizační logiku pro Supabase nebo kontext
      // Příklad:
      const { error } = await supabase
        .from('users')
        .update({ nickname: inputName.trim(), avatar_url: inputAvatar.trim() })
        .eq('wallet_address', walletAddress);

      if (error) throw error;
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(`Error updating profile: ${error.message}`, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const enrichedBets = myBets.map((bet: any) => {
    const marketDetails = markets.find((m: any) => m.id === bet.marketId);
    return {
      ...bet,
      markets: marketDetails || { title: 'Unknown Market', image_url: '' }
    };
  });

  const activeBetsList = enrichedBets.filter((b: any) => b.status === 'pending' || !b.status);
  const resolvedBetsList = enrichedBets.filter((b: any) => b.status === 'won' || b.status === 'lost');

  const totalVolume = enrichedBets.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  const activeBetsValue = activeBetsList.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  
  const safeBalance = balance || 0;
  const currentPortfolioValue = safeBalance + activeBetsValue;

  const netReturn = baseStartingBalance > 0 
    ? ((currentPortfolioValue - baseStartingBalance) / baseStartingBalance) * 100 
    : 0;

  const wins = resolvedBetsList.filter((b: any) => b.status === 'won').length;
  const losses = resolvedBetsList.filter((b: any) => b.status === 'lost').length;

  if (isAuthLoading) return <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] flex items-center justify-center font-black uppercase tracking-widest text-fuchsia-500 italic">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] text-zinc-900 dark:text-white transition-colors duration-500 font-sans p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HLAVIČKA A NAVIGACE */}
        <header className="w-full flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-white/5">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 group-hover:border-zinc-400 dark:group-hover:border-white/30 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest">Back to Markets</span>
          </Link>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter italic cursor-default">
            Vybecheck
          </h1>
        </header>

        {/* PROFILOVÁ KARTA - STATISTIKY */}
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-3xl font-black shadow-lg text-white border-4 border-white dark:border-[#18181b] overflow-hidden">
              {inputAvatar ? <img src={inputAvatar} alt="Avatar" className="w-full h-full object-cover" /> : (nickname ? nickname.charAt(0).toUpperCase() : 'V')}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-widest mb-1">{inputName || 'ANONYMOUS VYBER'}</h2>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Bankroll: <span className="text-green-500 text-sm font-mono">{safeBalance.toFixed(2)} USDC</span>
                </p>
                <p className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest">
                  Season XP: {userXp || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:border-l border-zinc-200 dark:border-white/10 md:pl-8 mt-6 md:mt-0 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0">
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Volume Traded</p>
              <p className="text-xl font-black font-mono">${totalVolume.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Active Bets</p>
              <p className="text-xl font-black font-mono">{activeBetsList.length}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Net P/L</p>
              <p className={`text-xl font-black font-mono ${netReturn > 0 ? 'text-green-500' : netReturn < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                {netReturn > 0 ? '+' : ''}{netReturn.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Win / Loss</p>
              <p className="text-xl font-black font-mono">
                <span className="text-green-500">{wins}</span> <span className="text-zinc-300 dark:text-zinc-600">/</span> <span className="text-red-500">{losses}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEVÝ SLOUPEC: NASTAVENÍ PROFILU A PENĚŽENKY */}
          <div className="flex flex-col gap-8">
            
            {/* SEKCE: EDITACE PROFILU (Nové) */}
            <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-black uppercase italic tracking-widest mb-2">Public Identity</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                  Customize how others see you on the leaderboard and in chat.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Your cool nickname"
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-fuchsia-500 transition-colors text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Profile Picture URL</label>
                  <input 
                    type="text" 
                    value={inputAvatar}
                    onChange={(e) => setInputAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-fuchsia-500 transition-colors text-zinc-900 dark:text-white"
                  />
                  <p className="text-[9px] text-zinc-400 mt-2 font-bold uppercase tracking-widest">Paste a direct link to an image (e.g. from X, Imgur, or an NFT).</p>
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95 font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* SEKCE: PAYOUT WALLET (Původní) */}
            <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-black uppercase italic tracking-widest mb-2">Payout Wallet</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                  Add your Solana or EVM address to receive monthly USDC airdrops if you make it to the top 5.
                </p>
              </div>

              <div className="bg-fuchsia-50/50 dark:bg-fuchsia-500/5 border border-fuchsia-200 dark:border-fuchsia-500/20 rounded-2xl p-5 mb-6 shadow-inner">
                <div className="flex items-center gap-2 text-fuchsia-500 dark:text-fuchsia-400 font-black text-xs uppercase tracking-widest mb-3">
                  <span className="text-base">⚠️</span> Important Disclaimer
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  Vybecheck is currently a <strong>free-to-play</strong> platform. Your Bankroll consists of virtual points (Play Money) and <strong>cannot</strong> be withdrawn. We do not accept real-money deposits. 
                  <br /><br />
                  This payout address is strictly used by our team to manually reward our best players.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={payoutAddress}
                  onChange={(e) => setPayoutAddress(e.target.value)}
                  placeholder="Paste your 0x... or Solana address here" 
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-fuchsia-500 transition-colors text-zinc-900 dark:text-white font-mono"
                />
                <button 
                  onClick={saveWallet}
                  disabled={savingWallet}
                  className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95 font-black px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {savingWallet ? 'Saving...' : 'Save Wallet'}
                </button>
              </div>
            </div>
          </div>

          {/* PRAVÝ SLOUPEC: SÁZKY A HISTORIE */}
          <div className="flex flex-col gap-8">
            
            {/* ACTIVE BETS */}
            <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-lg font-black uppercase italic tracking-widest mb-6">My Active Bets</h3>
              <div className="space-y-4">
                {activeBetsList.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center border border-zinc-200 dark:border-white/10 border-dashed rounded-[1.5rem] bg-zinc-50 dark:bg-white/5">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">No active bets.</p>
                    <Link href="/" className="px-6 py-3 rounded-xl bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">Start Trading</Link>
                  </div>
                ) : (
                  activeBetsList.map((bet: any) => (
                    <div key={bet.id} className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-colors shadow-sm">
                      <div className="flex items-center gap-4">
                        {(bet.markets?.image_url || bet.markets?.imageUrl) && (
                          <img src={bet.markets?.image_url || bet.markets?.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-white/10 shadow-sm" />
                        )}
                        <div>
                          <p className="font-bold text-xs line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                            Bet: <span className={bet.type === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{bet.type}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm font-mono">{bet.amount} USDC</p>
                        <p className="text-[9px] font-mono text-zinc-500 mt-1">Entry: {(bet.entryPrice || 50).toFixed(0)}¢</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* HISTORY */}
            <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-lg font-black uppercase italic tracking-widest mb-6">History</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {resolvedBetsList.length === 0 ? (
                  <div className="text-center py-10 border border-zinc-200 dark:border-white/10 border-dashed rounded-[1.5rem] bg-zinc-50 dark:bg-white/5">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">No history yet.</p>
                  </div>
                ) : (
                  resolvedBetsList.map((bet: any) => (
                    <div key={bet.id} className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 opacity-80 hover:opacity-100 transition-opacity">
                      <div>
                        <p className="font-bold text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                          {bet.type} | <span className={bet.status === 'won' ? 'text-green-500' : 'text-red-500'}>{bet.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xs text-zinc-500 font-mono">{bet.amount} USDC</p>
                        <p className={`text-[10px] font-black font-mono tracking-widest mt-1 ${bet.status === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                          {bet.status === 'won' ? '+' : ''}{(bet.payout || 0).toFixed(2)} USDC
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}