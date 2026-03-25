'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';
import Cropper from 'react-easy-crop';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => { canvas.toBlob((file) => { resolve(file); }, 'image/jpeg'); });
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoading, walletAddress, balance, userXp, nickname, avatarUrl, myBets, markets, marketPrices, cashOutBet, showToast, claimReliefFund, fetchData } = useAppContext();
  
  const [payoutAddress, setPayoutAddress] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showXpRules, setShowXpRules] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);

  const baseStartingBalance = 500;

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isLoggedIn) {
        router.push('/'); 
      } else if (walletAddress) {
        fetchData();
      }
    }
  }, [isAuthLoading, isLoggedIn, walletAddress, router, fetchData]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (walletAddress) {
        const { data } = await supabase.from('users').select('payout_wallet').eq('wallet_address', walletAddress).single();
        if (data && (data as any).payout_wallet) setPayoutAddress((data as any).payout_wallet);
      }
    };
    fetchWallet();
  }, [walletAddress]);

  useEffect(() => {
    setTempName(nickname || '');
    setAvatarInputUrl(avatarUrl || '');
  }, [nickname, avatarUrl]);

  const saveWallet = async () => {
    if (!payoutAddress.trim()) return showToast('Please enter a valid wallet address.', 'error');
    setSavingWallet(true);
    const { error } = await supabase.rpc('save_payout_wallet', { p_wallet: payoutAddress.trim() });
    if (error) showToast(`Error saving wallet: ${error.message}`, 'error');
    else showToast('Payout wallet saved successfully!', 'success');
    setSavingWallet(false);
  };

  const saveName = async () => {
    if (!tempName.trim()) return showToast('Nickname cannot be empty.', 'error');
    setSavingName(true);
    try {
      const { error } = await supabase.from('users').update({ nickname: tempName.trim() }).eq('wallet_address', walletAddress);
      if (error) throw error;
      showToast('Name updated successfully!', 'success');
      setIsEditingName(false);
      window.location.reload(); 
    } catch (error: any) {
      showToast(`Error updating name: ${error.message}`, 'error');
    } finally {
      setSavingName(false);
    }
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

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImageBlob(croppedImage);
      setImageSrc(null);
    } catch (e) { console.error(e); }
  };

  const saveAvatar = async () => {
    setSavingAvatar(true);
    let finalUrl = avatarInputUrl;
    
    if (croppedImageBlob) {
      try {
        const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { error: uploadError, data } = await supabase.storage.from('avatars').upload(`public/${fileName}`, croppedImageBlob, { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        if (data) {
          const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(`public/${fileName}`);
          finalUrl = publicUrlData.publicUrl;
        }
      } catch (err: any) {
        showToast("Image upload failed: " + err.message, "error");
        setSavingAvatar(false);
        return;
      }
    }

    try {
      const { error } = await supabase.from('users').update({ avatar_url: finalUrl }).eq('wallet_address', walletAddress);
      if (error) throw error;
      showToast('Profile picture updated!', 'success');
      setIsAvatarModalOpen(false);
      window.location.reload(); 
    } catch (error: any) {
      showToast(`Error updating picture: ${error.message}`, 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const enrichedBets = myBets.map((bet: any) => {
    const marketDetails = markets.find((m: any) => m.id === bet.marketId);
    return { ...bet, markets: marketDetails || { title: 'Unknown Market', image_url: '' } };
  });

  const activeBetsList = enrichedBets.filter((b: any) => b.status === 'pending' || !b.status);
  const resolvedBetsList = enrichedBets.filter((b: any) => b.status === 'won' || b.status === 'lost' || b.status === 'cashed_out');

  const totalVolume = enrichedBets.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  const activeBetsValue = activeBetsList.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  const safeBalance = balance || 0;
  const currentPortfolioValue = safeBalance + activeBetsValue;

  const netReturn = baseStartingBalance > 0 ? ((currentPortfolioValue - baseStartingBalance) / baseStartingBalance) * 100 : 0;
  
  const wins = resolvedBetsList.filter((b: any) => b.status === 'won' || (b.status === 'cashed_out' && b.payout > b.amount)).length;
  const losses = resolvedBetsList.filter((b: any) => b.status === 'lost' || (b.status === 'cashed_out' && b.payout <= b.amount)).length;

  if (isAuthLoading) return <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex items-center justify-center font-black uppercase tracking-widest text-fuchsia-500 italic">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white font-mono transition-colors duration-500 p-4 md:p-10">
      
      {imageSrc && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm h-[40vh] bg-zinc-900 rounded-3xl overflow-hidden mb-6 shadow-2xl">
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="flex gap-4 w-full max-w-sm">
            <button onClick={showCroppedImage} className="flex-1 bg-gradient-to-r from-fuchsia-600 to-orange-600 hover:opacity-90 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px] md:text-sm">Crop Avatar</button>
            <button type="button" onClick={() => setImageSrc(null)} className="px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px] md:text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        
        <header className="w-full flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </div>
            <span className="font-black text-xs uppercase tracking-widest hidden sm:inline">Back to Markets</span>
          </Link>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter cursor-default italic">
            Vybecheck
          </h1>
        </header>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 md:p-8 shadow-lg flex flex-col justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-fuchsia-500/10 to-transparent rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-30">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-lg text-white border-4 border-white dark:border-[#0a0a0a] overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (nickname ? nickname.charAt(0).toUpperCase() : 'V')}
              </div>
              <button onClick={() => setIsAvatarModalOpen(true)} className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] hover:scale-110 transition-transform shadow-md">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>

            <div className="flex-1 w-full mt-2 sm:mt-0">
              {isEditingName ? (
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-2 w-full max-w-sm mx-auto sm:mx-0">
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-lg font-black outline-none focus:border-fuchsia-500 text-center sm:text-left" />
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button onClick={saveName} disabled={savingName} className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">Save</button>
                    <button onClick={() => { setIsEditingName(false); setTempName(nickname || ''); }} className="flex-1 sm:flex-none px-4 py-2 bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1 group/name cursor-pointer w-fit mx-auto sm:mx-0" onClick={() => setIsEditingName(true)}>
                  <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest truncate max-w-[200px] sm:max-w-full">{nickname || 'ANONYMOUS VYBER'}</h2>
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover/name:bg-fuchsia-500 group-hover/name:text-white transition-colors shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-3">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 w-full sm:w-auto">
                  <p className="text-[11px] sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    Bankroll: <span className="text-green-500 font-mono">{safeBalance.toFixed(2)} USDC</span>
                  </p>
                  
                  {safeBalance < 20 && (
                    <button 
                      onClick={claimReliefFund}
                      className="px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-white border border-fuchsia-500/30 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 animate-pulse w-full sm:w-auto text-center"
                    >
                      Claim Relief Fund (+50)
                    </button>
                  )}
                </div>
                
                <div className="relative w-full sm:w-auto flex justify-center" onMouseEnter={() => setShowXpRules(true)} onMouseLeave={() => setShowXpRules(false)}>
                  <p className="text-[11px] sm:text-sm font-black text-fuchsia-500 uppercase tracking-widest bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1.5 rounded-lg cursor-help flex items-center justify-center gap-2 w-fit">
                    Season XP: <span className="font-mono">{userXp || 0}</span>
                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </p>
                  
                  {showXpRules && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0 mt-2 w-64 sm:w-72 p-4 bg-zinc-900 dark:bg-black border border-zinc-700 dark:border-zinc-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">How XP Works</h4>
                      <ul className="text-xs text-zinc-300 font-sans space-y-2">
                        <li className="flex items-start gap-2"><span className="text-fuchsia-500 mt-0.5 font-bold">▪</span><span><strong>+1 XP</strong> for every 1 USDC traded.</span></li>
                        <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 font-bold">▪</span><span><strong>+10 XP</strong> for every 1 USDC of net profit.</span></li>
                      </ul>
                      <p className="text-[10px] text-fuchsia-400 mt-3 font-bold italic">Top 3 players win monthly airdrops.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 w-full border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-2 relative z-10 text-center sm:text-left">
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Volume Traded</p>
              <p className="text-sm sm:text-lg font-black font-mono">${totalVolume.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Active Bets</p>
              <p className="text-sm sm:text-lg font-black font-mono">{activeBetsList.length}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Net Return</p>
              <p className={`text-sm sm:text-lg font-black font-mono ${netReturn > 0 ? 'text-green-500' : netReturn < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                {netReturn > 0 ? '+' : ''}{netReturn.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Win / Loss</p>
              <p className="text-sm sm:text-lg font-black font-mono">
                <span className="text-green-500">{wins}</span> <span className="text-zinc-300 dark:text-zinc-600">/</span> <span className="text-red-500">{losses}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 md:p-8 shadow-md">
          <div className="mb-5">
            <h3 className="text-base sm:text-lg font-black uppercase italic tracking-widest mb-2">Payout Wallet</h3>
            <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
              Add your Solana or EVM address to receive monthly USDC airdrops if you make it to the top 3 on the leaderboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={payoutAddress} onChange={(e) => setPayoutAddress(e.target.value)} placeholder="0x... or Solana address" className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-fuchsia-500 transition-colors" />
            <button onClick={saveWallet} disabled={savingWallet} className="bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95 font-black px-6 py-3 sm:px-8 sm:py-4 rounded-xl uppercase tracking-widest text-[10px] sm:text-xs transition-all disabled:opacity-50 disabled:active:scale-100 sm:min-w-[140px] shadow-md">
              {savingWallet ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 md:p-8 shadow-md">
          <h3 className="text-base sm:text-lg font-black uppercase italic tracking-widest mb-5">My Active Bets</h3>
          <div className="space-y-3">
            {activeBetsList.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 border-dashed rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-950/50">
                <p className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">No active bets.</p>
                <Link href="/" className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Start Trading</Link>
              </div>
            ) : (
              activeBetsList.map((bet: any) => {
                const currentPriceObj = marketPrices[bet.marketId];
                const currentPriceRaw = currentPriceObj ? (bet.type === 'VYBE' ? currentPriceObj.vibe : currentPriceObj.noVibe) : 0.5;
                const currentPrice = currentPriceRaw * 100;
                
                const entryPrice = bet.entryPrice || 50;
                const shares = bet.amount / (entryPrice / 100);
                const currentValue = shares * currentPriceRaw;
                const profitLoss = currentValue - bet.amount;

                return (
                  <div key={bet.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors gap-4">
                    <div className="flex items-center gap-3">
                      {(bet.markets?.image_url || bet.markets?.imageUrl) && <img src={bet.markets?.image_url || bet.markets?.imageUrl} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0" />}
                      <div>
                        <p className="font-bold text-xs sm:text-sm line-clamp-1">{bet.markets?.title || 'Unknown Market'}</p>
                        <p className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Bet: <span className={bet.type === 'VYBE' ? 'text-green-500' : 'text-red-500'}>{bet.type}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800 pt-3 sm:pt-0 mt-1 sm:mt-0">
                      <div className="text-left sm:text-right">
                        <p className="font-black text-xs sm:text-sm font-mono">{bet.amount} USDC</p>
                        <p className={`text-[9px] font-mono mt-1 ${profitLoss > 0 ? 'text-green-500' : profitLoss < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                          Value: ${currentValue.toFixed(2)}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to cash out for ${currentValue.toFixed(2)} USDC?`)) {
                            cashOutBet(bet.id, currentPrice);
                          }
                        }}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[9px] sm:text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 md:p-8 shadow-md">
          <h3 className="text-base sm:text-lg font-black uppercase italic tracking-widest mb-5">History</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {resolvedBetsList.length === 0 ? (
              <div className="text-center py-8 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-950/50">
                <p className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-widest">No history yet.</p>
              </div>
            ) : (
              resolvedBetsList.map((bet: any) => {
                const marketDetails = markets.find((m: any) => m.id === bet.marketId);
                return (
                  <div key={bet.id} className="flex justify-between items-center p-4 rounded-xl md:rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 opacity-90 hover:opacity-100 transition-opacity">
                    <div className="pr-4 flex-1">
                      <p className="font-bold text-[11px] sm:text-sm text-zinc-700 dark:text-zinc-300 line-clamp-1">{marketDetails?.title || 'Unknown Market'}</p>
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">
                        {bet.type} | <span className={bet.status === 'won' || (bet.status === 'cashed_out' && bet.payout > bet.amount) ? 'text-green-500' : bet.status === 'cashed_out' ? 'text-blue-500' : 'text-zinc-500'}>{bet.status === 'cashed_out' ? 'SOLD' : bet.status}</span>
                      </p>
                    </div>
                    
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className="font-black text-[10px] sm:text-xs text-zinc-500 font-mono">{bet.amount} USDC</p>
                      <p className={`text-[9px] sm:text-[11px] font-black font-mono tracking-widest ${bet.status === 'won' || (bet.status === 'cashed_out' && bet.payout > bet.amount) ? 'text-green-500' : 'text-red-500'}`}>
                        {bet.status === 'won' || (bet.status === 'cashed_out' && bet.payout > bet.amount) ? '+' : ''}{(bet.payout || 0).toFixed(2)} USDC
                      </p>
                      
                      {(bet.status === 'won' || (bet.status === 'cashed_out' && bet.payout > bet.amount)) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const profit = (bet.payout || 0) - bet.amount;
                            const roi = Math.round((profit / bet.amount) * 100);
                            const cleanTitle = marketDetails?.title || 'a market';
                            const link = `${window.location.origin}`; 
                            
                            const tweetText = `Just secured a massive +${roi}% ROI ($${profit.toFixed(0)} profit) predicting "${cleanTitle}" on @Vybecheck! 🔮📈\n\nAre you fading me or following my vybe? 👀👇\n${link}`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                          }}
                          className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-black dark:bg-white text-white dark:text-black rounded text-[7px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          FLEX
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Karta Philosophy */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 md:p-8 shadow-md">
          <div className="mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h3 className="text-base sm:text-lg font-black uppercase italic tracking-widest text-fuchsia-500 flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              The Philosophy
            </h3>
          </div>
          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            <p>
              <strong className="text-zinc-900 dark:text-white uppercase text-[10px] tracking-widest block mb-1">1. Culture is Predictable</strong>
              We believe that if you know how to read the room, you can foresee the outcome. Vybecheck is built to quantify that intuition. Don't just watch the culture shift—predict it.
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-white uppercase text-[10px] tracking-widest block mb-1">2. Virtual Money, Real Reputation</strong>
              To keep the platform accessible, fun, and globally compliant, we use <strong>virtual USDC</strong>. You can't deposit real money, and you can't buy your way to the top. Your most valuable asset here is your <strong className="text-fuchsia-500">Season XP</strong>.
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-white uppercase text-[10px] tracking-widest block mb-1">3. The Top 3 Take It All</strong>
              Every winning trade earns you XP. At the end of the season, the top 3 players on the leaderboard are rewarded with real-world airdrops directly to their payout wallets. Play smart, trade well, and prove you have the best vybe.
            </p>
          </div>
        </div>

      </div>

      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-black italic uppercase mb-1">Profile Picture</h2>
              <p className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Update your vybe</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="p-4 border border-zinc-200 dark:border-white/10 rounded-xl bg-zinc-50 dark:bg-white/5 text-center relative hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="pointer-events-none flex flex-col items-center justify-center gap-2 text-zinc-500">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Upload from Device</span>
                </div>
              </div>
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
                <span className="mx-3 text-zinc-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">OR USE URL</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
              </div>
              
              <input 
                type="text" 
                value={avatarInputUrl} 
                onChange={(e) => {
                  setAvatarInputUrl(e.target.value);
                  setCroppedImageBlob(null); 
                  setImageSrc(null);
                }} 
                placeholder="https://.../image.png" 
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] sm:text-xs font-mono outline-none focus:border-fuchsia-500 text-zinc-900 dark:text-white" 
              />
              
              {croppedImageBlob && <p className="text-[10px] sm:text-xs text-green-500 font-bold text-center uppercase tracking-widest">✓ Ready to save</p>}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button onClick={saveAvatar} disabled={savingAvatar} className="w-full py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50">{savingAvatar ? 'Saving...' : 'Save Picture'}</button>
              <button onClick={() => setIsAvatarModalOpen(false)} className="w-full py-3 rounded-xl bg-transparent text-zinc-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:text-zinc-900 dark:hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}