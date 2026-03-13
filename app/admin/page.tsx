'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext, CATEGORIES } from '../context';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const { isDarkMode, showToast } = useAppContext();
  
  const [markets, setMarkets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stavy pro formulář
  const availableCategories = CATEGORIES.filter((c: string) => c !== 'All' && c !== 'Trending'); // Trending je dynamická kategorie, nedává se natvrdo
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(availableCategories[0]);
  const [resolutionSource, setResolutionSource] = useState('');
  const [volumeUsd, setVolumeUsd] = useState('0'); // Nové: Pro manipulaci s Trending sekcí

  // 1. Načtení trhů
  const fetchMarkets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('markets').select('*').order('created_at', { ascending: false });
    if (data) setMarkets(data);
    if (error) showToast("Error loading markets", "error");
    setIsLoading(false);
  };

  useEffect(() => { fetchMarkets(); }, []);

  // 2. Vyčištění formuláře
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setImageUrl('');
    setCategory(availableCategories[0]);
    setResolutionSource('');
    setVolumeUsd('0');
  };

  // 3. Uložení (Vytvoření NOVÉ nebo Úprava EXISTUJÍCÍ)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !resolutionSource) {
      showToast("Please fill all required fields!", "error");
      return;
    }

    if (editingId) {
      // ÚPRAVA (EDIT)
      const { error } = await supabase.from('markets').update({
        title, image_url: imageUrl, category, resolution_source: resolutionSource, volume_usd: Number(volumeUsd) || 0
      }).eq('id', editingId);

      if (error) showToast("Error updating: " + error.message, "error");
      else { showToast("Vybecard updated successfully!", "success"); resetForm(); fetchMarkets(); }
    } else {
      // VYTVOŘENÍ (CREATE)
      const { error } = await supabase.from('markets').insert({
        title, image_url: imageUrl, category, resolution_source: resolutionSource, volume_usd: Number(volumeUsd) || 0, is_resolved: false
      });

      if (error) showToast("Error: " + error.message, "error");
      else { showToast("Vybecard created successfully!", "success"); resetForm(); fetchMarkets(); }
    }
  };

  // 4. Kliknutí na tlačítko Edit (načte data do formuláře)
  const handleEditClick = (market: any) => {
    setEditingId(market.id);
    setTitle(market.title);
    setImageUrl(market.image_url);
    setCategory(market.category);
    setResolutionSource(market.resolution_source);
    setVolumeUsd(market.volume_usd?.toString() || '0');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Vyroluje nahoru k formuláři
  };

  // 5. Vymazání trhu (Delete)
  const handleDeleteMarket = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this market? This cannot be undone.");
    if (!confirmed) return;
    
    const { error } = await supabase.from('markets').delete().eq('id', id);
    if (error) showToast("Cannot delete (market might have active bets).", "error");
    else { showToast("Market deleted!", "success"); fetchMarkets(); }
  };

  // 6. Vyhodnocení a Výplaty (Payouts)
  const handleResolveMarket = async (id: number, outcome: 'VYBE' | 'NO_VYBE') => {
    const confirmed = window.confirm(`Are you sure you want to resolve this market as ${outcome}? This will process payouts!`);
    if (!confirmed) return;

    const { error: updateError } = await supabase.from('markets').update({ is_resolved: true, winning_outcome: outcome }).eq('id', id);
    if (updateError) { showToast("Error resolving: " + updateError.message, "error"); return; }

    showToast(`Processing payouts for ${outcome}...`, "success");
    const { data: allBets } = await supabase.from('bets').select('*').eq('market_id', id);
    
    if (allBets) {
      const winningBets = allBets.filter(bet => bet.type === outcome);
      let totalPaidOut = 0; let winnersCount = 0;

      for (const bet of winningBets) {
        const entryPriceDecimal = Number(bet.entry_price) / 100;
        const payoutAmount = Number(bet.amount) / entryPriceDecimal;
        const { data: userData } = await supabase.from('users').select('balance').eq('id', bet.user_id).single();
          
        if (userData) {
          await supabase.from('users').update({ balance: Number(userData.balance) + payoutAmount }).eq('id', bet.user_id);
          totalPaidOut += payoutAmount; winnersCount++;
        }
      }
      if (winnersCount > 0) showToast(`Paid out ${totalPaidOut.toFixed(2)} USDC to ${winnersCount} winners.`, "success");
      else showToast("Resolved! No winning bets to pay out.", "success");
    }
    fetchMarkets();
  };

  return (
    <main className={`flex min-h-screen flex-col items-center p-8 font-sans ${isDarkMode ? 'bg-[#0e0e12] text-white' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-500`}>
      <div className="w-full max-w-4xl space-y-8">
        
        {/* HLAVIČKA */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black uppercase italic text-fuchsia-500 flex items-center gap-3">
            <span>🔒</span> God Mode
          </h1>
          <Link href="/" className="px-5 py-2.5 bg-zinc-800 text-white rounded-xl font-bold text-xs hover:bg-zinc-700 transition-colors shadow-lg">Back to App</Link>
        </div>

        {/* FORMULÁŘ */}
        <div className="bg-white dark:bg-[#18181b] p-8 rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-xl relative overflow-hidden">
          {editingId && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-orange-500"></div>}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black italic uppercase">{editingId ? 'Edit Vybecard' : 'Create New Vybecard'}</h2>
            {editingId && <button onClick={resetForm} className="text-xs font-bold text-zinc-500 hover:text-white">CANCEL EDIT</button>}
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Market Title (Question)</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Will GTA VI be delayed to 2026?" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Image URL</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://.../image.jpg" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors appearance-none">
                  {availableCategories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resolution Source (Rules)</label>
                <input type="text" value={resolutionSource} onChange={e => setResolutionSource(e.target.value)} placeholder="e.g. Official announcement..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500">Fake Volume (For Trending)</label>
                <input type="number" value={volumeUsd} onChange={e => setVolumeUsd(e.target.value)} placeholder="0" className="w-full bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors text-fuchsia-500 font-mono font-bold" />
              </div>
            </div>

            <button type="submit" className="mt-2 w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.01] transition-all shadow-lg active:scale-95">
              {editingId ? 'Update Vybecard' : 'Deploy to Web'}
            </button>
          </form>
        </div>

        {/* SEZNAM KARET */}
        <div className="bg-white dark:bg-[#18181b] p-8 rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-xl">
          <h2 className="text-xl font-black italic uppercase mb-6">Manage Active Markets</h2>
          
          {isLoading ? (
             <div className="text-center py-10 text-zinc-500 font-bold text-sm animate-pulse">Loading markets from database...</div>
          ) : markets.length === 0 ? (
             <div className="text-center py-10 text-zinc-500 font-bold text-sm">No markets yet.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {markets.map(market => (
                <div key={market.id} className={`flex flex-col lg:flex-row items-center justify-between p-4 rounded-2xl border ${market.is_resolved ? 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/5 opacity-70' : 'bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-white/10 shadow-sm'}`}>
                  
                  <div className="flex items-center gap-4 mb-4 lg:mb-0 w-full lg:w-auto">
                    <img src={market.image_url} alt="market" className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-white/10" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm max-w-[300px] leading-tight">{market.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1">ID: {market.id} | Vol: ${market.volume_usd} | {market.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 w-full lg:w-auto">
                    {!market.is_resolved && (
                      <>
                        <button onClick={() => handleEditClick(market)} className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">Edit</button>
                        <button onClick={() => handleDeleteMarket(market.id)} className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">Del</button>
                        
                        <div className="w-px h-8 bg-zinc-300 dark:bg-white/10 mx-1 hidden lg:block"></div>
                        
                        <button onClick={() => handleResolveMarket(market.id, 'VYBE')} className="flex-1 lg:flex-none px-4 py-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white dark:hover:bg-green-500 dark:hover:text-black transition-colors">Set VYBE</button>
                        <button onClick={() => handleResolveMarket(market.id, 'NO_VYBE')} className="flex-1 lg:flex-none px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-black transition-colors">Set NO VYBE</button>
                      </>
                    )}
                    {market.is_resolved && (
                      <div className="px-5 py-2.5 bg-zinc-200 dark:bg-black rounded-xl text-xs font-black uppercase tracking-widest border border-zinc-300 dark:border-white/10 w-full text-center">
                        Winner: <span className={market.winning_outcome === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{market.winning_outcome}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}