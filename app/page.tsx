"use client";

import React, { useState } from 'react';
import { useAppContext } from './context'; // Importujeme náš Context!

export default function Page() {
  // 1. VYTÁHNUTÍ DAT Z CONTEXTU
  const { chatMessages, sendChatMessage, toggleLikeMessage, myBets, currentUser } = useAppContext();

  // 2. STAVY PRO CHAT
  const [replyingTo, setReplyingTo] = useState<{ id: string, user: string } | null>(null);

  // ZDE SI DOSAĎ SVŮJ AKTUÁLNÍ TRH (pokud ho máš jinde, toto jen simuluje otevřenou kartu)
  const currentMarket = { id: 1, title: "Příklad trhu" }; 

  // 3. POMOCNÉ FUNKCE PRO CHAT (Čas a Status)
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  const getUserBetStatus = (userName: string, marketId: number) => {
    if (userName !== currentUser?.name) return null; 
    const userBetsOnThisMarket = myBets?.filter((bet: any) => bet.marketId === marketId) || [];
    
    const hasVybe = userBetsOnThisMarket.some((b: any) => b.type === 'VYBE');
    const hasNoVybe = userBetsOnThisMarket.some((b: any) => b.type === 'NO_VYBE');
    
    if (hasVybe && hasNoVybe) return 'HEDGED';
    if (hasVybe) return 'VYBE';
    if (hasNoVybe) return 'NO_VYBE';
    return null;
  };

  // 4. FILTROVÁNÍ ZPRÁV
  const marketMessages = chatMessages?.filter((msg: any) => msg.marketId === currentMarket.id) || [];
  const mainMessages = marketMessages.filter((msg: any) => !msg.parentId);

  // 5. SAMOTNÉ VYKRESLENÍ STRÁNKY (Tady začíná to HTML)
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
      
      {/* Tady máš asi svůj zbytek stránky (hlavička, grafy, sázení) */}
      <div className="p-5 border-b border-zinc-200 dark:border-white/10">
        <h1 className="text-xl font-bold">Karta: {currentMarket.title}</h1>
        <p className="text-sm text-zinc-500">Tady je tvoje karta, sázení atd...</p>
      </div>

      {/* --- ZAČÁTEK CHATU --- */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 text-xs hide-scrollbar">
        {mainMessages.length === 0 && (
          <div className="text-center text-zinc-400 dark:text-zinc-600 my-auto italic">
            Be the first to share your thoughts!
          </div>
        )}

        {mainMessages.map((msg: any) => {
          const userBadge = getUserBetStatus(msg.user, currentMarket.id);
          const replies = marketMessages.filter((r: any) => r.parentId === msg.id);
          const isLikedByMe = msg.likedBy?.includes(currentUser?.name);

          return (
            <div key={msg.id} className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* HLAVNÍ ZPRÁVA */}
              <div className="flex items-start gap-2">
                {msg.avatar ? (
                  <img src={msg.avatar} alt={msg.user} className="w-6 h-6 rounded-full object-cover mt-1 flex-shrink-0 shadow-sm" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 mt-1 flex-shrink-0 opacity-80 shadow-sm" />
                )}
                
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-black uppercase tracking-widest text-[10px] ${msg.color || 'text-fuchsia-500'}`}>{msg.user}</span>
                    <span className="text-[9px] text-zinc-400 font-medium">{timeAgo(msg.timestamp)}</span>
                    
                    {userBadge === 'VYBE' && (
                      <span className="px-1.5 py-[1px] rounded bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest italic">Vybe</span>
                    )}
                    {userBadge === 'NO_VYBE' && (
                      <span className="px-1.5 py-[1px] rounded bg-red-500/10 border border-red-500/20 text-[8px] font-black text-red-500 uppercase tracking-widest italic">No Vybe</span>
                    )}
                    {userBadge === 'HEDGED' && (
                      <span className="px-1.5 py-[1px] rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-black text-purple-500 uppercase tracking-widest italic">Hedged</span>
                    )}
                  </div>
                  
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed bg-zinc-100 dark:bg-white/5 p-3 rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-white/10 inline-block w-fit max-w-[95%]">
                    {msg.text}
                  </span>

                  {/* AKCE: LIKE A REPLY */}
                  <div className="flex items-center gap-4 mt-0.5 ml-1">
                    <button 
                      onClick={() => toggleLikeMessage(msg.id, currentUser.name)}
                      className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${isLikedByMe ? 'text-fuchsia-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                    >
                      ♥ {msg.likedBy?.length > 0 && msg.likedBy.length}
                    </button>
                    <button 
                      onClick={() => setReplyingTo({ id: msg.id, user: msg.user })}
                      className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* ODPOVĚDI */}
              {replies.length > 0 && (
                <div className="flex flex-col gap-3 ml-8 pl-3 border-l-2 border-zinc-100 dark:border-white/5 mt-1">
                  {replies.map((reply: any) => {
                    const replyBadge = getUserBetStatus(reply.user, currentMarket.id);
                    const isReplyLikedByMe = reply.likedBy?.includes(currentUser?.name);

                    return (
                      <div key={reply.id} className="flex items-start gap-2">
                        {reply.avatar ? (
                          <img src={reply.avatar} alt={reply.user} className="w-5 h-5 rounded-full object-cover mt-0.5 flex-shrink-0 shadow-sm" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 mt-0.5 flex-shrink-0 opacity-80 shadow-sm" />
                        )}
                        <div className="flex flex-col gap-0.5 w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black uppercase tracking-widest text-[9px] text-zinc-600 dark:text-zinc-400">{reply.user}</span>
                            <span className="text-[8px] text-zinc-400 font-medium">{timeAgo(reply.timestamp)}</span>
                            
                            {replyBadge === 'VYBE' && <span className="text-[7px] font-black text-green-500 uppercase tracking-widest italic">Vybe</span>}
                            {replyBadge === 'NO_VYBE' && <span className="text-[7px] font-black text-red-500 uppercase tracking-widest italic">No Vybe</span>}
                            {replyBadge === 'HEDGED' && <span className="text-[7px] font-black text-purple-500 uppercase tracking-widest italic">Hedged</span>}
                          </div>
                          <span className="text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed bg-zinc-50 dark:bg-white-[0.02] p-2 rounded-xl rounded-tl-sm border border-zinc-100 dark:border-white/5 inline-block w-fit max-w-[100%] text-[11px]">
                            {reply.text}
                          </span>
                          
                          <button 
                            onClick={() => toggleLikeMessage(reply.id, currentUser.name)}
                            className={`text-[9px] font-bold flex items-center gap-1 mt-0.5 ml-1 transition-colors ${isReplyLikedByMe ? 'text-fuchsia-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
                          >
                            ♥ {reply.likedBy?.length > 0 && reply.likedBy.length}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* INPUT PRO PSANÍ ZPRÁVY */}
      <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
        {replyingTo && (
          <div className="flex items-center justify-between bg-zinc-100 dark:bg-white/10 px-3 py-1.5 rounded-t-lg border-x border-t border-zinc-200 dark:border-white/10 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-[-1px]">
            <span>Replying to <span className="font-bold text-fuchsia-500">@{replyingTo.user}</span></span>
            <button onClick={() => setReplyingTo(null)} className="hover:text-red-500 font-bold px-1">✕</button>
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('chatInput') as HTMLInputElement;
            if (input.value.trim()) {
              sendChatMessage(currentMarket.id, input.value, currentUser.name, currentUser.avatar, replyingTo ? replyingTo.id : null);
              input.value = '';
              setReplyingTo(null); 
            }
          }} 
          className="flex gap-2"
        >
          <input 
            name="chatInput"
            type="text" 
            placeholder={replyingTo ? "Write a reply..." : "Share your vybe..."}
            className={`flex-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 outline-none px-4 py-2.5 text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-fuchsia-500/50 transition-all shadow-inner ${replyingTo ? 'rounded-b-xl rounded-tr-xl' : 'rounded-xl'}`}
          />
          <button type="submit" className="bg-gradient-to-tr from-fuchsia-500 to-orange-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/40 hover:-translate-y-0.5 transition-all">
            Send
          </button>
        </form>
      </div>
      {/* --- KONEC CHATU --- */}

    </div>
  );
}