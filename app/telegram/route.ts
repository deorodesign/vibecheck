import { NextResponse } from 'next/server';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    // Pokud to není textová zpráva, ignorujeme
    if (!message || !message.text) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = message.chat.id;
    const text = message.text.trim().toLowerCase();

    // Reakce na příkaz /start
    if (text === '/start') {
      await sendMessage(
        chatId, 
        "Welcome to the trenches. 🔮\n\nI am the Vybecheck Agent. I track internet chaos and print receipts.\n\nType /vybe to see what we are trading today."
      );
    } 
    // Reakce na příkaz /vybe
    else if (text === '/vybe') {
      await sendMessage(
        chatId, 
        "The timeline is glitching. We are trading the chaos right now. 💸\n\nCheck the active markets, fade the rumor, and secure the bag: https://vybecheck.xyz"
      );
    }
    // Tajný příkaz pro tebe
    else if (text === '/gm') {
      await sendMessage(chatId, "gm degen ☕️ Ready to farm some XP?");
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Telegram Bot Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

// Pomocná funkce pro odeslání zprávy zpět na Telegram
async function sendMessage(chatId: string | number, text: string) {
  if (!TELEGRAM_TOKEN) return;
  
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      chat_id: chatId, 
      text: text,
      disable_web_page_preview: true 
    }),
  });
}