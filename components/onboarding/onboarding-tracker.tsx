"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, ArrowRight, User, Building2, CreditCard, Store, PencilLine } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { 
    id: 1, 
    name: "Profil Leader", 
    description: "Identité du gérant", 
    icon: User, 
    href: "/dashboard/onboarding/profile" 
  },
  { 
    id: 2, 
    name: "Fiche Société", 
    description: "SIRET & TVA Intracom.", 
    icon: Building2, 
    href: "/dashboard/onboarding/agency" 
  },
  { 
    id: 3, 
    name: "Vitrine", 
    description: "Logo & Spécialités", 
    icon: Store, 
    href: "/dashboard/onboarding/showcase" 
  },
  { 
    id: 4, 
    name: "Abonnement", 
    description: "Pack de diffusion", 
    icon: CreditCard, 
    href: "/dashboard/onboarding/plan" 
  },
];

interface OnboardingTrackerProps {
  currentStep: number;
}

export function OnboardingTracker({ currentStep }: OnboardingTrackerProps) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* HEADER */}
      <div className="max-w-3xl mb-16 text-center space-y-6">
        <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-gray-400">
          Configuration Partenaire
        </p>
        <h2 className="text-3xl md:text-4xl font-light italic tracking-tight text-gray-900 leading-tight">
          Préparez votre espace de travail
        </h2>
        <div className="w-12 h-px bg-gray-900 mx-auto" />
      </div>

      {/* GRILLE DU TRACKER */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 border border-gray-200 bg-white shadow-sm">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                "relative p-8 flex flex-col transition-all duration-700 border-b md:border-b-0 md:border-r border-gray-200 last:border-r-0 last:border-b-0",
                isActive ? "bg-zinc-900 text-white z-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] scale-[1.03]" : "bg-white text-gray-900"
              )}
            >
              {/* Badge "Modifier" pour les étapes terminées en Orange */}
              {isDone && (
                <Link 
                  href={step.href}
                  className="absolute top-6 right-6 flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-bold text-orange-600 hover:text-orange-500 transition-colors group/edit"
                >
                  <PencilLine className="h-3 w-3 group-hover/edit:rotate-12 transition-transform" />
                  Modifier
                </Link>
              )}

              <h3 className={cn(
                "text-[9px] uppercase tracking-[0.4em] font-bold mb-8",
                isActive ? "text-zinc-500" : "text-gray-300"
              )}>
                0{step.id}
              </h3>

              <step.icon className={cn(
                "h-7 w-7 mb-6 stroke-[1.2px]", 
                isActive ? "text-orange-500" : isDone ? "text-orange-600" : "text-gray-400"
              )} />

              <h4 className="text-lg font-light italic tracking-tight mb-3">
                {step.name}
              </h4>
              
              <p className={cn(
                "text-[9px] uppercase tracking-[0.2em] leading-relaxed mb-10 h-8",
                isActive ? "text-gray-400" : "text-gray-400"
              )}>
                {step.description}
              </p>

              <Separator className={cn("mt-auto mb-6", isActive ? "bg-white/10" : "bg-gray-100")} />

              <Link href={step.href} className={cn("w-full", isDone && "pointer-events-none")}>
                <Button
                  disabled={isDone}
                  variant="outline"
                  className={cn(
                    "w-full h-12 rounded-none uppercase text-[8px] tracking-[0.2em] font-bold transition-all duration-300",
                    isActive 
                      ? "bg-white text-gray-900 border-none hover:bg-orange-600 hover:text-white shadow-lg" 
                      : isDone
                      ? "bg-orange-50/50 text-orange-600 border-orange-100 cursor-default"
                      : "bg-transparent border-gray-200 hover:border-black text-gray-900"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isDone ? (
                      <><Check className="h-3 w-3" /> Terminé</>
                    ) : isActive ? (
                      <>Remplir <ArrowRight className="h-3 w-3" /></>
                    ) : (
                      <>En attente</>
                    )} 
                  </span>
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-[9px] uppercase tracking-[0.3em] text-gray-300 italic">
        UnBien — Système d'onboarding professionnel
      </p>
    </div>
  );
}