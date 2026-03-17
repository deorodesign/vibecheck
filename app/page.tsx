"use client";

import React, { useState, useRef } from 'react';
import { useAppContext } from './context'; 

export default function Page() {
  const { chatMessages, sendChatMessage, toggleLikeMessage, myBets, currentUser } = useAppContext();

  // STAVY PRO CHAT
  const [replyingTo, setReplyingTo] = useState<{ id: string, user: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(10); // Polymarket styl: začínáme na 10

  // Reference pro tlačítko "Back to top"
  const chatTopRef = useRef<HTMLDivElement>(null);

  // ZDE SI DOSAĎ SVŮJ AKTUÁLNÍ TRH
  const currentMarket = { id: 1, title: "Tobby vs. Johny 2 revansh" }; 

  // POMOCNÉ FUNKCE
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

  // ZPRACOVÁNÍ ZPRÁV (Filtrování, Řazení a Oříznutí)
  const marketMessages = chatMessages?.filter((msg: any) => msg.marketId === currentMarket.id) || [];
  const mainMessages = marketMessages.filter((msg: any) => !msg.parentId);
  
  // OPRAVENO: přidáno : any k a i b
  const sortedMainMessages = [...mainMessages].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Vezmeme jen tolik zpráv, kolik aktuálně chceme vidět
  const visibleMessages = sortedMainMessages.slice(0, visibleCount);

  // Funkce pro plynulé odrolování nahoru
  const scrollToTop = () => {
    chatTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-screen bg-black dark:bg-[#0e0e10]">
      
      {/* Místo pro tvou hlavičku a kartu */}
      <div className="p-5 border-b border-white/5">
        <h1 className="text-xl font-bold text-white">Karta: {currentMarket.title}</h1>
      </div>

      {/* --- ZAČÁTEK CHATU --- */}
      <div className="flex flex-col bg-[#161618] rounded-2xl border border-white/5 overflow-hidden mt-4 mx-5 mb-10">

        {/* Kotva pro "Back to top" */}
        <div ref={chatTopRef} />

        <div className="p-4 border-b border-white/5">
          <h2 className="text-[11px] font-black italic uppercase tracking-widest text-white">Live Chat</h2>
        </div>

        {/* INPUT PRO PSANÍ ZPRÁVY */}
        <div className="p-3 border-b border-white/5 bg-[#1a1a1c]">
          {replyingTo && (
            <div className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-t-lg border-x border-t border-white/5 text-[9px] font-medium text-zinc-400 mb-[-1px]">
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
                // Pokud uživatel napíše zprávu, automaticky chceme odscrollovat nahoru
                scrollToTop();
              }
            }} 
            className="flex gap-2 relative"
          >
            <input 
              name="chatInput"
              type="text" 
              placeholder={replyingTo ? "Write a reply..." : "Type a message..."}
              className={`flex-1 bg-transparent border border-white/10 outline-none px-4 py-2.5 text-[11px] font-medium text-white placeholder:text-zinc-600 focus:border-white/20 transition-all shadow-inner ${replyingTo ? 'rounded-b-lg rounded-tr-lg' : 'rounded-lg'}`}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>

        {/* VÝPIS ZPRÁV */}
        <div className="flex flex-col gap-4 p-4">
          {sortedMainMessages.length === 0 && (
            <div className="text-center text-zinc-500 my-4 italic text-[11px]">
              Be the first to share your thoughts!
            </div>
          )}

          {visibleMessages.map((msg: any) => {
            const userBadge = getUserBetStatus(msg.user, currentMarket.id);
            
            // OPRAVENO: přidáno : any k a i b
            const replies = marketMessages
              .filter((r: any) => r.parentId === msg.id)
              .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
            const isLikedByMe = msg.likedBy?.includes(currentUser?.name);

            return (
              <div key={msg.id} className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                
                {/* HLAVNÍ ZPRÁVA */}
                <div className="flex items-start gap-2">
                  {msg.avatar ? (
                    <img src={msg.avatar} alt={msg.user} className="w-5 h-5 rounded-full object-cover mt-0.5 flex-shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 mt-0.5 flex-shrink-0 opacity-80 shadow-sm" />
                  )}
                  
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`font-black uppercase tracking-widest text-[9px] ${msg.color || 'text-fuchsia-500'}`}>{msg.user}</span>
                      <span className="text-[8px] text-zinc-500 font-medium">{timeAgo(msg.timestamp)}</span>
                      
                      {userBadge === 'VYBE' && <span className="px-1.5 py-[1px] rounded bg-green-500/10 border border-green-500/20 text-[7px] font-black text-green-500 uppercase tracking-widest italic">Vybe</span>}
                      {userBadge === 'NO_VYBE' && <span className="px-1.5 py-[1px] rounded bg-red-500/10 border border-red-500/20 text-[7px] font-black text-red-500 uppercase tracking-widest italic">No Vybe</span>}
                      {userBadge === 'HEDGED' && <span className="px-1.5 py-[1px] rounded bg-purple-500/10 border border-purple-500/20 text-[7px] font-black text-purple-500 uppercase tracking-widest italic">Hedged</span>}
                    </div>
                    
                    <span className="text-zinc-300 font-medium leading-relaxed bg-white/5 px-3 py-2 rounded-xl rounded-tl-sm border border-white/5 inline-block w-fit max-w-[95%] text-[11px]">
                      {msg.text}
                    </span>

                    <div className="flex items-center gap-3 mt-0.5 ml-1">
                      <button 
                        onClick={() => toggleLikeMessage(msg.id, currentUser.name)}
                        className={`text-[9px] font-bold flex items-center gap-1 transition-colors ${isLikedByMe ? 'text-fuchsia-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        ♥ {msg.likedBy?.length > 0 && msg.likedBy.length}
                      </button>
                      <button 
                        onClick={() => setReplyingTo({ id: msg.id, user: msg.user })}
                        className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* ODPOVĚDI */}
                {replies.length > 0 && (
                  <div className="flex flex-col gap-2 ml-7 pl-2.5 border-l border-white/10 mt-1">
                    {replies.map((reply: any) => {
                      const replyBadge = getUserBetStatus(reply.user, currentMarket.id);
                      const isReplyLikedByMe = reply.likedBy?.includes(currentUser?.name);

                      return (
                        <div key={reply.id} className="flex items-start gap-1.5 animate-in fade-in duration-300">
                          {reply.avatar ? (
                            <img src={reply.avatar} alt={reply.user} className="w-4 h-4 rounded-full object-cover mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 mt-0.5 flex-shrink-0 opacity-80" />
                          )}
                          <div className="flex flex-col gap-0.5 w-full">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black uppercase tracking-widest text-[8px] text-zinc-400">{reply.user}</span>
                              <span className="text-[7px] text-zinc-500 font-medium">{timeAgo(reply.timestamp)}</span>
                              
                              {replyBadge === 'VYBE' && <span className="text-[7px] font-black text-green-500 uppercase tracking-widest italic">Vybe</span>}
                              {replyBadge === 'NO_VYBE' && <span className="text-[7px] font-black text-red-500 uppercase tracking-widest italic">No Vybe</span>}
                              {replyBadge === 'HEDGED' && <span className="text-[7px] font-black text-purple-500 uppercase tracking-widest italic">Hedged</span>}
                            </div>
                            <span className="text-zinc-300 font-medium leading-relaxed bg-white/[0.02] px-2.5 py-1.5 rounded-xl rounded-tl-sm border border-white/5 inline-block w-fit max-w-[100%] text-[10px]">
                              {reply.text}
                            </span>
                            
                            <button 
                              onClick={() => toggleLikeMessage(reply.id, currentUser.name)}
                              className={`text-[9px] font-bold flex items-center gap-1 mt-0.5 ml-1 transition-colors ${isReplyLikedByMe ? 'text-fuchsia-500' : 'text-zinc-500 hover:text-zinc-300'}`}
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

        {/* TLAČÍTKA SHOW MORE & BACK TO TOP */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#1a1a1c]">
          {sortedMainMessages.length > visibleCount ? (
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors border border-white/5"
            >
              Show more ({sortedMainMessages.length - visibleCount} left)
            </button>
          ) : (
            <span className="text-[10px] text-zinc-600 font-medium italic">End of conversation</span>
          )}

          {visibleCount >= 5 && sortedMainMessages.length > 0 && (
            <button 
              onClick={scrollToTop}
              className="text-[10px] text-zinc-500 hover:text-white font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              Back to top 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
            </button>
          )}
        </div>

      </div>
      {/* --- KONEC CHATU --- */}

    </div>
  );
}