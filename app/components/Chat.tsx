'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';

const getUserRank = (volume: number) => {
  if (volume >= 10000) return { title: 'WHALE', color: 'text-purple-500', icon: ' 🐋 ' };
  if (volume >= 1000) return { title: 'DEGEN', color: 'text-orange-500', icon: ' 🦍 ' };
  if (volume >= 100) return { title: 'SHARK', color: 'text-blue-500', icon: ' 🦈 ' };
  if (volume >= 10) return { title: 'TRADER', color: 'text-green-500', icon: ' 📈 ' };
  return { title: 'NEWBIE', color: 'text-zinc-500', icon: ' 🐣 ' };
};

const ChatMessage = ({ msg, onReply, isReply = false }: { msg: any, onReply: (msg: any) => void, isReply?: boolean }) => {
  const { nickname, toggleLikeMessage } = useAppContext();
  const [userVolume, setUserVolume] = useState(0);

  useEffect(() => {
    const fetchUserVolume = async () => {
      const { data } = await supabase.from('bets').select('amount').eq('user_name', msg.user);
      if (data) {
        const total = data.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
        setUserVolume(total);
      }
    };
    if (msg.user) fetchUserVolume();
  }, [msg.user]);

  const rank = getUserRank(userVolume);
  const isLikedByMe = msg.likedBy?.includes(nickname);

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10 mt-2 border-l-2 border-zinc-800 pl-4' : 'mt-6'}`}>
      <Link href={`/user/${encodeURIComponent(msg.user)}`} className="shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black bg-zinc-900 border border-zinc-800 hover:border-zinc-500 transition-all ${rank.color}`}>
          {msg.user?.charAt(0).toUpperCase()}
        </div>
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/user/${encodeURIComponent(msg.user)}`} className="font-bold text-sm hover:underline text-white uppercase italic tracking-tighter">
            {msg.user}
          </Link>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 ${rank.color}`}>
            {rank.icon} {rank.title}
          </span>
        </div>
        <p className="text-sm text-zinc-300 mb-2 leading-relaxed">{msg.text}</p>
        <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => toggleLikeMessage(msg.id, nickname)} 
            className={`flex items-center gap-1 text-[10px] font-bold uppercase transition-colors ${isLikedByMe ? 'text-fuchsia-500' : 'text-zinc-500 hover:text-white'}`}
          >
            ♥ {msg.likedBy?.length || 0}
          </button>
          <button onClick={() => onReply(msg)} className="text-[10px] text-zinc-500 hover:text-white font-bold uppercase">Reply</button>
        </div>
      </div>
    </div>
  );
};

export default function Chat({ marketId }: { marketId: number }) {
  const { chatMessages, sendChatMessage, nickname, isLoggedIn, setIsLoginModalOpen } = useAppContext();
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const marketMessages = chatMessages.filter((m: any) => m.marketId === marketId);
  const topLevelMessages = marketMessages.filter((m: any) => !m.parentId).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSend = () => {
    if (!isLoggedIn) return setIsLoginModalOpen(true);
    if (!inputText.trim()) return;
    sendChatMessage(marketId, inputText, nickname, '', replyingTo ? replyingTo.id : null);
    setInputText('');
    setReplyingTo(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#18181b] rounded-[2rem] border border-zinc-200 dark:border-white/5 overflow-hidden shadow-xl">
      <div className="p-4 bg-zinc-50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/5">
        {replyingTo && (
          <div className="mb-2 flex justify-between items-center bg-fuchsia-500/10 p-2 rounded-lg border border-fuchsia-500/20">
            <span className="text-[10px] font-bold text-fuchsia-500 italic uppercase">Replying to {replyingTo.user}</span>
            <button onClick={() => setReplyingTo(null)} className="text-zinc-500">✕</button>
          </div>
        )}
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isLoggedIn ? "Share your vybe..." : "Log in to chat..."}
            className="flex-1 bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-fuchsia-500" 
          />
          <button onClick={handleSend} className="px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">Send</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide flex flex-col">
        {topLevelMessages.length === 0 ? <p className="text-center text-zinc-400 py-10 italic text-[11px]">Be the first to share your thoughts!</p> : 
          topLevelMessages.map((msg: any) => (
            <div key={msg.id}>
              <ChatMessage msg={msg} onReply={setReplyingTo} />
              {marketMessages.filter((r: any) => r.parentId === msg.id).map((reply: any) => (
                <ChatMessage key={reply.id} msg={reply} onReply={setReplyingTo} isReply={true} />
              ))}
            </div>
          ))
        }
      </div>
    </div>
  );
}