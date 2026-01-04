import type { Metadata } from "next";
import { Ubuntu } from "next/font/google"; // Changement d'importation
import "./globals.css";
import Navbar from "@/components/navbar";

// Configuration de la police Ubuntu
const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"], // Les graisses courantes
  variable: "--font-ubuntu",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Un Bien Immo - Pro",
  description: "Plateforme immobilière professionnelle",
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
          ${ubuntu.variable} 
          ${ubuntu.className} 
          antialiased
        `}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}