'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'CryptoBro', text: 'Taylor is definitely a VYBE today.', color: 'text-fuchsia-500' },
    { id: 2, user: 'Satoshi99', text: 'Jake Paul stands no chance tbh 💀', color: 'text-orange-500' }
  ]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    // Přidá tvou zprávu do chatu
    setMessages([...messages, { id: Date.now(), user: 'You', text: inputValue, color: 'text-green-500' }]);
    setInputValue('');
  };

  return (
    <>
      {/* Vyskakovací okno chatu */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[100] w-[calc(100vw-2rem)] sm:w-[350px] h-[450px] max-h-[70vh] bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Hlavička */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
            <h3 className="font-black italic uppercase text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              Live Chat
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Zprávy */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className={`font-bold ${msg.color}`}>{msg.user}: </span>
                <span className="text-zinc-700 dark:text-zinc-300">{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Políčko pro psaní */}
          <form onSubmit={sendMessage} className="p-3 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Say something..." 
              className="flex-1 bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-fuchsia-500 text-zinc-900 dark:text-white"
            />
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:opacity-90 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
              Send
            </button>
          </form>
        </div>
      )}

      {/* Plovoucí tlačítko vpravo dole */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[100] w-14 h-14 bg-gradient-to-r from-fuchsia-500 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.5)] hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>
    </>
  );
}