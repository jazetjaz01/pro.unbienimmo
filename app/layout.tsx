import type { Metadata } from "next";
import { Outfit, Sarina } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ListingProvider } from '@/context/ListingContext';
import { Toaster } from "sonner"; // Import du toaster pour tes notifications

const outfitSans = Outfit({
  variable: "--font-outfit-sans",
  display: "swap",
  subsets: ["latin"],
});

const sarina = Sarina({
  variable: "--font-sarina",
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pro.unbienimmo.com",
  description: "Gérez votre activité sur unbienimmo.com, diffusion d'annonces géolocalisées",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`
          ${outfitSans.variable} 
          ${sarina.variable} 
          ${outfitSans.className} 
          antialiased
        `}
      >
        {/* Le Provider englobe tout le contenu dynamique */}
        <ListingProvider>
          <Navbar />
          {children}
          <Toaster richColors position="top-right" />
        </ListingProvider>
      </body>
    </html>
  );
}