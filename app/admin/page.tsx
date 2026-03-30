'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Cropper from 'react-easy-crop';
import { useAppContext } from '../context';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;
  
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg');
  });
}

export default function AdminPanel() {
  const { isLoggedIn, isAuthLoading, walletAddress, showToast } = useAppContext();
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  const [markets, setMarkets] = useState<any[]>([]);
  const [marketStats, setMarketStats] = useState<any>({});
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEndingSeason, setIsEndingSeason] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Internet Drama');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRules, setNewRules] = useState('');
  const [fakeVolume, setFakeVolume] = useState('0');
  const [closesAt, setClosesAt] = useState(''); // NOVÝ STAV PRO DEADLINE
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const verifyAdminSafely = async () => {
      if (isAuthLoading) return;
      if (!isLoggedIn) { setLoading(false); return; }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { setLoading(false); return; }

        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (profile && profile.role === 'ADMIN') {
          setIsAdminVerified(true);
          fetchMarkets(); 
          fetchArchives();
        } else {
          setLoading(false); 
        }
      } catch (error) {
        console.error("Critical error during admin verification:", error);
        setLoading(false);
      }
    };
    verifyAdminSafely();
  }, [isAuthLoading, isLoggedIn]);

  const fetchMarkets = async () => {
    const { data: marketsData } = await supabase.from('markets').select('*').order('created_at', { ascending: false });
    const { data: betsData } = await supabase.from('bets').select('market_id, amount, status, payout');

    if (marketsData) {
      setMarkets(marketsData);
      const stats: any = {};
      marketsData.forEach(m => { stats[m.id] = { totalVolume: 0, cashedOutVolume: 0, activeVolume: 0, betCount: 0 }; });

      if (betsData) {
        betsData.forEach(bet => {
          if (stats[bet.market_id]) {
            stats[bet.market_id].betCount += 1;
            stats[bet.market_id].totalVolume += Number(bet.amount);
            if (bet.status === 'cashed_out') stats[bet.market_id].cashedOutVolume += Number(bet.payout || 0);
            else stats[bet.market_id].activeVolume += Number(bet.amount);
          }
        });
      }
      setMarketStats(stats);
    }
    setLoading(false);
  };

  const fetchArchives = async () => {
    const { data } = await supabase.from('season_archives').select('*').order('season_date', { ascending: false });
    if (data) setArchives(data);
  };

  const handleEdit = (market: any) => {
    setEditingId(market.id);
    setNewTitle(market.title);
    setNewCategory(market.category || 'Internet Drama');
    setNewImageUrl(market.image_url || market.imageUrl || '');
    setNewRules(market.rules || market.resolution_source || '');
    setFakeVolume(market.volume_usd?.toString() || '0');
    
    // NAČTENÍ ČASU DO FORMULÁŘE PŘI EDITACI (převod na formát pro datetime-local)
    if (market.closes_at) {
        const dateObj = new Date(market.closes_at);
        // Posun kvůli časovému pásmu prohlížeče, aby to sedělo do inputu
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);
        setClosesAt(localISOTime);
    } else {
        setClosesAt('');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTitle('');
    setNewImageUrl('');
    setNewRules('');
    setFakeVolume('0');
    setClosesAt(''); // RESET ČASU
    setCroppedImageBlob(null);
    setImageSrc(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = URL.createObjectURL(file);
      setImageSrc(imageDataUrl);
      setCroppedImageBlob(null);
      e.target.value = '';
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImageBlob(croppedImage);
      setImageSrc(null);
    } catch (e) { console.error(e); }
  };

  const saveMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return showToast("Market title is required!", "error");
    
    setUploading(true);
    let finalImageUrl = newImageUrl;
    
    if (croppedImageBlob) {
      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { error: uploadError, data } = await supabase.storage.from('markets').upload(`public/${fileName}`, croppedImageBlob, { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        if (data) {
          const { data: publicUrlData } = supabase.storage.from('markets').getPublicUrl(`public/${fileName}`);
          finalImageUrl = publicUrlData.publicUrl;
        }
      } catch (err: any) {
        showToast("Image upload failed: " + err.message, "error");
        setUploading(false);
        return;
      }
    }
    
    // PŘÍPRAVA DAT PRO DB VČETNĚ closes_at
    const marketData = {
      title: newTitle,
      category: newCategory,
      image_url: finalImageUrl,
      rules: newRules,
      resolution_source: newRules,
      volume_usd: Number(fakeVolume) || 0,
      is_resolved: false,
      closes_at: closesAt ? new Date(closesAt).toISOString() : null // Převede lokální čas z inputu do UTC pro Supabase
    };

    if (editingId) {
      const { error } = await supabase.from('markets').update(marketData).eq('id', editingId).select();
      if (error) showToast("Database error: " + error.message, "error");
      else { showToast("Market updated successfully!", "success"); cancelEdit(); fetchMarkets(); }
    } else {
      const { error } = await supabase.from('markets').insert([marketData]).select();
      if (error) showToast("Database rejected it: " + error.message, "error");
      else { showToast("Market deployed successfully!", "success"); cancelEdit(); fetchMarkets(); }
    }
    setUploading(false);
  };

  const resolveMarket = async (marketId: number, winningOutcome: 'VYBE' | 'NO_VYBE') => {
    if (!window.confirm(`Are you sure you want to resolve this market as ${winningOutcome}?`)) return;
    try {
      const { data, error } = await supabase.rpc('resolve_market_secure', { p_market_id: marketId, p_winning_outcome: winningOutcome });
      if (error) throw error;
      showToast(`Market resolved!`, "success");
      fetchMarkets();
    } catch (error: any) { showToast("Error resolving the market: " + error.message, "error"); }
  };

  const deleteMarket = async (marketId: number) => {
    if (!window.confirm("DANGER: Are you absolutely sure you want to delete this market?")) return;
    try {
      await supabase.from('bets').delete().eq('market_id', marketId);
      await supabase.from('chat_messages').delete().eq('market_id', marketId);
      const { error } = await supabase.from('markets').delete().eq('id', marketId);
      if (error) throw error;
      showToast("Market deleted successfully.", "success");
      fetchMarkets();
    } catch (error: any) { showToast("Error deleting market: " + error.message, "error"); }
  };

  const handleEndSeason = async () => {
    const confirmReset = window.prompt("WARNING: This will archive top players and RESET ALL XP TO 0. Type 'RESET' to confirm.");
    if (confirmReset !== 'RESET') return;
    setIsEndingSeason(true);
    const { data, error } = await supabase.rpc('end_season_and_reset');
    if (error) showToast(`Error ending season: ${error.message}`, "error");
    else if (data && data.success) { showToast(data.message, "success"); fetchArchives(); }
    setIsEndingSeason(false);
  };

  if (isAuthLoading || (loading && !isAdminVerified)) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-500 p-10 font-mono uppercase text-center py-32 flex flex-col items-center justify-center gap-4"><div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>Verifying Admin Access...</div>;
  }

  if (!isAdminVerified) {
    return (
      <div className="min-h-screen bg-[#0e0e12] flex flex-col items-center justify-center text-white p-4 font-sans">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center max-w-md shadow-2xl"><span className="text-4xl mb-4 block">🛑</span><h1 className="text-2xl font-black uppercase tracking-widest text-red-500 mb-2">Access Denied</h1><Link href="/" className="bg-white text-black px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-md">Return to Vybecheck</Link></div>
      </div>
    );
  }

  const activeMarkets = markets.filter(m => !m.is_resolved);
  const resolvedMarkets = markets.filter(m => m.is_resolved);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 font-mono relative">
      {imageSrc && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl h-[60vh] bg-zinc-900 rounded-3xl overflow-hidden mb-6 shadow-2xl border border-zinc-800">
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={16 / 9} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="flex gap-4 w-full max-w-2xl">
            <button onClick={showCroppedImage} className="flex-1 bg-gradient-to-r from-fuchsia-600 to-orange-600 hover:from-fuchsia-500 hover:to-orange-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg">Confirm Crop</button>
            <button type="button" onClick={() => setImageSrc(null)} className="px-8 bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all">Cancel</button>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex justify-between items-end">
          <div><h1 className="text-4xl font-black text-fuchsia-500 mb-2 uppercase tracking-tighter">Vybecheck Admin</h1><p className="text-zinc-400 uppercase text-sm tracking-widest">Platform Owner Control Panel</p></div>
          <div className="text-right"><p className="text-[10px] text-green-500 uppercase tracking-widest font-bold">Admin Verified ✓</p><p className="text-xs text-zinc-500">{walletAddress}</p></div>
        </header>

        <section className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest">{editingId ? 'Edit Market' : 'Deploy New Market'}</h2>
          <form onSubmit={saveMarket} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Market Title</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Johny vs. Tobby" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/50">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Option A: Upload & Crop</label>
                <input type="file" accept="image/*" onChange={onFileChange} className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer" />
                {croppedImageBlob && <p className="text-xs text-green-500 font-bold mt-3 uppercase tracking-widest">✓ Image cropped</p>}
              </div>
              <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/50">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Option B: Paste Image URL</label>
                <input type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-fuchsia-500" />
              </div>
            </div>

            {/* UPRAVENÝ GRID PRO PŘIDÁNÍ DEADLINE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 appearance-none">
                  <option value="Internet Drama">Internet Drama</option>
                  <option value="The Boring Stuff">The Boring Stuff</option>
                  <option value="Degen Moves">Degen Moves</option>
                  <option value="Pure Vybe">Pure Vybe</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Trading Deadline (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={closesAt} 
                  onChange={(e) => setClosesAt(e.target.value)} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 [color-scheme:dark]" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Fake Volume ($)</label>
                <input type="number" value={fakeVolume} onChange={(e) => setFakeVolume(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Resolution Rules</label>
              <textarea value={newRules} onChange={(e) => setNewRules(e.target.value)} placeholder="Describe how the market will be settled..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 h-24 resize-none" />
            </div>
            
            <div className="flex gap-4">
              <button disabled={uploading} type="submit" className={`flex-1 bg-gradient-to-r from-fuchsia-600 to-orange-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-transform ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}>{uploading ? 'Processing...' : (editingId ? 'Save Changes' : 'Deploy to Web')}</button>
              {editingId && <button type="button" onClick={cancelEdit} className="px-8 bg-zinc-800 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-zinc-700">Cancel</button>}
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest text-white">Active Markets</h2>
          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeMarkets.map((market) => (
              <div key={market.id} className="p-6 rounded-[2rem] border border-zinc-800 bg-zinc-900 relative group shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    {(market.image_url || market.imageUrl) && <img src={market.image_url || market.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover object-top border border-zinc-800" />}
                    <div>
                      <h2 className="text-lg font-bold text-white leading-tight">{market.title}</h2>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {market.id} | {market.category}</p>
                      {market.closes_at && <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-1">Closes: {new Date(market.closes_at).toLocaleString()}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(market)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] uppercase tracking-widest rounded-full font-black transition-colors">Edit</button>
                    <button onClick={() => deleteMarket(market.id)} className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] uppercase tracking-widest rounded-full font-black transition-colors">Del</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => resolveMarket(market.id, 'VYBE')} className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-xs">WINNER: VYBE</button>
                  <button onClick={() => resolveMarket(market.id, 'NO_VYBE')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-xs">WINNER: NO VYBE</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 pt-10 border-t border-zinc-800">
          <div className="flex justify-between items-end mb-6">
             <h2 className="text-xl font-black uppercase italic tracking-widest text-zinc-600">Past Season Winners</h2>
             <button onClick={handleEndSeason} disabled={isEndingSeason} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] uppercase tracking-widest rounded-full font-black transition-colors">
               {isEndingSeason ? 'Processing...' : 'Force End Season'}
             </button>
          </div>
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {archives.length === 0 ? (
               <p className="text-xs text-zinc-600 italic px-2">No archived seasons yet.</p>
            ) : (
              archives.map((arch) => (
                <div key={arch.id} className="p-5 rounded-[1.5rem] border border-zinc-800/50 bg-zinc-900/50 flex flex-col gap-3">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Season Ended: {new Date(arch.season_date).toLocaleDateString()}</p>
                  <div className="flex flex-col gap-2">
                    {arch.top_players?.map((p: any, i: number) => (
                       <div key={i} className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                          <span className="text-xs font-bold text-white"><span className="text-fuchsia-500 mr-2">#{i+1}</span>{p.nickname}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{p.xp_points} XP</span>
                       </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        
        <section className="space-y-4 pt-10 border-t border-zinc-800">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest text-zinc-600">Resolved Markets Archive</h2>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {resolvedMarkets.map((market) => (
              <div key={market.id} className="p-5 rounded-[1.5rem] border border-zinc-800/50 bg-zinc-900/30 opacity-80 flex flex-col gap-4 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {(market.image_url || market.imageUrl) && <img src={market.image_url || market.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover object-top grayscale" />}
                    <div>
                      <h2 className="text-sm font-bold text-white line-clamp-1">{market.title}</h2>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Won: <span className={market.winning_outcome === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{market.winning_outcome}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => deleteMarket(market.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500/70 hover:text-red-500 text-[9px] uppercase tracking-widest rounded-full font-black transition-colors">Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
