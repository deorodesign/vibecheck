import "./globals.css";
import { AppProvider } from "./context";
import Navbar from "./Navbar"; // Importuj náš nový Navbar

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased">
        <AppProvider>
          <Navbar /> {/* Přidej ho sem NAD children */}
          {children}
        </AppProvider>
      </body>
    </html>
  );
}