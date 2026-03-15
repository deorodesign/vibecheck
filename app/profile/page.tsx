'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { 
    isDarkMode, toggleDarkMode, isLoggedIn, walletAddress, balance, 
    myBets, markets, avatarUrl, nickname, setNickname, setAvatarUrl, showToast 
  } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(nickname);
  const [newAvatarUrl, setNewAvatarUrl] = useState(avatarUrl);
  const [payoutAddress, setPayoutAddress] = useState('');
  const [isSavingWallet, setIsSavingWallet] = useState(false);

  // Stats calculation
  const activeBets = myBets.filter((bet: any) => {
    const market = markets.find((m: any) => m.id === bet.marketId);
    return market && !market.is_resolved;
  });
  const volumeTraded = myBets.reduce((sum: number, bet: any) => sum + bet.amount, 0);

  useEffect(() => {
    setNewNickname(nickname);
    setNewAvatarUrl(avatarUrl);
  }, [nickname, avatarUrl]);

  // Load payout wallet from DB
  useEffect(() => {
    async function loadWallet() {
      if (!isLoggedIn || !walletAddress) return;
      const { data } = await supabase.from('users').select('payout_wallet').eq('wallet_address', walletAddress).single();
      if (data && data.payout_wallet) {
        setPayoutAddress(data.payout_wallet);
      }
    }
    loadWallet();
  }, [isLoggedIn, walletAddress]);

  const handleSaveProfile = () => {
    setNickname(newNickname);
    setAvatarUrl(newAvatarUrl);
    setIsEditing(false);
    showToast("Profile updated successfully!", "success");
    // Note: In a full production app, you'd also save this to Supabase 'users' table here
  };

  const handleSaveWallet = async () => {
    if (!isLoggedIn || !walletAddress) return;
    setIsSavingWallet(true);
    const { error } = await supabase.from('users').update({ payout_wallet: payoutAddress }).eq('wallet_address', walletAddress);
    if (error) {
      showToast("Error saving wallet address.", "error");
    } else {
      showToast("Payout wallet saved!", "success");
    }
    setIsSavingWallet(false);
  };

  if (!isLoggedIn) {
    return (
      <main className={`flex min-h-screen flex-col items-center justify-center p-8 font-sans ${isDarkMode ? 'bg-[#0e0e12] text-white' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-500`}>
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="text-3xl font-black uppercase italic text-fuchsia-500 mb-2">Not Logged In</h1>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mb-4">Connect to view your profile.</p>
          <Link href="/" className="px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`flex min-h-screen flex-col items-center p-4 md:p-8 font-sans ${isDarkMode ? 'bg-[#0e0e12] text-white' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-500`}>
      <div className="w-full max-w-3xl space-y-6 md:space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 md:mb-8 pt-4">
          <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 hover:opacity-80 transition-opacity">
            Vybecheck
          </Link>
          <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm active:scale-95 transition-all text-black dark:text-white font-bold text-xs uppercase">
            {isDarkMode ? "LGT" : "DRK"}
          </button>
        </div>

        {/* THE MANIFESTO / PHILOSOPHY */}
        <div className="bg-gradient-to-br from-fuchsia-500/10 to-orange-500/10 border border-fuchsia-500/20 dark:border-fuchsia-500/30 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-fuchsia-500 to-orange-500"></div>
          <h2 className="text-2xl font-black italic uppercase text-zinc-900 dark:text-white mb-4 tracking-tight">The Manifesto</h2>
          <div className="space-y-4 text-sm md:text-base text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
            <p>
              Culture is the new currency. <strong>Vybecheck is a cultural stock exchange.</strong>
            </p>
            <p>
              Traditional prediction markets are boring. They focus on macroeconomics, interest rates, and stuffy politics. We focus on what the internet actually cares about: 
              <span className="text-fuchsia-500 font-bold"> drama, pop culture, viral moments, and internet history.</span>
            </p>
            <p>
              If you know where the timeline is heading, you shouldn't just be tweeting about it for likes. You should be profiting from it. 
              Put your money where your mouth is. <strong className="text-zinc-900 dark:text-white uppercase italic">Trade the culture.</strong>
            </p>
          </div>
        </div>

        {/* MAIN PROFILE CARD */}
        <div className="bg-white dark:bg-[#18181b] p-6 md:p-8 rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="relative group shrink-0">
                {newAvatarUrl ? (
                  <img src={newAvatarUrl} alt="Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-zinc-50 dark:border-[#0e0e12] shadow-lg" />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 border-4 border-zinc-50 dark:border-[#0e0e12] shadow-lg flex items-center justify-center text-white font-black text-2xl">
                    {newNickname?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1">
                {isEditing ? (
                  <input type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} className="bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xl font-black italic uppercase text-zinc-900 dark:text-white mb-2 focus:outline-none focus:border-fuchsia-500 w-full" />
                ) : (
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase text-zinc-900 dark:text-white truncate max-w-[200px] md:max-w-[300px]">{nickname}</h1>
                    <button onClick={() => setIsEditing(true)} className="px-3 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">Edit</button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Balance:</span>
                  <span className="text-sm font-black text-green-500">{balance.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="w-full md:w-auto flex flex-col gap-2">
                <input type="text" placeholder="Avatar Image URL" value={newAvatarUrl} onChange={(e) => setNewAvatarUrl(e.target.value)} className="w-full text-xs bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-fuchsia-500" />
                <button onClick={handleSaveProfile} className="w-full px-6 py-2.5 bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">Save Changes</button>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-zinc-200 dark:bg-white/10 mb-6"></div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Volume Traded</span>
              <span className="text-lg md:text-xl font-black text-zinc-900 dark:text-white">${volumeTraded.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Bets</span>
              <span className="text-lg md:text-xl font-black text-zinc-900 dark:text-white">{activeBets.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Net Return</span>
              <span className="text-lg md:text-xl font-black text-green-500">+0.00%</span>
            </div>
          </div>
        </div>

        {/* PAYOUT WALLET CARD */}
        <div className="bg-white dark:bg-[#18181b] p-6 md:p-8 rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-xl flex flex-col gap-4">
          <h2 className="text-xl font-black italic uppercase text-zinc-900 dark:text-white">Payout Wallet</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
            Add your Solana or EVM address to receive monthly USDC airdrops if you make it to the top 5 on the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <input 
              type="text" 
              value={payoutAddress}
              onChange={(e) => setPayoutAddress(e.target.value)}
              placeholder="Paste your 0x... or Solana address here" 
              className="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors text-zinc-900 dark:text-white font-mono" 
            />
            <button 
              onClick={handleSaveWallet}
              disabled={isSavingWallet}
              className={`px-8 py-3.5 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all ${isSavingWallet ? 'opacity-70' : 'hover:scale-105 active:scale-95'}`}
            >
              {isSavingWallet ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* ACTIVE BETS LIST */}
        <div className="bg-white dark:bg-[#18181b] p-6 md:p-8 rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-xl flex flex-col gap-6">
          <h2 className="text-xl font-black italic uppercase text-zinc-900 dark:text-white">My Active Bets</h2>
          
          {activeBets.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-2xl">
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4">No active bets.</p>
              <Link href="/" className="px-6 py-3 bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-fuchsia-100 dark:hover:bg-fuchsia-500/20 transition-colors">Start Trading</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Added index parameter and used it in the key to fix the warning */}
              {activeBets.map((bet: any, index: number) => {
                const market = markets.find((m: any) => m.id === bet.marketId);
                if (!market) return null;
                return (
                  <Link href={`/?vybecard=${market.id}`} key={bet.id || `fallback-bet-${index}`} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0 pr-4">
                      <img src={market.imageUrl} alt={market.title} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs md:text-sm text-zinc-900 dark:text-white truncate">{market.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bet:</span>
                          <span className={`text-[10px] font-black uppercase italic ${bet.type === 'VYBE' ? 'text-green-500' : 'text-red-500'}`}>{bet.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-black text-sm md:text-base text-zinc-900 dark:text-white">{bet.amount} USDC</span>
                      <span className="text-[10px] font-bold text-zinc-500 font-mono mt-1">Entry: {bet.entryPrice}¢</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}