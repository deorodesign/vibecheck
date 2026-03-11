'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext, MARKETS } from '../context';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { 
    isLoggedIn, nickname, avatarUrl, walletAddress, balance, 
    myBets, handleLogout, showToast, isDarkMode, toggleDarkMode 
  } = useAppContext();

  const [payoutWallet, setPayoutWallet] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Načtení peněženky z kontextu, jakmile se přihlásí
  useEffect(() => {
    if (walletAddress && walletAddress !== "Wallet not set") {
      setPayoutWallet(walletAddress);
    }
  }, [walletAddress]);

  // Funkce na uložení reálné peněženky do naší Supabase databáze
  const saveWallet = async () => {
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { error } = await supabase
        .from('users')
        .update({ wallet_address: payoutWallet })
        .eq('id', session.user.id);
        
      if (error) {
        showToast("Error saving wallet.", "error");
      } else {
        showToast("Payout wallet saved!", "success");
        setTimeout(() => window.location.reload(), 1000); // Rychlý reload pro zobrazení změny
      }
    }
    setIsSaving(false);
  };

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-[#0e0e12]">
        <h1 className="text-2xl font-black uppercase italic mb-4 text-zinc-900 dark:text-white">Not Logged In</h1>
        <Link href="/" className="px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-105 transition">Go Home to Log In</Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-[#0e0e12] font-sans pb-20 transition-colors duration-500">
      {/* Header */}
      <div className="w-full flex justify-between items-center p-6 max-w-3xl mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:opacity-80 transition-opacity">Vybecheck</Link>
        <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 font-bold text-xs uppercase shadow-sm text-zinc-900 dark:text-white">
          {isDarkMode ? "LGT" : "DRK"}
        </button>
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-6 px-4">
        
        {/* Profil Info */}
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-sm flex items-center gap-6">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-md border border-zinc-200 dark:border-white/10" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 shadow-md"></div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic uppercase text-zinc-900 dark:text-white">{nickname}</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs md:text-sm mt-1">Balance: <span className="text-green-500">{balance.toFixed(2)} USDC</span></p>
          </div>
        </div>

        {/* Payout Wallet (Sybil Resistance Strategie) */}
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-2">Payout Wallet</h2>
          <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 leading-relaxed">Add your Solana or EVM address to receive monthly USDC airdrops if you make it to the Top 5.</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={payoutWallet} 
              onChange={(e) => setPayoutWallet(e.target.value)}
              placeholder="0x... or Solana Address" 
              className="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-fuchsia-500 transition-colors text-zinc-900 dark:text-white"
            />
            <button 
              onClick={saveWallet} 
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-md"
            >
              {isSaving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </div>

        {/* Moje Sázky */}
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mb-6">My Active Bets</h2>
          
          {myBets.length === 0 ? (
            <div className="text-center p-8 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">You haven't placed any bets yet.</p>
              <Link href="/" className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest text-fuchsia-500 hover:text-fuchsia-600 transition-colors">Start Predicting &rarr;</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {myBets.map((bet: any, index: number) => {
                const market = MARKETS.find((m: any) => m.id === bet.marketId);
                if (!market) return null;

                return (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5 gap-4 hover:border-zinc-200 dark:hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img src={market.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0" alt="Market" />
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{market.title}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Bet: <span className={bet.type === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{bet.type.replace('_', ' ')}</span></p>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-white/10">
                      <span className="font-black font-mono text-sm text-zinc-900 dark:text-white">{bet.amount} USDC</span>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5">Entry: {bet.entryPrice.toFixed(0)}¢</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center mt-2">
           <button onClick={() => { handleLogout(); window.location.href = '/'; }} className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 font-bold uppercase tracking-widest text-[10px] py-2 px-4 transition-colors">Log Out & Disconnect</button>
        </div>

      </div>
    </main>
  );
}