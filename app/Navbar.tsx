'use client';

import React from 'react';
import Link from 'next/link';
import { useAppContext } from './context';

export default function Navbar() {
  const {
    isLoggedIn,
    isAuthLoading,
    balance,
    nickname,
    handleLogout,
    setIsLoginModalOpen
  } = useAppContext();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <Link href="/">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter cursor-default hover:scale-105 transition-transform origin-left">
              Vybecheck
            </h1>
          </Link>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mt-0.5 ml-0.5 hidden sm:block">
            Predict the culture
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthLoading ? (
            <div className="h-10 w-24 bg-white/5 rounded-2xl animate-pulse"></div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bankroll</span>
                <span className="text-sm font-black text-green-400">
                  {balance ? balance.toFixed(2) : '0.00'} <span className="text-[10px] text-zinc-500">USDC</span>
                </span>
              </div>
              
              <Link href="/profile">
                <div className="h-10 px-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 hover:border-fuchsia-500/30 transition-all cursor-pointer group">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-fuchsia-500 to-orange-500 flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform">
                    {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest hidden sm:block truncate max-w-[100px]">
                    {nickname || 'User'}
                  </span>
                </div>
              </Link>

              <button onClick={handleLogout} className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)} 
              className="h-10 px-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}