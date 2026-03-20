'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Vybecheck?",
      answer: "Vybecheck is a cultural prediction market. Instead of trading boring stocks, you trade on the outcomes of pop culture, gaming, and internet events. You use virtual USDC to buy 'VYBE' (Yes) or 'NO VYBE' (No) shares."
    },
    {
      question: "Am I betting real money?",
      answer: "No. All trades on Vybecheck use virtual USDC (play money) to keep the platform fun, legal, and accessible globally. You cannot deposit real money."
    },
    {
      question: "How do I win real money (Airdrops)?",
      answer: "By being right! Winning trades earn you Season XP. At the end of every 14 days (Season), the top 3 players on the Leaderboard share a real USDC airdrop pool sent directly to their crypto wallets."
    },
    {
      question: "How do I earn Season XP?",
      answer: "You get +1 XP for every 1 virtual USDC you trade (just for participating). If your prediction is correct, you also get +10 XP for every 1 USDC of net profit you make. The smarter you trade, the faster you climb."
    },
    {
      question: "I ran out of virtual USDC. Now what?",
      answer: "Don't worry! If your bankroll drops below 20 USDC, a 'Claim Relief Fund' button will appear in your profile to give you a free +50 USDC boost. You can also get +50 USDC daily by sharing a market on social media!"
    },
    {
      question: "Which crypto wallet address should I use for payouts?",
      answer: "You can use any EVM-compatible wallet (like MetaMask, Trust Wallet, Coinbase Wallet) or a Solana wallet (like Phantom). Just go to your Profile and paste your main receiving address (e.g., your 0x... address from MetaMask)."
    },
    {
      question: "MetaMask doesn't show a specific 'USDC address'. What do I do?",
      answer: "That is completely normal! On networks like Ethereum, Base, or Arbitrum, your address (starting with 0x...) is exactly the same for all tokens. Just copy your main wallet address and save it in your Profile. When we send you the USDC prize, it will safely arrive at that exact address."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0e0e12] text-zinc-900 dark:text-white font-sans p-4 md:p-10 transition-colors duration-500">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="w-full flex items-center justify-between mb-8 md:mb-12">
          <Link href="/" className="flex items-center gap-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </div>
            <span className="font-black text-xs uppercase tracking-widest hidden sm:inline">Back to Markets</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500 uppercase tracking-tighter cursor-default italic">
            Vybecheck FAQ
          </h1>
        </header>

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">Got Questions?</h2>
          <p className="text-zinc-500 font-medium max-w-xl mx-auto text-sm md:text-base">Everything you need to know about trading culture, leveling up your XP, and claiming your real-world airdrops.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white dark:bg-[#18181b] border ${openIndex === index ? 'border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.1)]' : 'border-zinc-200 dark:border-white/5'} rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <button 
                onClick={() => toggleFaq(index)} 
                className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
              >
                <span className={`font-black text-sm md:text-base uppercase tracking-widest ${openIndex === index ? 'text-fuchsia-500' : 'text-zinc-900 dark:text-white'}`}>
                  {faq.question}
                </span>
                <div className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${openIndex === index ? 'bg-fuchsia-500/10 text-fuchsia-500 rotate-180' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-5 md:p-6 pt-0 text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium border-t border-zinc-100 dark:border-white/5 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-gradient-to-br from-fuchsia-500/10 to-orange-500/10 border border-fuchsia-500/20 rounded-[2rem] text-center">
          <h3 className="text-xl font-black uppercase italic text-zinc-900 dark:text-white mb-2">Still confused?</h3>
          <p className="text-zinc-500 text-sm mb-6">Drop a message in the Live Chat on any market. The Vybecheck community is always helping out.</p>
          <Link href="/" className="inline-block bg-zinc-900 text-white dark:bg-white dark:text-black font-black px-8 py-4 rounded-xl uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-transform shadow-lg">
            Start Trading Now
          </Link>
        </div>

      </div>
    </div>
  );
}