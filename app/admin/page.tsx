'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMarkets(data);
    setLoading(false);
  };

  const resolveMarket = async (marketId: number, winningOutcome: 'VYBE' | 'NO_VYBE') => {
    const confirmResolve = window.confirm(`Are you sure you want to resolve this market as ${winningOutcome}? This action cannot be undone!`);
    if (!confirmResolve) return;

    try {
      // 1. Mark the market as resolved in Supabase
      await supabase
        .from('markets')
        .update({ is_resolved: true, winning_outcome: winningOutcome })
        .eq('id', marketId);

      // 2. Fetch all bets for this specific market
      const { data: marketBets } = await supabase
        .from('bets')
        .select('*')
        .eq('market_id', marketId);

      if (marketBets && marketBets.length > 0) {
        // Calculate payouts for winning bets
        const winningBets = marketBets.filter(bet => bet.type === winningOutcome);
        for (const bet of winningBets) {
          // Payout = (amount / entry_price) * 100
          // Fallback to 50 if entry_price is missing for older test data
          const entryPrice = bet.entry_price || 50; 
          const payoutAmount = (bet.amount / entryPrice) * 100;
          
          await supabase.from('bets').update({ status: 'won', payout: payoutAmount }).eq('id', bet.id);
        }
        
        // Mark losing bets as 'lost'
        const losingBets = marketBets.filter(bet => bet.type !== winningOutcome);
        for (const bet of losingBets) {
          await supabase.from('bets').update({ status: 'lost', payout: 0 }).eq('id', bet.id);
        }
      }

      alert(`Market resolved successfully! Winners have been calculated.`);
      fetchMarkets(); 
      
    } catch (error) {
      console.error("Error resolving market:", error);
      alert("An error occurred while resolving the market.");
    }
  };

  if (loading) return <div className="p-10 text-white font-mono uppercase tracking-widest">Loading admin database...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10 font-mono">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-fuchsia-500 mb-2 uppercase tracking-tighter">Vybecheck Admin</h1>
        <p className="text-zinc-400 mb-10 uppercase text-sm tracking-widest">Platform Owner Control Panel</p>

        <div className="space-y-4">
          {markets.map((market) => (
            <div key={market.id} className={`p-6 rounded-2xl border ${market.is_resolved ? 'border-zinc-800 bg-zinc-900/50 opacity-50' : 'border-zinc-800 bg-zinc-900'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{market.title}</h2>
                {market.is_resolved && (
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs uppercase tracking-widest rounded-full font-bold">
                    Resolved: {market.winning_outcome}
                  </span>
                )}
              </div>

              {!market.is_resolved && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => resolveMarket(market.id, 'VYBE')}
                    className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 py-3 rounded-xl font-black uppercase tracking-widest transition-all"
                  >
                    VYBE WON
                  </button>
                  <button 
                    onClick={() => resolveMarket(market.id, 'NO_VYBE')}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl font-black uppercase tracking-widest transition-all"
                  >
                    NO VYBE WON
                  </button>
                </div>
              )}
            </div>
          ))}

          {markets.length === 0 && (
            <div className="text-center text-zinc-500 py-10 uppercase tracking-widest">
              No markets found in database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}