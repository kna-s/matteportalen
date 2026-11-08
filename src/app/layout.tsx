import type { Metadata } from "next";
import { Lexend, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import DemoBar from "@/components/DemoBar";
import { StoreProvider } from "@/lib/store";

// Lexend är framtagen för att vara lättläst, vilket passar elever med lässvårigheter.
const body = Lexend({ variable: "--font-body", subsets: ["latin"] });
const heading = Source_Serif_4({ variable: "--font-heading", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "Matteportalen – matte för åk 4–6",
  description: "Läxhjälp i matematik för mellanstadiet: videolektioner, övningar, quiz och screening enligt Skolverkets kursplan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" className={`${body.variable} ${heading.variable}`}>
      <body className="font-sans antialiased">
        <StoreProvider>
          <Header />
          <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-line bg-navy text-sm text-white/80">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:justify-between">
              <span>© {new Date().getFullYear()} Matteportalen (arbetsnamn)</span>
              <span>Följer Skolverkets centrala innehåll för matematik åk 4–6</span>
            </div>
          </footer>
          <DemoBar />
        </StoreProvider>
      </body>
    </html>
  );
}
