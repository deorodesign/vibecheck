'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Státy pro formulář nového trhu
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pop Culture');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRules, setNewRules] = useState('');

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
      alert("Error creating market: " + error.message);
    } else {
      alert("Market deployed successfully!");
      setNewTitle('');
      setNewImageUrl('');
      setNewRules('');
      fetchMarkets();
    }
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

  if (loading) return <div className="p-10 text-white font-mono uppercase tracking-widest text-center min-h-screen bg-zinc-950 flex items-center justify-center">Loading admin database...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 font-mono">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header>
          <h1 className="text-4xl font-black text-fuchsia-500 mb-2 uppercase tracking-tighter">Vybecheck Admin</h1>
          <p className="text-zinc-400 uppercase text-sm tracking-widest">Platform Owner Control Panel</p>
        </header>

        {/* FORMULÁŘ NA VYTVÁŘENÍ TRHŮ */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest">Deploy New Market</h2>
          <form onSubmit={createMarket} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Market Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Will GTA VI be delayed to 2026?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 transition-colors appearance-none"
                >
                  <option>Pop Culture</option>
                  <option>Gaming</option>
                  <option>Crypto</option>
                  <option>Sports</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Image URL</label>
                <input 
                  type="text" 
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Resolution Rules</label>
              <textarea 
                value={newRules}
                onChange={(e) => setNewRules(e.target.value)}
                placeholder="Describe how this market will be settled..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 transition-colors h-24 resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-fuchsia-600 to-orange-600 hover:from-fuchsia-500 hover:to-orange-500 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Deploy to Web
            </button>
          </form>
        </section>

        {/* SEZNAM AKTIVNÍCH TRHŮ K VYHODNOCENÍ */}
        <section className="space-y-4">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest">Manage Active Markets</h2>
          {markets.map((market) => (
            <div key={market.id} className={`p-6 rounded-[2rem] border ${market.is_resolved ? 'border-zinc-800 bg-zinc-900/30 opacity-60' : 'border-zinc-800 bg-zinc-900'}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  {market.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={market.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-zinc-800" />
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{market.title}</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {market.id} | {market.category}</p>
                  </div>
                </div>
                {market.is_resolved && (
                  <div className="px-4 py-2 bg-zinc-800 text-zinc-300 text-[10px] uppercase tracking-[0.2em] rounded-full font-black border border-zinc-700">
                    RESOLVED: {market.winning_outcome}
                  </div>
                )}
              </div>

              {!market.is_resolved && (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => resolveMarket(market.id, 'VYBE')}
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-xs"
                  >
                    WINNER: VYBE
                  </button>
                  <button 
                    onClick={() => resolveMarket(market.id, 'NO_VYBE')}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-xs"
                  >
                    WINNER: NO VYBE
                  </button>
                </div>
              )}
            </div>
          ))}

          {markets.length === 0 && (
            <div className="text-center text-zinc-600 py-20 border border-zinc-800 border-dashed rounded-[2rem] uppercase tracking-widest text-xs font-black">
              No markets found in database.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}