"use client"; // Nutné pro Next.js App Router, pokud používáme useState a Context

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Vytvoříme prázdný Context
const AppContext = createContext<any>(null);

// Toto je Provider, kterým obaluješ aplikaci (např. v layout.tsx)
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // --- TVOJE DOSAVADNÍ STAVY (případně si sem doplň další, které jsi tu měl, např. myBets) ---
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]); // Sem se ukládají sázky uživatele
  
  // Ukázkový přihlášený uživatel (uprav podle sebe)
  const [currentUser, setCurrentUser] = useState({
    name: "PlayerOne",
    avatar: "" 
  });

  // --- LOGIKA CHATU ---
  // Funkce pro odeslání zprávy (podporuje odpovědi přes parentId)
  const sendChatMessage = (marketId: number, text: string, user: string, avatar: string, parentId: string | null = null) => {
    const newMessage = {
      // Vygenerování bezpečného ID
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      marketId,
      parentId, 
      text,
      user,
      avatar,
      timestamp: new Date().toISOString(),
      likedBy: [] // Pole pro uživatele, kteří dali like
    };

    setChatMessages((prev: any) => [...prev, newMessage]);
  };

  // Funkce pro přidání/odebrání lajku
  const toggleLikeMessage = (messageId: string, userName: string) => {
    setChatMessages((prev: any) => prev.map((msg: any) => {
      if (msg.id === messageId) {
        const hasLiked = msg.likedBy.includes(userName);
        return {
          ...msg,
          // Pokud uživatel už dal like, odebereme ho, jinak ho přidáme
          likedBy: hasLiked 
            ? msg.likedBy.filter((u: string) => u !== userName) 
            : [...msg.likedBy, userName]
        };
      }
      return msg;
    }));
  };

  // --- EXPORT VŠECH DAT A FUNKCÍ DO APLIKACE ---
  return (
    <AppContext.Provider value={{
      chatMessages,
      sendChatMessage,
      toggleLikeMessage,
      myBets,
      setMyBets,
      currentUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Vlastní hook pro snadné používání kdekoli v aplikaci
export const useAppContext = () => {
  return useContext(AppContext);
};