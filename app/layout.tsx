import "./globals.css";
import { AppProvider } from "./context";
import ChatWidget from "./ChatWidget";

export const metadata = {
  title: "Vybecheck",
  description: "Predict the culture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-50 dark:bg-[#0e0e12] text-zinc-900 dark:text-white antialiased transition-colors duration-500 relative">
        <AppProvider>
          {children}
          {/* Tady se zobrazí ten plovoucí chat na každé stránce */}
          <ChatWidget />
        </AppProvider>
      </body>
    </html>
  );
}