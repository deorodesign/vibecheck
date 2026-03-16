'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Státy formuláře
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pop Culture');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRules, setNewRules] = useState('');
  const [fakeVolume, setFakeVolume] = useState('0');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    const { data } = await supabase
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMarkets(data);
    setLoading(false);
  };

  const handleEdit = (market: any) => {
    setEditingId(market.id);
    setNewTitle(market.title);
    setNewCategory(market.category || 'Pop Culture');
    setNewImageUrl(market.image_url || market.imageUrl || '');
    setNewRules(market.rules || '');
    setFakeVolume(market.volume_usd?.toString() || '0');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTitle('');
    setNewImageUrl('');
    setNewRules('');
    setFakeVolume('0');
    setUploadFile(null);
  };

  const saveMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return alert("Market title is required!");

    let finalImageUrl = newImageUrl;

    // Logika pro nahrání obrázku z počítače do Supabase Storage (pokud je vybrán)
    if (uploadFile) {
      try {
        const fileExt = uploadFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('markets') // Název bucketu v Supabase
          .upload(`public/${fileName}`, uploadFile);
          
        if (!uploadError && data) {
          const { data: publicUrlData } = supabase.storage.from('markets').getPublicUrl(`public/${fileName}`);
          finalImageUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.error("Image upload failed, falling back to URL if provided.");
      }
    }

    const marketData = { 
      title: newTitle, 
      category: newCategory, 
      image_url: finalImageUrl, // OPRAVENO: image_url s podtržítkem
      rules: newRules,
      volume_usd: Number(fakeVolume) || 0
    };

    if (editingId) {
      // EDITACE
      const { error } = await supabase.from('markets').update(marketData).eq('id', editingId);
      if (error) alert("Error updating market: " + error.message);
      else {
        alert("Market updated!");
        cancelEdit();
        fetchMarkets();
      }
    } else {
      // VYTVOŘENÍ NOVÉHO
      const { error } = await supabase.from('markets').insert([{ ...marketData, is_resolved: false }]);
      if (error) alert("Error creating market: " + error.message);
      else {
        alert("Market deployed successfully!");
        cancelEdit();
        fetchMarkets();
      }
    }
  };

  const resolveMarket = async (marketId: number, winningOutcome: 'VYBE' | 'NO_VYBE') => {
    if (!window.confirm(`Are you sure you want to resolve this market as ${winningOutcome}?`)) return;

    try {
      await supabase.from('markets').update({ is_resolved: true, winning_outcome: winningOutcome }).eq('id', marketId);

      const { data: marketBets } = await supabase.from('bets').select('*').eq('market_id', marketId);

      if (marketBets) {
        for (const bet of marketBets) {
          const isWinner = bet.type === winningOutcome;
          const entryPrice = Number(bet.entry_price) || 50;
          const payoutAmount = isWinner ? (Number(bet.amount) / entryPrice) * 100 : 0;
          
          await supabase.from('bets').update({ status: isWinner ? 'won' : 'lost', payout: payoutAmount }).eq('id', bet.id);
        }
      }
      alert(`Market resolved! Payouts calculated.`);
      fetchMarkets(); 
    } catch (error) {
      alert("Error resolving the market.");
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white p-10 font-mono uppercase">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 font-mono">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header>
          <h1 className="text-4xl font-black text-fuchsia-500 mb-2 uppercase tracking-tighter">Vybecheck Admin</h1>
          <p className="text-zinc-400 uppercase text-sm tracking-widest">Platform Owner Control Panel</p>
        </header>

        {/* FORMULÁŘ */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest">
            {editingId ? 'Edit Market' : 'Deploy New Market'}
          </h2>
          <form onSubmit={saveMarket} className="space-y-6">
            
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Market Title</label>
              <input 
                type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Johny vs. Tobby"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/50">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Option A: Upload Image</label>
                <input 
                  type="file" accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                />
              </div>
              <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/50">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Option B: Paste Image URL</label>
                <input 
                  type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Category</label>
                <select 
                  value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 appearance-none"
                >
                  <option>Pop Culture</option>
                  <option>Gaming</option>
                  <option>Crypto</option>
                  <option>Sports</option>
                  <option>Trending</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Fake Volume (For Trending)</label>
                <input 
                  type="number" value={fakeVolume} onChange={(e) => setFakeVolume(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Resolution Rules</label>
              <textarea 
                value={newRules} onChange={(e) => setNewRules(e.target.value)}
                placeholder="referee..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 h-24 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-gradient-to-r from-fuchsia-600 to-orange-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-transform hover:scale-[1.01]">
                {editingId ? 'Save Changes' : 'Deploy to Web'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="px-8 bg-zinc-800 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-zinc-700">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* SEZNAM TRHŮ */}
        <section className="space-y-4">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest">Manage Active Markets</h2>
          {markets.map((market) => (
            <div key={market.id} className={`p-6 rounded-[2rem] border ${market.is_resolved ? 'border-zinc-800 bg-zinc-900/40 opacity-70' : 'border-zinc-800 bg-zinc-900'}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  {(market.image_url || market.imageUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={market.image_url || market.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-zinc-800" />
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{market.title}</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {market.id} | {market.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(market)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] uppercase tracking-widest rounded-full font-black transition-colors">
                    Edit
                  </button>
                  {market.is_resolved && (
                    <div className="px-4 py-2 bg-zinc-800 text-zinc-400 text-[10px] uppercase tracking-[0.2em] rounded-full font-black border border-zinc-700">
                      RESOLVED: {market.winning_outcome}
                    </div>
                  )}
                </div>
              </div>

              {!market.is_resolved && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => resolveMarket(market.id, 'VYBE')} className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-xs">
                    WINNER: VYBE
                  </button>
                  <button onClick={() => resolveMarket(market.id, 'NO_VYBE')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-xs">
                    WINNER: NO VYBE
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}