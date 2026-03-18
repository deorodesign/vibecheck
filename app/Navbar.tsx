'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from './context';

export default function Navbar() {
  const { isLoggedIn, balance, nickname, avatarUrl, handleLogout, setIsLoginModalOpen, toggleDarkMode, isDarkMode, isAuthLoading } = useAppContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col items-center px-4 md:px-8 pt-6 pb-4 bg-zinc-50/90 dark:bg-[#0e0e12]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 transition-colors duration-500">
      <div className="w-full max-w-7xl flex justify-between items-center mb-4">
        <Link href="/">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 cursor-pointer">Vybecheck</h1>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm text-xs font-bold uppercase">{isDarkMode ? "LGT" : "DRK"}</button>
          {isAuthLoading ? (
            <div className="w-24 h-10 rounded-full bg-zinc-200 dark:bg-white/5 animate-pulse"></div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 md:px-5 py-2.5 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-xs md:text-sm font-mono font-bold text-zinc-900 dark:text-white">{balance.toFixed(2)} <span className="text-zinc-500 hidden md:inline">USDC</span></span>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm hover:border-fuchsia-500 transition-all">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center font-black text-white text-[10px]">{nickname?.charAt(0).toUpperCase()}</div>}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Logged in as {nickname}</div>
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-zinc-900 dark:text-white">Profile Settings</Link>
                    <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Log Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="px-6 h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95">Log In</button>
          )}
        </div>
      </div>
    </header>
  );
}