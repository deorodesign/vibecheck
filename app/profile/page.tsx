'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '../context';

export default function ProfilePage() {
  const { balance, myBets, markets, isAuthLoading, nickname } = useAppContext();
  const [payoutAddress, setPayoutAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const baseStartingBalance = 500;

  useEffect(() => {
    const savedWallet = localStorage.getItem('payoutWallet') || '';
    setPayoutAddress(savedWallet);
  }, []);

  const saveWallet = () => {
    setSaving(true);
    localStorage.setItem('payoutWallet', payoutAddress);
    setTimeout(() => {
      alert('Payout wallet saved successfully!');
      setSaving(false);
    }, 500);
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

  // Hodnota peněz uzamčená v aktivních sázkách (v tvém případě 100 USDC)
  const activeBetsValue = activeBetsList.reduce((sum: number, b: any) => sum + Number(b.amount), 0);

  // Celková hodnota portfolia (Balance 400 + Aktivní sázky 100 = 500)
  const currentPortfolioValue = balance + activeBetsValue;

  // Výpočet zisku/ztráty na základě celkového portfolia (500 vs 500 = 0%)
  const netReturn = baseStartingBalance > 0 
    ? ((currentPortfolioValue - baseStartingBalance) / baseStartingBalance) * 100 
    : 0;

  const wins = resolvedBetsList.filter((b: any) => b.status === 'won').length;
  const losses = resolvedBetsList.filter((b: any) => b.status === 'lost').length;

  if (isAuthLoading) return <div className="min-h-screen bg-zinc-950 text-white p-10 font-mono text-center uppercase tracking-widest py-32">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 font-mono">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <header className="w-full flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-zinc-600 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Back to Markets</span>
          </Link>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter cursor-default">
            Vybecheck
          </h1>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-lg">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-3xl font-black shadow-lg">
              {nickname ? nickname.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest mb-1">{nickname || 'TWITTER_USER'}</h2>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                Balance: <span className="text-green-500">{balance.toFixed(2)} USDC</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-zinc-800 pt-8">
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Volume Traded</p>
              <p className="text-xl font-black">${totalVolume.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Active Bets</p>
              <p className="text-xl font-black">{activeBetsList.length}</p>
            </div>
            <div>
              {/* ZMĚNA NÁZVU NA NET P/L PRO OVĚŘENÍ NASAZENÍ KÓDU */}
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Net P/L</p>
              <p className={`text-xl font-black ${netReturn > 0 ? 'text-green-500' : netReturn < 0 ? 'text-red-500' : 'text-zinc-300'}`}>
                {netReturn > 0 ? '+' : ''}{netReturn.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Win / Loss</p>
              <p className="text-xl font-black">
                <span className="text-green-500">{wins}</span> <span className="text-zinc-600">/</span> <span className="text-red-500">{losses}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-md">
          <h3 className="text-lg font-black uppercase italic tracking-widest mb-4">Payout Wallet</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">
            Add your Solana or EVM address to receive monthly USDC airdrops if you make it to the top 5 on the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={payoutAddress}
              onChange={(e) => setPayoutAddress(e.target.value)}
              placeholder="Paste your 0x... or Solana address here" 
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors"
            />
            <button 
              onClick={saveWallet}
              disabled={saving}
              className="bg-white text-black hover:bg-zinc-200 active:scale-95 font-black px-8 py-4 rounded-xl uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-md">
          <h3 className="text-lg font-black uppercase italic tracking-widest mb-6">My Active Bets</h3>
          <div className="space-y-4">
            {activeBetsList.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center border border-zinc-800 border-dashed rounded-[1.5rem] bg-zinc-950/50">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">No active bets.</p>
                <Link href="/" className="px-6 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Start Trading</Link>
              </div>
            ) : (
              activeBetsList.map((bet: any) => (
                <div key={bet.id} className="flex justify-between items-center p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-4">
                    {(bet.markets?.image_url || bet.markets?.imageUrl) && (
                      <img src={bet.markets?.image_url || bet.markets?.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-zinc-800" />
                    )}
                    <div>
                      <p className="font-bold text-sm line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                        Bet: <span className={bet.type === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{bet.type}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm">{bet.amount} USDC</p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1">Entry: {(bet.entryPrice || 50).toFixed(0)}¢</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-md">
          <h3 className="text-lg font-black uppercase italic tracking-widest mb-6">History</h3>
          <div className="space-y-4">
            {resolvedBetsList.length === 0 ? (
              <div className="text-center py-10 border border-zinc-800 border-dashed rounded-[1.5rem] bg-zinc-950/50">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">No history yet.</p>
              </div>
            ) : (
              resolvedBetsList.map((bet: any) => (
                <div key={bet.id} className="flex justify-between items-center p-5 rounded-2xl bg-zinc-950 border border-zinc-800 opacity-80 hover:opacity-100 transition-opacity">
                  <div>
                    <p className="font-bold text-sm text-zinc-300 line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                      {bet.type} | <span className={bet.status === 'won' ? 'text-green-500' : 'text-red-500'}>{bet.status}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-zinc-500">{bet.amount} USDC</p>
                    <p className={`text-[10px] font-black tracking-widest mt-1 ${bet.status === 'won' ? 'text-green-500' : 'text-red-500'}`}>
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
  );
}