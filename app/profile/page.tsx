'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { balance, userXp, myBets, markets, isAuthLoading, nickname, avatarUrl, walletAddress, showToast } = useAppContext();
  
  const [payoutAddress, setPayoutAddress] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);

  // Stavy pro editaci jména
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Stavy pro editaci Avataru (Modal)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseStartingBalance = 500;

  // 1. NAČTENÍ DAT
  useEffect(() => {
    const fetchWallet = async () => {
      if (walletAddress) {
        const { data } = await supabase.from('users').select('payout_wallet').eq('wallet_address', walletAddress).single();
        if (data && data.payout_wallet) setPayoutAddress(data.payout_wallet);
      }
    };
    fetchWallet();
  }, [walletAddress]);

  useEffect(() => {
    setTempName(nickname || '');
    setAvatarInputUrl(avatarUrl || '');
  }, [nickname, avatarUrl]);

  // 2. ULOŽENÍ PAYOUT WALLET
  const saveWallet = async () => {
    if (!payoutAddress.trim()) return showToast('Please enter a valid wallet address.', 'error');
    setSavingWallet(true);
    const { error } = await supabase.rpc('save_payout_wallet', { p_wallet: payoutAddress.trim() });
    if (error) showToast(`Error saving wallet: ${error.message}`, 'error');
    else showToast('Payout wallet saved successfully!', 'success');
    setSavingWallet(false);
  };

  // 3. ULOŽENÍ JMÉNA (Inline)
  const saveName = async () => {
    if (!tempName.trim()) return showToast('Nickname cannot be empty.', 'error');
    setSavingName(true);
    try {
      const { error } = await supabase.from('users').update({ nickname: tempName.trim() }).eq('wallet_address', walletAddress);
      if (error) throw error;
      showToast('Name updated successfully!', 'success');
      setIsEditingName(false);
    } catch (error: any) {
      showToast(`Error updating name: ${error.message}`, 'error');
    } finally {
      setSavingName(false);
    }
  };

  // 4. ULOŽENÍ AVATARU (URL nebo Upload)
  const saveAvatar = async (urlToSave: string) => {
    setSavingAvatar(true);
    try {
      const { error } = await supabase.from('users').update({ avatar_url: urlToSave }).eq('wallet_address', walletAddress);
      if (error) throw error;
      showToast('Profile picture updated!', 'success');
      setIsAvatarModalOpen(false);
    } catch (error: any) {
      showToast(`Error updating picture: ${error.message}`, 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return showToast('File is too large (max 2MB)', 'error');
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarInputUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // VÝPOČTY STATISTIK
  const enrichedBets = myBets.map((bet: any) => {
    const marketDetails = markets.find((m: any) => m.id === bet.marketId);
    return { ...bet, markets: marketDetails || { title: 'Unknown Market', image_url: '' } };
  });

  const activeBetsList = enrichedBets.filter((b: any) => b.status === 'pending' || !b.status);
  const resolvedBetsList = enrichedBets.filter((b: any) => b.status === 'won' || b.status === 'lost');

  const totalVolume = enrichedBets.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  const activeBetsValue = activeBetsList.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  const safeBalance = balance || 0;
  const currentPortfolioValue = safeBalance + activeBetsValue;

  const netReturn = baseStartingBalance > 0 ? ((currentPortfolioValue - baseStartingBalance) / baseStartingBalance) * 100 : 0;
  const wins = resolvedBetsList.filter((b: any) => b.status === 'won').length;
  const losses = resolvedBetsList.filter((b: any) => b.status === 'lost').length;

  if (isAuthLoading) return <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex items-center justify-center font-black uppercase tracking-widest text-fuchsia-500 italic">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white font-mono transition-colors duration-500 p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* HEADER JAKO NA SCREENSHOTU */}
        <header className="w-full flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Back to Markets</span>
          </Link>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter cursor-default italic">
            Vybecheck
          </h1>
        </header>

        {/* HLAVNÍ PROFILOVÁ KARTA */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-lg flex flex-col justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            
            {/* AVATAR S EDIT TLAČÍTKEM */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-4xl sm:text-3xl font-black shadow-lg text-white border-4 border-white dark:border-[#0a0a0a] overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (nickname ? nickname.charAt(0).toUpperCase() : 'V')}
              </div>
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] hover:scale-110 transition-transform shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>

            {/* JMÉNO A ZŮSTATEK */}
            <div className="flex-1 w-full mt-2 sm:mt-0">
              {isEditingName ? (
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-2 w-full max-w-sm mx-auto sm:mx-0">
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)} 
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-lg font-black outline-none focus:border-fuchsia-500 text-center sm:text-left"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={saveName} disabled={savingName} className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">Save</button>
                    <button onClick={() => { setIsEditingName(false); setTempName(nickname || ''); }} className="flex-1 sm:flex-none px-4 py-2 bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1 group/name cursor-pointer w-fit mx-auto sm:mx-0" onClick={() => setIsEditingName(true)}>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest">{nickname || 'ANONYMOUS VYBER'}</h2>
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover/name:bg-fuchsia-500 group-hover/name:text-white transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-4 mt-3">
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  Bankroll: <span className="text-green-500">{safeBalance.toFixed(2)} USDC</span>
                </p>
              </div>
            </div>
          </div>

          {/* STATISTIKY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 w-full border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-2">
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Volume Traded</p>
              <p className="text-lg font-black">${totalVolume.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Active Bets</p>
              <p className="text-lg font-black">{activeBetsList.length}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Net Return</p>
              <p className={`text-lg font-black ${netReturn > 0 ? 'text-green-500' : netReturn < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                {netReturn > 0 ? '+' : ''}{netReturn.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Win / Loss</p>
              <p className="text-lg font-black">
                <span className="text-green-500">{wins}</span> <span className="text-zinc-300 dark:text-zinc-600">/</span> <span className="text-red-500">{losses}</span>
              </p>
            </div>
          </div>
        </div>

        {/* PAYOUT WALLET KARTA (Identická se screenshotem) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-md">
          <div className="mb-6">
            <h3 className="text-lg font-black uppercase italic tracking-widest mb-2">Payout Wallet</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
              Add your Solana or EVM address to receive monthly USDC airdrops if you make it to the top 5 on the leaderboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={payoutAddress}
              onChange={(e) => setPayoutAddress(e.target.value)}
              placeholder="Paste your 0x... or Solana address here" 
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 text-sm text-zinc-900 dark:text-white outline-none focus:border-fuchsia-500 transition-colors"
            />
            <button 
              onClick={saveWallet}
              disabled={savingWallet}
              className="bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95 font-black px-8 py-4 rounded-xl uppercase tracking-widest transition-all disabled:opacity-50 disabled:active:scale-100 sm:min-w-[140px] shadow-md"
            >
              {savingWallet ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* ACTIVE BETS KARTA */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-md">
          <h3 className="text-lg font-black uppercase italic tracking-widest mb-6">My Active Bets</h3>
          <div className="space-y-4">
            {activeBetsList.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 border-dashed rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-950/50">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">No active bets.</p>
                <Link href="/" className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Start Trading</Link>
              </div>
            ) : (
              activeBetsList.map((bet: any) => (
                <div key={bet.id} className="flex justify-between items-center p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-4">
                    {(bet.markets?.image_url || bet.markets?.imageUrl) && (
                      <img src={bet.markets?.image_url || bet.markets?.imageUrl} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-xs sm:text-sm line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                        Bet: <span className={bet.type === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{bet.type}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-sm">{bet.amount} USDC</p>
                    <p className="text-[9px] font-mono text-zinc-500 mt-1">Entry: {(bet.entryPrice || 50).toFixed(0)}¢</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* HISTORY */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-md">
          <h3 className="text-lg font-black uppercase italic tracking-widest mb-6">History</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {resolvedBetsList.length === 0 ? (
              <div className="text-center py-10 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-950/50">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">No history yet.</p>
              </div>
            ) : (
              resolvedBetsList.map((bet: any) => (
                <div key={bet.id} className="flex justify-between items-center p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100 transition-opacity">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                    <p className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                      {bet.type} | <span className={bet.status === 'won' ? 'text-green-500' : 'text-red-500'}>{bet.status}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-xs sm:text-sm text-zinc-500">{bet.amount} USDC</p>
                    <p className={`text-[9px] sm:text-[10px] font-black tracking-widest mt-1 ${bet.status === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                      {bet.status === 'won' ? '+' : ''}{(bet.payout || 0).toFixed(2)} USDC
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* AVATAR UPLOAD MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h2 className="text-2xl font-black italic uppercase mb-1">Profile Picture</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Update your vybe</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Možnost 1: Vlastní soubor */}
              <div className="p-4 border border-zinc-200 dark:border-white/10 rounded-xl bg-zinc-50 dark:bg-white/5 text-center relative hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="pointer-events-none flex flex-col items-center justify-center gap-2 text-zinc-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload from Device</span>
                </div>
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
                <span className="mx-4 text-zinc-400 text-[9px] font-bold uppercase tracking-widest">OR USE URL</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
              </div>

              {/* Možnost 2: URL */}
              <div>
                <input 
                  type="text" 
                  value={avatarInputUrl}
                  onChange={(e) => setAvatarInputUrl(e.target.value)}
                  placeholder="https://.../image.png"
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-fuchsia-500"
                />
              </div>

              {/* Náhled */}
              {avatarInputUrl && (
                <div className="flex justify-center mt-2">
                  <img src={avatarInputUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200 dark:border-white/20 shadow-md" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button 
                onClick={() => saveAvatar(avatarInputUrl)}
                disabled={savingAvatar}
                className="w-full py-3.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-sm shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {savingAvatar ? 'Saving...' : 'Save Picture'}
              </button>
              <button onClick={() => setIsAvatarModalOpen(false)} className="w-full py-3.5 rounded-xl bg-transparent text-zinc-500 font-bold uppercase tracking-widest text-xs hover:text-zinc-900 dark:hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}