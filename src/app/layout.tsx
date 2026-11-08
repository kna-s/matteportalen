import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { Lexend, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { StoreProvider } from "@/lib/store";

// Lexend är framtagen för att vara lättläst, vilket passar elever med lässvårigheter.
const body = Lexend({ variable: "--font-body", subsets: ["latin"] });
const heading = Source_Serif_4({ variable: "--font-heading", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: `${BRAND.name} – ${BRAND.short}`,
  description: "Läxhjälp i matematik för mellanstadiet: videolektioner, övningar, quiz och screening enligt Skolverkets kursplan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" className={`${body.variable} ${heading.variable}`}>
      <body className="font-sans antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
