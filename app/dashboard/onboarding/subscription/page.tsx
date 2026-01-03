"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PACKS = [
  { 
    id: "essentiel", 
    name: "Essentiel", 
    price: 49, 
    ads: "Jusqu'à 10 annonces",
    description: "Parfait pour débuter" 
  },
  { 
    id: "professionnel", 
    name: "Professionnel", 
    price: 99, 
    ads: "Jusqu'à 25 annonces",
    description: "Le choix des agences" 
  },
  { 
    id: "expert", 
    name: "Expert", 
    price: 199, 
    ads: "Jusqu'à 50 annonces",
    description: "Volume de diffusion élevé" 
  },
];

export default function SubscriptionForm() {
  const [loading, setLoading] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState("professionnel");

  // Calculs financiers
  const selectedPack = PACKS.find(p => p.id === selectedPackId) || PACKS[1];
  const tvaRate = 0.20;
  const priceHT = selectedPack.price;
  const tvaAmount = priceHT * tvaRate;
  const priceTTC = priceHT + tvaAmount;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Appel API vers la session Checkout Stripe
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: selectedPackId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirection vers Stripe
      }
    } catch (error) {
      console.error("Erreur de redirection:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-6 bg-white min-h-screen font-sans text-[#222222]">
      
      {/* BOUTON RETOUR */}
      <Link href="/dashboard/onboarding/plan" className="inline-flex p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors mb-8">
        <ArrowLeft size={20} strokeWidth={2.5} />
      </Link>

      <form onSubmit={onSubmit} className="space-y-10">
        
        {/* TITRE & INTRODUCTION */}
        <div className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight">
            Confirmez votre abonnement
          </h1>
          <p className="text-lg text-zinc-500 font-normal leading-relaxed">
            Vérifiez les détails de votre offre avant de procéder au paiement sécurisé.
          </p>
        </div>

        {/* LISTE DES OPTIONS DE PACKS */}
        <div className="space-y-4">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              onClick={() => setSelectedPackId(pack.id)}
              className={cn(
                "group relative p-6 border-2 rounded-2xl transition-all cursor-pointer flex justify-between items-center",
                selectedPackId === pack.id 
                  ? "border-black bg-zinc-50/30 ring-1 ring-black" 
                  : "border-zinc-200 hover:border-zinc-300 bg-white"
              )}
            >
              <div className="flex items-center gap-5">
                {/* Custom Radio Button */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedPackId === pack.id ? "border-black bg-black" : "border-zinc-300 group-hover:border-zinc-400"
                )}>
                  {selectedPackId === pack.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-base font-semibold">Pack {pack.name}</p>
                  <p className="text-sm text-zinc-600 font-medium">{pack.ads}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold">{pack.price}€</span>
                <span className="text-sm font-medium text-zinc-500 ml-1">/HT</span>
              </div>
            </div>
          ))}
        </div>

        {/* RÉCAPITULATIF DU PRIX (STYLE REÇU AIRBNB) */}
        <div className="pt-8 border-t border-zinc-200">
          <h3 className="text-xl font-semibold mb-6">Détails de la facturation</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-base">
              <span className="text-zinc-600 underline underline-offset-4 decoration-zinc-200">Abonnement mensuel {selectedPack.name}</span>
              <span>{priceHT.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-zinc-600 underline underline-offset-4 decoration-zinc-200">TVA (20%)</span>
              <span>{tvaAmount.toFixed(2)}€</span>
            </div>
            
            {/* TOTAL TTC */}
            <div className="pt-4 border-t border-zinc-200 flex justify-between text-lg font-bold">
              <span>Total à payer (TTC)</span>
              <span>{priceTTC.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* SECTION REASSURANCE & CGV */}
        <div className="pt-4 space-y-8">
          {/* Bloc d'info flexible */}
          <div className="bg-zinc-50 p-6 rounded-2xl flex gap-4 border border-zinc-100">
            <ShieldCheck className="h-6 w-6 text-zinc-900 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Sans engagement de durée</p>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Vous pouvez résilier votre abonnement à tout moment depuis vos paramètres. La résiliation sera effective à la fin de la période de facturation en cours.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Button 
                disabled={loading}
                className="w-full h-[56px] rounded-xl bg-[#222222] text-white text-base font-bold hover:bg-black transition-all active:scale-[0.98] shadow-sm"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <span className="flex items-center gap-2">
                    Procéder au paiement sécurisé <ArrowRight size={18} />
                  </span>
                )}
              </Button>

              {/* MENTION LÉGALE CGV */}
              <p className="text-center text-[12px] leading-relaxed text-zinc-500 px-4">
                En sélectionnant le bouton ci-dessus, j'accepte les{" "}
                <Link href="/cgu" className="font-semibold text-[#222222] underline underline-offset-2 hover:text-black transition-colors">
                  Conditions Générales de Vente
                </Link>{" "}
                et je reconnais que mon abonnement commencera immédiatement.
              </p>
            </div>
            
            {/* FOOTER PAIEMENT */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-zinc-100 italic">
               <p className="text-[11px] font-medium text-zinc-400">
                 Transaction sécurisée via Stripe &bull; Facturation mensuelle. Service client au : 0616224682
               </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}