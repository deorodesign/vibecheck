'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';

// GAMIFIKACE: Systém hodností podle prosázeného objemu (přesunuto sem)
const getUserRank = (volume: number) => {
  if (volume >= 10000) return { title: 'WHALE', color: 'text-purple-500', icon: '🐋' };
  if (volume >= 1000) return { title: 'DEGEN', color: 'text-orange-500', icon: '🦍' };
  if (volume >= 100) return { title: 'SHARK', color: 'text-blue-500', icon: '🦈' };
  if (volume >= 10) return { title: 'TRADER', color: 'text-green-500', icon: '📈' };
  return { title: 'NEWBIE', color: 'text-zinc-500', icon: '🐣' };
};

// Sub-komponenta pro jednu zprávu
const ChatMessage = ({ msg, onReply, isReply = false }: { msg: any, onReply: (msg: any) => void, isReply?: boolean }) => {
  const { walletAddress, toggleLike } = useAppContext();
  const [userVolume, setUserVolume] = useState(0);

  // Zjištění prosázeného objemu pro výpočet hodnosti
  useEffect(() => {
    const fetchUserVolume = async () => {
      // V msg.user máme uloženou adresu/email uživatele
      const { data } = await supabase.from('bets').select('amount').eq('user_address', msg.user);
      if (data) {
        // Zde sčítáme vsazenou částku
        const total = data.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
        setUserVolume(total);
      }
    };
    if (msg.user) fetchUserVolume();
  }, [msg.user]);

  const rank = getUserRank(userVolume);
  const isLiked = msg.likes?.includes(walletAddress);
  
  // Zkrácení jména
  const decodedName = decodeURIComponent(msg.user || '');
  const displayName = decodedName.includes('@') 
    ? decodedName.split('@')[0] 
    : `${decodedName.substring(0, 6)}...${decodedName.substring(decodedName.length - 4)}`;

  return (
    <div className={`group flex gap-3 ${isReply ? 'ml-10 mt-2 border-l-2 border-zinc-800 pl-4' : 'mt-6'}`}>
      <Link href={`/user/${encodeURIComponent(msg.user)}`} className="shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black bg-zinc-900 border border-zinc-800 hover:border-zinc-500 transition-colors ${rank.color}`}>
          {displayName.charAt(0).toUpperCase()}
        </div>
      </Link>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/user/${encodeURIComponent(msg.user)}`} className="font-bold text-sm hover:underline text-white">
            {displayName}
          </Link>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 ${rank.color}`}>
            {rank.icon} {rank.title}
          </span>
          {msg.betType && (
            <span className={`text-[9px] font-black uppercase tracking-widest ${msg.betType === 'VYBE' ? 'text-green-500' : 'text-red-500'}`}>
              BETS: {msg.betType}
            </span>
          )}
        </div>
        
        <p className="text-sm text-zinc-300 mb-2">{msg.text}</p>
        
        <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => toggleLike(msg.id)}
            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${isLiked ? 'text-fuchsia-500' : 'text-zinc-500 hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {msg.likes?.length || 0}
          </button>
          
          <button 
            onClick={() => onReply(msg)}
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white font-bold uppercase tracking-widest transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Chat({ marketId }: { marketId: number }) {
  const { chatMessages, sendChatMessage, walletAddress, nickname, isLoggedIn } = useAppContext();
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);

  // Filtrujeme zprávy pouze pro tento trh
  const marketMessages = chatMessages.filter((m: any) => m.marketId === marketId);
  
  // Rozdělíme na hlavní zprávy a odpovědi
  const topLevelMessages = marketMessages.filter((m: any) => !m.parentId);
  const replies = marketMessages.filter((m: any) => m.parentId);

  const handleSend = () => {
    if (!inputText.trim() || !isLoggedIn) return;
    
    // Odešle zprávu, pokud je replyingTo nastaveno, přidá to jeho ID jako parentId
    sendChatMessage(marketId, inputText, nickname || walletAddress, '', replyingTo ? replyingTo.id : null);
    setInputText('');
    setReplyingTo(null);
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl">
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="text-lg font-black uppercase tracking-widest text-white">Market Chat</h3>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
          {marketMessages.length} Messages
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {topLevelMessages.length === 0 ? (
          <p className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-10">
            Be the first to share your vybe!
          </p>
        ) : (
          topLevelMessages.map((msg: any) => (
            <div key={msg.id}>
              {/* Hlavní zpráva */}
              <ChatMessage msg={msg} onReply={setReplyingTo} />
              
              {/* Její odpovědi (vlákno) */}
              {replies
                .filter((r: any) => r.parentId === msg.id)
                .map((reply: any) => (
                  <ChatMessage key={reply.id} msg={reply} onReply={setReplyingTo} isReply={true} />
                ))}
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        {replyingTo && (
          <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl mb-3 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Replying to <span className="text-white">{(replyingTo.user || '').split('@')[0]}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!isLoggedIn}
            placeholder={isLoggedIn ? "Type your message..." : "Connect wallet to chat"}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!isLoggedIn || !inputText.trim()}
            className="bg-gradient-to-r from-fuchsia-600 to-orange-600 text-white font-black px-6 py-3 rounded-xl uppercase tracking-widest disabled:opacity-50 hover:scale-105 transition-transform"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}