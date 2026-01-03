"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, PartyPopper, Loader2 } from "lucide-react";
import Link from "next/link";

// Composant interne pour utiliser useSearchParams en toute sécurité avec le Suspense de Next.js
function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Petit délai pour simuler la vérification du webhook
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full space-y-12 text-center animate-in fade-in duration-700">
      {/* ICONE DE SUCCÈS */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 shadow-sm">
            <Check className="h-10 w-10 text-black" strokeWidth={3} />
          </div>
          <div className="absolute -top-2 -right-2">
            <PartyPopper className="h-8 w-8 text-zinc-300 animate-bounce" />
          </div>
        </div>
      </div>

      {/* TEXTE DE CONFIRMATION */}
      <div className="space-y-4">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight leading-tight">
          Bienvenue à bord !
        </h1>
        <p className="text-lg text-zinc-500 max-w-md mx-auto leading-relaxed">
          Votre abonnement a été validé avec succès. Vous avez désormais accès à tous les outils pour diffuser vos annonces.
        </p>
      </div>

      {/* RÉCAPITULATIF RAPIDE */}
      <div className="bg-zinc-50 rounded-[24px] p-8 border border-zinc-100 max-w-sm mx-auto">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Statut du paiement</span>
            <span className="font-semibold text-green-600 flex items-center gap-1">
              Confirmé <Check size={14} />
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Référence</span>
            <span className="font-mono text-[10px] text-zinc-400">
              {sessionId ? sessionId.slice(0, 15) + "..." : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="pt-4 space-y-4">
        <Button 
          asChild
          className="w-full md:w-auto min-w-[280px] h-[56px] rounded-xl bg-[#222222] text-white text-base font-bold hover:bg-black transition-all active:scale-[0.98] shadow-lg"
        >
          <Link href="/dashboard">
            Accéder à mon tableau de bord <ArrowRight size={18} className="ml-2" />
          </Link>
        </Button>
        
        <p className="text-sm text-zinc-400">
          Une facture a été envoyée sur votre adresse email.
        </p>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-900 mb-4" />
          <p className="text-sm font-medium animate-pulse">Finalisation de votre profil...</p>
        </div>
      )}
    </div>
  );
}

// Page exportée avec Suspense (obligatoire pour useSearchParams chez Vercel)
export default function OnboardingSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto min-h-screen flex flex-col items-center justify-center px-6 text-[#222222] bg-white">
      <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}