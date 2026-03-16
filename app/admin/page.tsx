'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pop Culture');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRules, setNewRules] = useState('');

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setMarkets(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return alert("Title is required!");

    const { error } = await supabase
      .from('markets')
      .insert([
        { 
          title: newTitle, 
          category: newCategory, 
          imageUrl: newImageUrl, 
          rules: newRules,
          is_resolved: false 
        }
      ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Market deployed!");
      setNewTitle('');
      setNewImageUrl('');
      setNewRules('');
      fetchMarkets();
    }
  };

  const resolveMarket = async (marketId: number, winningOutcome: 'VYBE' | 'NO_VYBE') => {
    if (!window.confirm(`Resolve as ${winningOutcome}?`)) return;

    try {
      // 1. Update Market
      await supabase
        .from('markets')
        .update({ is_resolved: true, winning_outcome: winningOutcome })
        .eq('id', marketId);

      // 2. Process Bets
      const { data: marketBets } = await supabase
        .from('bets')
        .select('*')
        .eq('market_id', marketId);

      if (marketBets) {
        for (const bet of marketBets) {
          const isWinner = bet.type === winningOutcome;
          const entryPrice = Number(bet.entry_price) || 50;
          const payout = isWinner ? (Number(bet.amount) / entryPrice) * 100 : 0;
          
          await supabase
            .from('bets')
            .update({ 
              status: isWinner ? 'won' : 'lost', 
              payout: payout 
            })
            .eq('id', bet.id);
        }
      }

      alert(`Market resolved!`);
      fetchMarkets();
    } catch (error) {
      alert("Error resolving.");
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 text-fuchsia-500 p-20 font-mono">LOADING_DATABASE...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-mono">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-fuchsia-500 uppercase tracking-tighter">Vybe Admin</h1>
          <div className="h-1 w-20 bg-fuchsia-500 mt-2"></div>
        </div>

        {/* CREATE FORM */}
        <section className="bg-zinc-900 border-2 border-fuchsia-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(217,70,239,0.05)]">
          <h2 className="text-xl font-black mb-6 uppercase italic text-fuchsia-400">Deploy New Market</h2>
          <form onSubmit={createMarket} className="space-y-4">
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Market Title..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none"
              >
                <option>Pop Culture</option>
                <option>Gaming</option>
                <option>Crypto</option>
              </select>
              <input 
                type="text" 
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL..."
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all"
            >
              DEPLOY TO WEB
            </button>
          </form>
        </section>

        {/* MARKET LIST */}
        <section className="space-y-4">
          <h2 className="text-xl font-black mb-6 uppercase italic text-zinc-500">Active Markets</h2>
          {markets.map((market) => (
            <div key={market.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  {market.imageUrl && <img src={market.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-zinc-800" />}
                  <div>
                    <h3 className="text-lg font-bold">{market.title}</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase">{market.category} | ID: {market.id}</p>
                  </div>
                </div>
                {market.is_resolved && (
                  <span className="bg-zinc-800 px-3 py-1 rounded-full text-[10px] font-black uppercase text-fuchsia-400">
                    {market.winning_outcome} WON
                  </span>
                )}
              </div>

              {!market.is_resolved && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => resolveMarket(market.id, 'VYBE')} className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Resolve VYBE</button>
                  <button onClick={() => resolveMarket(market.id, 'NO_VYBE')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Resolve NO VYBE</button>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}