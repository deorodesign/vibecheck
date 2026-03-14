'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Cropper from 'react-easy-crop';
import { useAppContext, CATEGORIES } from '../context';
import { supabase } from '../lib/supabase';

// --- IMAGE CROPPING HELPERS ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob | null> {
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
    }, 'image/jpeg', 0.9); // Quality 90%
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
}
// --------------------------------------

export default function AdminPanel() {
  const { isDarkMode, showToast } = useAppContext();
  
  const [markets, setMarkets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const availableCategories = CATEGORIES.filter((c: string) => c !== 'All' && c !== 'Trending');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(availableCategories[0]);
  const [resolutionSource, setResolutionSource] = useState('');
  const [volumeUsd, setVolumeUsd] = useState('0');

  // Image and CROPPER states
  const [imageUrl, setImageUrl] = useState(''); 
  const [imageSrc, setImageSrc] = useState<string | null>(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedImagePreview, setCroppedImagePreview] = useState<string | null>(null); 
  const [finalImageBlob, setFinalImageBlob] = useState<Blob | null>(null); 
  const [isUploading, setIsUploading] = useState(false);

  // 1. Fetch markets
  const fetchMarkets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('markets').select('*').order('created_at', { ascending: false });
    if (data) setMarkets(data);
    if (error) showToast("Error loading markets", "error");
    setIsLoading(false);
  };

  useEffect(() => { fetchMarkets(); }, []);

  // 2. Reset form
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setImageUrl('');
    setImageSrc(null);
    setCroppedImagePreview(null);
    setFinalImageBlob(null);
    setCategory(availableCategories[0]);
    setResolutionSource('');
    setVolumeUsd('0');
  };

  // 3. Cropper logic
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsCropping(true);
      setImageUrl(''); 
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        setFinalImageBlob(croppedImage);
        setCroppedImagePreview(URL.createObjectURL(croppedImage));
        setIsCropping(false);
        setImageSrc(null); // Reset src to allow re-cropping of the same file later if needed
      }
    } catch (e) {
      showToast("Error cropping image", "error");
    }
  };

  // 4. Submit (Upload Image -> Save to DB)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!imageUrl && !finalImageBlob) || !resolutionSource) {
      showToast("Please fill all required fields or upload/paste an image!", "error");
      return;
    }

    setIsUploading(true);
    let finalImageUrlToSave = imageUrl;

    if (finalImageBlob) {
      showToast("Uploading cropped image...", "success");
      const fileName = `vybe_${Date.now()}.jpg`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vybecards')
        .upload(filePath, finalImageBlob);

      if (uploadError) {
        showToast("Image upload failed: " + uploadError.message, "error");
        setIsUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('vybecards').getPublicUrl(filePath);
      finalImageUrlToSave = publicUrlData.publicUrl;
    }

    if (editingId) {
      const { error } = await supabase.from('markets').update({
        title, image_url: finalImageUrlToSave, category, resolution_source: resolutionSource, volume_usd: Number(volumeUsd) || 0
      }).eq('id', editingId);

      if (error) showToast("Error updating: " + error.message, "error");
      else { showToast("Vybecard updated successfully!", "success"); resetForm(); fetchMarkets(); }
    } else {
      const { error } = await supabase.from('markets').insert({
        title, image_url: finalImageUrlToSave, category, resolution_source: resolutionSource, volume_usd: Number(volumeUsd) || 0, is_resolved: false
      });

      if (error) showToast("Error: " + error.message, "error");
      else { showToast("Vybecard created successfully!", "success"); resetForm(); fetchMarkets(); }
    }
    
    setIsUploading(false);
  };

  // 5. Edit click
  const handleEditClick = (market: any) => {
    setEditingId(market.id);
    setTitle(market.title);
    setImageUrl(market.image_url);
    setCroppedImagePreview(null);
    setFinalImageBlob(null);
    setCategory(market.category);
    setResolutionSource(market.resolution_source);
    setVolumeUsd(market.volume_usd?.toString() || '0');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 6. Delete
  const handleDeleteMarket = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this market?");
    if (!confirmed) return;
    const { error } = await supabase.from('markets').delete().eq('id', id);
    if (error) showToast("Cannot delete.", "error");
    else { showToast("Market deleted!", "success"); fetchMarkets(); }
  };

  // 7. Resolve and Payouts
  const handleResolveMarket = async (id: number, outcome: 'VYBE' | 'NO_VYBE') => {
    const confirmed = window.confirm(`Resolve as ${outcome}? This processes payouts!`);
    if (!confirmed) return;

    const { error: updateError } = await supabase.from('markets').update({ is_resolved: true, winning_outcome: outcome }).eq('id', id);
    if (updateError) return;

    showToast(`Processing payouts for ${outcome}...`, "success");
    const { data: allBets } = await supabase.from('bets').select('*').eq('market_id', id);
    
    if (allBets) {
      const winningBets = allBets.filter(bet => bet.type === outcome);
      let totalPaidOut = 0; let winnersCount = 0;

      for (const bet of winningBets) {
        const payoutAmount = Number(bet.amount) / (Number(bet.entry_price) / 100);
        const { data: userData } = await supabase.from('users').select('balance').eq('id', bet.user_id).single();
        if (userData) {
          await supabase.from('users').update({ balance: Number(userData.balance) + payoutAmount }).eq('id', bet.user_id);
          totalPaidOut += payoutAmount; winnersCount++;
        }
      }
      if (winnersCount > 0) showToast(`Paid out ${totalPaidOut.toFixed(2)} USDC to ${winnersCount} winners.`, "success");
    }
    fetchMarkets();
  };

  return (
    <main className={`flex min-h-screen flex-col items-center p-8 font-sans ${isDarkMode ? 'bg-[#0e0e12] text-white' : 'bg-zinc-50 text-zinc-900'} transition-colors duration-500`}>
      <div className="w-full max-w-4xl space-y-8 relative">
        
        {/* MODAL FOR IMAGE CROPPING */}
        {isCropping && imageSrc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
            <div className="w-full max-w-3xl bg-[#18181b] rounded-3xl overflow-hidden border border-white/10 flex flex-col h-[85vh]">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
                <h3 className="font-black italic uppercase text-white tracking-widest text-lg">Crop Your Image (16:9)</h3>
                <button onClick={() => { setIsCropping(false); setImageSrc(null); }} className="text-zinc-500 hover:text-white font-bold text-xs uppercase">Cancel</button>
              </div>
              <div className="relative flex-1 bg-black">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9} // Perfect landscape ratio for your cards
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="p-6 bg-black/50 border-t border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Zoom</span>
                  <input type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-fuchsia-500" />
                </div>
                <button onClick={handleCropSave} className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.01] active:scale-95 transition-all shadow-lg">
                  Confirm Crop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black uppercase italic text-fuchsia-500 flex items-center gap-3">
            <span>🔒</span> Ultra God Mode
          </h1>
          <Link href="/" className="px-5 py-2.5 bg-zinc-800 text-white rounded-xl font-bold text-xs hover:bg-zinc-700 transition-colors shadow-lg">Back to App</Link>
        </div>

        {/* FORM */}
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

            {/* IMAGE SECTION */}
            <div className="p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Card Image (16:9 Landscape)</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-zinc-400">Option A: Upload & Crop</span>
                  <div className="relative overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={onFileChange}
                      onClick={(e) => (e.currentTarget.value = '')} // This fixes the bug where picking the same image twice does nothing
                      className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 transition-all cursor-pointer" 
                    />
                  </div>
                  {croppedImagePreview && (
                    <div className="mt-2 flex items-center gap-4 bg-green-500/10 border border-green-500/30 p-3 rounded-xl animate-in fade-in zoom-in">
                      <img src={croppedImagePreview} alt="Cropped preview" className="w-16 h-9 rounded-lg object-cover shadow-md" />
                      <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Image Cropped!</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-zinc-400">Option B: Paste Image URL</span>
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={e => {
                      setImageUrl(e.target.value);
                      setFinalImageBlob(null);
                      setCroppedImagePreview(null);
                    }} 
                    placeholder="https://.../image.jpg" 
                    className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors appearance-none">
                  {availableCategories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500">Fake Volume (For Trending)</label>
                <input type="number" value={volumeUsd} onChange={e => setVolumeUsd(e.target.value)} placeholder="0" className="w-full bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors text-fuchsia-500 font-mono font-bold" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resolution Source (Rules)</label>
              <input type="text" value={resolutionSource} onChange={e => setResolutionSource(e.target.value)} placeholder="e.g. Official announcement..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>

            <button disabled={isUploading} type="submit" className={`mt-2 w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-black uppercase tracking-widest text-sm shadow-lg transition-all ${isUploading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01] active:scale-95'}`}>
              {isUploading ? 'Processing...' : (editingId ? 'Update Vybecard' : 'Deploy to Web')}
            </button>
          </form>
        </div>

        {/* MARKET LIST */}
        {!isCropping && (
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
                      <img src={market.image_url} alt="market" className="w-16 h-9 rounded-md object-cover border border-zinc-200 dark:border-white/10 shadow-sm" />
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
        )}

      </div>
    </main>
  );
}