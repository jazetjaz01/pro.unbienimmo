"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Pack Essentiel",
    price: 49,
    href: "/dashboard/onboarding/subscription",
    description: "Parfait pour débuter et tester l'audience.",
    features: [
      "Jusqu'à 10 annonces",
      "Diffusion sans passerelle",
      "Espace multi-utilisateurs",
      "Annonces géolocalisées",
      "Engagement 1 mois minimum",
    ],
    buttonText: "Choisir l'Essentiel",
  },
  {
    name: "Pack Professionnel",
    price: 99,
     href: "/dashboard/onboarding/subscription",
    isPopular: true,
    description: "Le meilleur rapport performance pour votre agence.",
    features: [
      "Jusqu'à 25 annonces",
      "Diffusion sans passerelle",
      "Espace multi-utilisateurs",
      "Annonces géolocalisées",
      "Support prioritaire",
    ],
    buttonText: "Choisir le Pro",
  },
  {
    name: "Pack Expert",
    price: 199,
     href: "/dashboard/onboarding/subscription",
    description: "Pour les agences à fort volume d'activité.",
    features: [
      "Jusqu'à 50 annonces",
      "Diffusion sans passerelle",
      "Espace multi-utilisateurs",
      "Annonces géolocalisées",
      "Compte Key Account dédié",
    ],
    buttonText: "Choisir l'Expert",
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-white text-[#222222] pb-24">
      {/* HEADER ÉPURÉ */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <Link 
          href="/dashboard" 
          className="inline-flex p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors mb-12"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>

        <div className="max-w-2xl mb-16">
          <h1 className="text-[32px] md:text-[44px] font-semibold leading-tight tracking-tight mb-4">
            Choisissez l'offre qui vous ressemble
          </h1>
          <p className="text-xl text-zinc-500 font-normal">
            Liberté totale : pas d'engagement de durée, rupture possible à tout moment.
          </p>
        </div>
      </div>

      {/* GRILLE DE PACKS STYLE CARTE AIRBNB */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col p-8 rounded-[24px] transition-all duration-300",
              plan.isPopular 
                ? "border-2 border-black shadow-[0_12px_24px_rgba(0,0,0,0.12)] scale-105 z-10 bg-white" 
                : "border border-zinc-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] bg-white"
            )}
          >
            {plan.isPopular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                Recommandé
              </span>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-zinc-500 text-[15px] leading-snug">
                {plan.description}
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="text-[40px] font-bold tracking-tight">{plan.price}€</span>
                <span className="text-zinc-500 text-lg ml-1">/mois HT</span>
              </div>
            </div>

            <div className="w-full h-px bg-zinc-100 mb-8" />

            <ul className="space-y-4 flex-grow mb-10">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-black shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-[15px] text-zinc-600">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={plan.href} className="w-full">
              <Button
                className={cn(
                  "w-full h-14 rounded-xl text-base font-bold transition-all active:scale-[0.98]",
                  plan.isPopular 
                    ? "bg-[#222222] hover:bg-black text-white" 
                    : "bg-white border-2 border-black text-black hover:bg-zinc-50"
                )}
              >
                {plan.buttonText}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="max-w-7xl mx-auto px-6 mt-16 text-center md:text-left">
        <p className="text-sm text-zinc-400 border-t border-zinc-100 pt-8">
          Toutes nos offres sont soumises à la TVA en vigueur. Facturation mensuelle.
        </p>
      </div>
    </div>
  );
};

export default Pricing;