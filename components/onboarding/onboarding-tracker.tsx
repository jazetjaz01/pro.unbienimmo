"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, User, Building2, CreditCard, Store, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { id: 1, name: "Profil", description: "Identité du gérant", icon: User, href: "/dashboard/onboarding/profile" },
  { id: 2, name: "Société", description: "SIRET & TVA", icon: Building2, href: "/dashboard/onboarding/agency" },
  { id: 3, name: "Vitrine", description: "Logo & Spécialités", icon: Store, href: "/dashboard/onboarding/showcase" },
  { id: 4, name: "Abonnement", description: "Pack de diffusion", icon: CreditCard, href: "/dashboard/onboarding/plan" },
];

interface OnboardingTrackerProps {
  currentStep: number;
}

export function OnboardingTracker({ currentStep }: OnboardingTrackerProps) {
  const progressValue = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* HEADER : Minimaliste */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-zinc-900 tracking-tight">
          Finalisez votre installation
        </h2>
        <p className="text-zinc-500 mt-2 text-lg">
          Plus que quelques étapes pour commencer à publier.
        </p>
      </div>

      {/* BARRE DE PROGRESSION */}
      <div className="mb-10 space-y-3">
        <div className="flex justify-between text-sm font-medium text-zinc-700">
          <span>Progression</span>
          <span>{Math.round(progressValue)}%</span>
        </div>
        <Progress value={progressValue} className="h-1.5 bg-zinc-100" />
      </div>

      {/* GRILLE DE CARTES ARRONDIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isLocked = currentStep < step.id;

          return (
            <Link
              href={step.href}
              key={step.id}
              className={cn(
                "group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[190px]",
                isActive 
                  ? "border-zinc-900 ring-[0.5px] ring-zinc-900 shadow-lg" 
                  : "border-zinc-200 hover:border-zinc-300 hover:shadow-md",
                isLocked && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    isActive ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-600",
                    isDone && "bg-green-50 text-green-600"
                  )}>
                    {isDone ? <Check className="h-5 w-5 stroke-[3px]" /> : <step.icon className="h-5 w-5" />}
                  </div>
                </div>

                <h3 className="font-semibold text-zinc-900 text-lg">
                  {step.name}
                </h3>
                <p className="text-zinc-500 text-sm mt-1.5 leading-snug">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 flex items-center text-sm font-semibold">
                {isActive ? (
                  <span className="flex items-center gap-1 text-zinc-900">
                    Continuer <ChevronRight className="h-4 w-4" />
                  </span>
                ) : isDone ? (
                  <span className="text-zinc-400 group-hover:text-zinc-900 transition-colors">Modifier</span>
                ) : (
                  <span className="text-zinc-300">Verrouillé</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}