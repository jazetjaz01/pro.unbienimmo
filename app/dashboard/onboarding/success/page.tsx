"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2, ReceiptText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  // Sécurité : On s'assure que sessionId est traité comme une string
  const sessionId = searchParams.get("session_id") || "";

  useEffect(() => {
    // Animation Confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#222222', '#00ff00']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#222222', '#00ff00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-6 mb-12">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
            <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
            C'est confirmé !
          </h1>
          <p className="text-[18px] text-[#717171] leading-relaxed">
            Votre abonnement est actif. Bienvenue dans la communauté pro.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden mb-10">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3 text-sm font-semibold">
          <ShieldCheck size={18} className="text-green-600" />
          Paiement sécurisé par Stripe
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#717171]">Référence</span>
            <span className="text-sm font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-600">
              {/* CORRECTION ICI : Utilisation de String() et slice sécurisé */}
              {sessionId ? String(sessionId).slice(0, 15) + "..." : "En attente"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#717171]">Statut</span>
            <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              Confirmé
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          asChild
          className="w-full h-14 rounded-xl bg-[#222222] text-white text-[16px] font-bold hover:bg-black transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
        >
          <Link href="/dashboard">
            Accéder au tableau de bord <ArrowRight size={18} />
          </Link>
        </Button>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-zinc-900" />
          <p className="mt-6 text-[16px] font-medium text-[#222222]">Synchronisation de votre profil...</p>
        </div>
      )}
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 text-[#222222]">
      <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-zinc-300" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}