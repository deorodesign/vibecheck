'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { 
    walletAddress, nickname, balance, setBalance, 
    markets, showToast 
  } = useAppContext();
  
  const [allBets, setAllBets] = useState<any[]>([]);
  const [payoutWallet, setPayoutWallet] = useState('');
  
  const [stats, setStats] = useState({
    volume: 0,
    activeBetsCount: 0,
    netReturn: 0,
    wins: 0,
    losses: 0
  });

  useEffect(() => {
    if (walletAddress) {
      fetchHistory();
    }
  }, [walletAddress]);

  const fetchHistory = async () => {
    const { data: userBets } = await supabase
      .from('bets')
      .select('*')
      .eq('user_address', walletAddress)
      .order('created_at', { ascending: false });

    if (userBets) {
      setAllBets(userBets);
      
      let totalVolume = 0;
      let activeCount = 0;
      let wins = 0;
      let losses = 0;
      let totalPayouts = 0;

      userBets.forEach(bet => {
        totalVolume += Number(bet.amount || 0);
        
        if (bet.status === 'pending') {
          activeCount++;
        } else if (bet.status === 'won') {
          wins++;
          totalPayouts += Number(bet.payout || 0);
        } else if (bet.status === 'lost') {
          losses++;
        }
      });

      let netReturnCalc = 0;
      if (totalVolume > 0) {
        netReturnCalc = ((totalPayouts - totalVolume) / totalVolume) * 100;
      }

      setStats({
        volume: totalVolume,
        activeBetsCount: activeCount,
        netReturn: netReturnCalc,
        wins,
        losses
      });

      const baseStartingBalance = 500;
      const calculatedCurrentBalance = baseStartingBalance - totalVolume + totalPayouts;
      
      if (Number(balance).toFixed(2) !== calculatedCurrentBalance.toFixed(2) && calculatedCurrentBalance > 0) {
        setBalance(calculatedCurrentBalance);
        if (totalPayouts > 0 && balance < calculatedCurrentBalance) {
          showToast(`Claimed payouts! Balance updated.`, "success");
        }
      }
    }
  };

  const activeBetsList = allBets.filter(b => b.status === 'pending');
  const pastBetsList = allBets.filter(b => b.status !== 'pending');

  if (!walletAddress) {
    return <div className="min-h-screen pt-32 pb-20 text-center text-zinc-500 font-mono">PLEASE CONNECT WALLET TO VIEW PROFILE</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-zinc-950 font-mono">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-10">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(217,70,239,0.3)]">
              {nickname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                {nickname}
              </h1>
              <div className="text-zinc-400 font-medium tracking-widest text-sm mt-1">
                BALANCE: <span className="text-green-400">{Number(balance || 0).toFixed(2)} USDC</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-zinc-800">
            <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Volume Traded</div>
              <div className="text-xl font-bold text-white">${stats.volume.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Active Bets</div>
              <div className="text-xl font-bold text-white">{stats.activeBetsCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Net Return</div>
              <div className={`text-xl font-bold ${stats.netReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.netReturn >= 0 ? '+' : ''}{stats.netReturn.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Win / Loss</div>
              <div className="text-xl font-bold text-white">
                <span className="text-green-400">{stats.wins}</span><span className="text-zinc-600"> / </span><span className="text-red-400">{stats.losses}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-10">
          <h2 className="text-xl font-black text-white italic uppercase tracking-widest mb-2">Payout Wallet</h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mb-6 leading-relaxed">
            Add your Solana or EVM address to receive monthly USDC airdrops if you make it to the top 5 on the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={payoutWallet}
              onChange={(e) => setPayoutWallet(e.target.value)}
              placeholder="Paste your 0x... or Solana address here"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white placeholder-zinc-700 outline-none focus:border-fuchsia-500 transition-colors"
            />
            <button className="bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-colors">
              Save
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-10">
          <h2 className="text-xl font-black text-white italic uppercase tracking-widest mb-8">My Active Bets</h2>
          
          <div className="space-y-4">
            {activeBetsList.length === 0 ? (
              <div className="border border-zinc-800 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-4">No active bets.</div>
                <Link href="/" className="bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                  Start Trading
                </Link>
              </div>
            ) : (
              activeBetsList.map((bet) => {
                const market = markets?.find((m: any) => m.id === bet.market_id);
                return (
                  <div key={bet.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {market?.imageUrl && <img src={market.imageUrl} alt="Market" className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <div className="font-bold text-white text-sm">{market?.title || 'Unknown Market'}</div>
                        <div className="text-xs font-bold uppercase tracking-widest mt-1">
                          <span className="text-zinc-500">BET: </span>
                          <span className={bet.type === 'VYBE' ? 'text-green-400' : 'text-red-400'}>{bet.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-white">{Number(bet.amount || 0)} USDC</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Entry: {Number(bet.entry_price || 0).toFixed(0)}&cent;</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-10">
          <h2 className="text-xl font-black text-white italic uppercase tracking-widest mb-8">History</h2>
          
          <div className="space-y-4">
            {pastBetsList.length === 0 ? (
              <div className="text-center text-zinc-600 text-xs font-black uppercase tracking-widest py-4">No history yet.</div>
            ) : (
              pastBetsList.map((bet) => {
                const market = markets?.find((m: any) => m.id === bet.market_id);
                return (
                  <div key={bet.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                    <div>
                      <div className="font-bold text-white text-sm">{market?.title || 'Market Resolved'}</div>
                      <div className="flex gap-3 text-xs font-bold uppercase tracking-widest mt-1">
                        <span className={bet.type === 'VYBE' ? 'text-green-400' : 'text-red-400'}>{bet.type}</span>
                        <span className="text-zinc-600">|</span>
                        <span className={bet.status === 'won' ? 'text-green-500' : 'text-red-500'}>
                          {bet.status === 'won' ? 'WON' : 'LOST'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-zinc-400">{Number(bet.amount || 0)} USDC</div>
                      {bet.status === 'won' && (
                        <div className="text-[10px] text-green-400 uppercase tracking-widest mt-1">+{(bet.payout || 0).toFixed(2)} USDC</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}