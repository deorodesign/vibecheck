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
  const { isLoggedIn, isAuthLoading, walletAddress } = useAppContext();
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pop Culture');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRules, setNewRules] = useState('');
  const [fakeVolume, setFakeVolume] = useState('0');
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const verifyAdminSafely = async () => {
      if (isAuthLoading) return;
      
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        // 1. KROK: Získáme bezpečně ID přihlášeného uživatele z backend tokenu (nelze zfalšovat na frontendu)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setLoading(false);
          return;
        }

        // 2. KROK: Podíváme se do tabulky public.users, jestli má tento uživatel roli ADMIN
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile && profile.role === 'ADMIN') {
          setIsAdminVerified(true);
          fetchMarkets(); // Načteme data, protože uživatel je legit admin
        } else {
          setLoading(false); // Není admin, necháme ho spadnout do "Access Denied" obrazovky
        }
      } catch (error) {
        console.error("Critical error during admin verification:", error);
        setLoading(false);
      }
    };

    verifyAdminSafely();
  }, [isAuthLoading, isLoggedIn]); // walletAddress už nepotřebujeme sledovat pro bezpečnost

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
    setNewRules(market.rules || market.resolution_source || '');
    setFakeVolume(market.volume_usd?.toString() || '0');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTitle('');
    setNewImageUrl('');
    setNewRules('');
    setFakeVolume('0');
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
    } catch (e) {
      console.error(e);
    }
  };

  const saveMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return alert("Market title is required!");
    setUploading(true);
    let finalImageUrl = newImageUrl;
    
    if (croppedImageBlob) {
      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { error: uploadError, data } = await supabase.storage
          .from('markets')
          .upload(`public/${fileName}`, croppedImageBlob, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;
        if (data) {
          const { data: publicUrlData } = supabase.storage.from('markets').getPublicUrl(`public/${fileName}`);
          finalImageUrl = publicUrlData.publicUrl;
        }
      } catch (err: any) {
        console.error("Image upload failed:", err);
        alert("Image upload failed: " + err.message);
        setUploading(false);
        return;
      }
    }
    
    const marketData = {
      title: newTitle,
      category: newCategory,
      image_url: finalImageUrl,
      rules: newRules,
      resolution_source: newRules,
      volume_usd: Number(fakeVolume) || 0
    };
    
    if (editingId) {
      const { error } = await supabase.from('markets').update(marketData).eq('id', editingId);
      if (error) alert("Error updating market: " + error.message);
      else {
        alert("Market updated!");
        cancelEdit();
        fetchMarkets();
      }
    } else {
      const { error } = await supabase.from('markets').insert([{ ...marketData, is_resolved: false }]);
      if (error) alert("Error creating market: " + error.message);
      else {
        alert("Market deployed successfully!");
        cancelEdit();
        fetchMarkets();
      }
    }
    setUploading(false);
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

          if (isWinner) {
            const { data: userData } = await supabase.from('users').select('balance, xp_points').eq('wallet_address', bet.user_address).single();
            if (userData) {
              await supabase.from('users').update({
                balance: Number(userData.balance) + payoutAmount,
                xp_points: Number(userData.xp_points || 0) + 500
              }).eq('wallet_address', bet.user_address);
            }
          }
        }
      }
      alert(`Market resolved! Payouts & XP calculated and distributed.`);
      fetchMarkets();
    } catch (error) {
      alert("Error resolving the market.");
    }
  };

  const deleteMarket = async (marketId: number) => {
    const confirmDelete = window.confirm(
      "DANGER: Are you absolutely sure you want to delete this market? This will also delete all bets associated with it and cannot be undone!"
    );
    if (!confirmDelete) return;
    try {
      await supabase.from('bets').delete().eq('market_id', marketId);
      const { error } = await supabase.from('markets').delete().eq('id', marketId);
      if (error) throw error;
      alert("Market and its bets deleted successfully.");
      fetchMarkets();
    } catch (error: any) {
      alert("Error deleting market: " + error.message);
    }
  };

  if (isAuthLoading || (loading && !isAdminVerified)) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-500 p-10 font-mono uppercase text-center py-32 flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      Verifying Admin Access...
    </div>;
  }

  if (!isAdminVerified) {
    return (
      <div className="min-h-screen bg-[#0e0e12] flex flex-col items-center justify-center text-white p-4 font-sans">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center max-w-md shadow-2xl animate-in zoom-in-95 fade-in duration-300">
          <span className="text-4xl mb-4 block">🛑</span>
          <h1 className="text-2xl font-black uppercase tracking-widest text-red-500 mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-sm font-medium mb-8 leading-relaxed">
            You do not have administrator privileges to view this page. Please log in with an authorized admin account.
          </p>
          <Link href="/" className="bg-white text-black px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all active:scale-95 shadow-md">
            Return to Vybecheck
          </Link>
        </div>
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
          <div>
            <h1 className="text-4xl font-black text-fuchsia-500 mb-2 uppercase tracking-tighter">Vybecheck Admin</h1>
            <p className="text-zinc-400 uppercase text-sm tracking-widest">Platform Owner Control Panel</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-green-500 uppercase tracking-widest font-bold">Admin Verified ✓</p>
             <p className="text-xs text-zinc-500">{walletAddress || "Authenticated"}</p>
          </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 appearance-none">
                  <option>Pop Culture</option><option>Gaming</option><option>Crypto</option><option>Sports</option><option>Trending</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Fake Volume (For Trending)</label>
                <input type="number" value={fakeVolume} onChange={(e) => setFakeVolume(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Resolution Rules</label>
              <textarea value={newRules} onChange={(e) => setNewRules(e.target.value)} placeholder="Describe how the market will be settled..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none focus:border-fuchsia-500 h-24 resize-none" />
            </div>
            
            <div className="flex gap-4">
              <button disabled={uploading} type="submit" className={`flex-1 bg-gradient-to-r from-fuchsia-600 to-orange-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-transform ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}>
                {uploading ? 'Processing...' : (editingId ? 'Save Changes' : 'Deploy to Web')}
              </button>
              {editingId && <button type="button" onClick={cancelEdit} className="px-8 bg-zinc-800 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-zinc-700">Cancel</button>}
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest text-white">Active Markets</h2>
          {activeMarkets.map((market) => (
            <div key={market.id} className="p-6 rounded-[2rem] border border-zinc-800 bg-zinc-900 relative group">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  {(market.image_url || market.imageUrl) && <img src={market.image_url || market.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover object-top border border-zinc-800" />}
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{market.title}</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {market.id} | {market.category}</p>
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
          {activeMarkets.length === 0 && <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] text-center">No active markets</p>}
        </section>

        <section className="space-y-4 pt-10 border-t border-zinc-800">
          <h2 className="text-xl font-black mb-6 uppercase italic tracking-widest text-zinc-600">Resolved Markets Archive</h2>
          {resolvedMarkets.map((market) => (
            <div key={market.id} className="p-4 rounded-[1.5rem] border border-zinc-800/50 bg-zinc-900/30 opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {(market.image_url || market.imageUrl) && <img src={market.image_url || market.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover object-top grayscale" />}
                  <div>
                    <h2 className="text-sm font-bold text-white line-clamp-1">{market.title}</h2>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                      Won: <span className={market.winning_outcome === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{market.winning_outcome}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(market)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] uppercase tracking-widest rounded-full font-black transition-colors">Edit</button>
                  <button onClick={() => deleteMarket(market.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500/70 hover:text-red-500 text-[9px] uppercase tracking-widest rounded-full font-black transition-colors">Del</button>
                </div>
              </div>
            </div>
          ))}
          {resolvedMarkets.length === 0 && <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] text-center">No resolved markets</p>}
        </section>

      </div>
    </div>
  );
}