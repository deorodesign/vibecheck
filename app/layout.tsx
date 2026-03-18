import "./globals.css";
import { AppProvider } from "./context";

export const metadata = {
  title: "Vybecheck",
  description: "Predict the culture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased">
        <AppProvider>
          {/* Zde nesmí být žádný jiný Modal ani Header, vše obstará page.tsx */}
          {children}
        </AppProvider>
      </body>
    </html>
  );
}