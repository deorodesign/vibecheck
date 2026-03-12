'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, MARKETS } from '../context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { 
    nickname, balance, walletAddress, myBets, handleLogout, 
    updateNickname, updateWalletAddress, isLoggedIn, showToast // <-- Přidali jsme showToast
  } = useAppContext();
  
  const router = useRouter();
  
  // Stavy pro úpravy
  const [editMode, setEditMode] = useState(false);
  const [newNick, setNewNick] = useState("");
  const [walletInput, setWalletInput] = useState("");

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
    setNewNick(nickname);
    setWalletInput(walletAddress); // Načtení uložené peněženky do políčka
  }, [nickname, walletAddress, isLoggedIn, router]);

  const handleSaveNick = () => {
    if (newNick.trim() !== '' && newNick !== nickname) {
      updateNickname(newNick);
    }
    setEditMode(false);
  };

  // VYLEPŠENÁ FUNKCE PRO UKLÁDÁNÍ PENĚŽENKY
  const handleSaveWallet = () => {
    if (!walletInput.trim()) {
      showToast("Please enter a wallet address!", "error");
      return;
    }
    if (walletInput === walletAddress) {
      showToast("This address is already saved.", "success");
      return;
    }
    updateWalletAddress(walletInput);
  };

  const onLogout = () => {
    handleLogout();
    router.push('/');
  };

  if (!isLoggedIn) return null;

  const volumeTraded = myBets.reduce((acc: number, bet: any) => acc + bet.amount, 0);
  const activeBetsCount = myBets.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-10">
        <Link href="/">
          <h1 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-fuchsia-500 to-orange-500 bg-clip-text text-transparent cursor-pointer">
            VYBECHECK
          </h1>
        </Link>
        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
          LGT
        </div>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        
        {/* PROFILE BOX */}
        <div className="bg-[#111] border border-zinc-800/50 rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex-shrink-0 shadow-[0_0_30px_rgba(217,70,239,0.2)]" />
          
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full">
            {editMode ? (
              <div className="flex flex-col sm:flex-row gap-3 items-center mb-2">
                <input 
                  type="text" 
                  value={newNick}
                  onChange={(e) => setNewNick(e.target.value.toUpperCase())}
                  className="bg-black border border-zinc-700 text-white text-3xl font-black italic uppercase px-3 py-1 rounded-xl outline-none focus:border-fuchsia-500 w-full sm:w-56 text-center sm:text-left"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNick()}
                />
                <button onClick={handleSaveNick} className="bg-white text-black text-xs font-bold px-4 py-2 rounded-xl hover:bg-zinc-200 transition">SAVE</button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
                <h2 className="text-4xl font-black italic uppercase tracking-wide">{nickname}</h2>
                <button onClick={() => setEditMode(true)} className="text-zinc-500 hover:text-white text-xs font-bold tracking-widest transition border border-zinc-800 px-3 py-1 rounded-lg hover:border-zinc-500 mt-2 sm:mt-0">EDIT</button>
              </div>
            )}
            
            <p className="text-zinc-400 font-bold tracking-widest text-sm mb-6">
              BALANCE: <span className="text-green-500">{balance.toFixed(2)} USDC</span>
            </p>

            {/* STATISTIKY */}
            <div className="flex gap-6 sm:gap-10 border-t border-zinc-800/80 pt-5 w-full justify-center sm:justify-start">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1">Volume Traded</span>
                <span className="text-xl font-black italic">${volumeTraded.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1">Active Bets</span>
                <span className="text-xl font-black italic">{activeBetsCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1">Net Return</span>
                <span className="text-green-500 text-xl font-black italic">+0.00%</span>
              </div>
            </div>

          </div>
        </div>

        {/* PAYOUT WALLET BOX */}
        <div className="bg-[#111] border border-zinc-800/50 rounded-3xl p-8 flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-wide mb-2">PAYOUT WALLET</h3>
            <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase leading-relaxed">
              Add your Solana or EVM address to receive monthly USDC airdrops if you make it to the top 5.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Paste your 0x... or Solana address here" 
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              className="flex-grow bg-[#0a0a0a] border border-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:border-fuchsia-500 text-sm font-mono"
            />
            <button 
              onClick={handleSaveWallet}
              className="bg-white text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-zinc-200 transition active:scale-95"
            >
              SAVE
            </button>
          </div>
        </div>

        {/* ACTIVE BETS BOX */}
        <div className="bg-[#111] border border-zinc-800/50 rounded-3xl p-8 flex flex-col gap-4">
          <h3 className="text-xl font-black italic uppercase tracking-wide mb-2">MY ACTIVE BETS</h3>
          <div className="flex flex-col gap-3">
            {myBets.length === 0 ? (
              <p className="text-zinc-500 text-sm font-bold">No active bets yet.</p>
            ) : (
              myBets.map((bet: any, i: number) => { 
                const market = MARKETS.find((m: any) => m.id === bet.marketId);
                return (
                  <div key={i} className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center justify-between border border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                        <img src={market?.imageUrl || "/file.svg"} alt="market" className="w-full h-full object-cover opacity-70" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold leading-tight max-w-[150px] sm:max-w-[300px] truncate">{market?.title || `Market ID: ${bet.marketId}`}</p>
                        <p className="text-xs font-bold tracking-widest mt-1 text-zinc-500">
                          BET: <span className={bet.type === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{bet.type}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <p className="font-bold text-sm">{bet.amount} USDC</p>
                      <p className="text-xs font-bold text-zinc-500 mt-1">Entry: {(bet.entryPrice).toFixed(0)}¢</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* LOGOUT BUTTON */}
      <button onClick={onLogout} className="mt-12 text-zinc-600 hover:text-red-500 font-bold tracking-widest text-xs uppercase transition-colors">
        LOG OUT & DISCONNECT
      </button>

    </div>
  );
}