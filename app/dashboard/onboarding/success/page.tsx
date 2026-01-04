


"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ShieldCheck, Stars } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  useEffect(() => {
    // Confettis immédiats et élégants (couleurs de ton app ou dorées/noires)
    const end = Date.now() + 3 * 1000;
    const colors = ["#222222", "#FF385C", "#FFD700"]; // Noir, Rose Airbnb, Or

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="w-full max-w-137.5 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      {/* HEADER TYPE AIRBNB */}
      <div className="text-left space-y-4 mb-10">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-50 text-green-600 mb-2">
          <Check strokeWidth={3} size={24} />
        </div>
        <h1 className="text-[32px] font-semibold tracking-tight text-[#222222] leading-[1.1]">
          Félicitations, <br />
          tout est prêt.
        </h1>
        <p className="text-[18px] text-[#717171] font-light leading-relaxed">
          Votre compte professionnel est désormais actif. Vous pouvez commencer à diffuser vos annonces dès maintenant.
        </p>
      </div>

      {/* CARTE DE RÉCAPITULATIF ÉPURÉE */}
      <div className="bg-white rounded-3xl border border-[#DDDDDD] p-6 mb-10 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#F0F0F0]">
            <div className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                <Stars className="text-zinc-400" size={20} />
            </div>
            <div>
                <p className="text-sm font-semibold text-[#222222]">Abonnement Professionnel</p>
                <p className="text-xs text-[#717171]">Activation immédiate</p>
            </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[15px]">
            <span className="text-[#717171]">Référence du paiement</span>
            <span className="font-mono text-[13px] text-[#222222]">
              {sessionId ? String(sessionId).slice(0, 12).toUpperCase() : "CONFIRMÉ"}
            </span>
          </div>
          <div className="flex justify-between items-center text-[15px]">
            <span className="text-[#717171]">Statut</span>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
              Payé
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-6">
        <Button 
          asChild
          className="w-full h-14 rounded-2xl bg-[#222222] text-white text-[16px] font-semibold hover:bg-black transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
        >
          <Link href="/dashboard">
            Accéder à mon espace <ArrowRight size={18} />
          </Link>
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-[#717171] text-sm font-light">
            <ShieldCheck size={14} />
            Transaction sécurisée par Stripe
        </div>
      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex items-center justify-center p-6 text-[#222222]">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}