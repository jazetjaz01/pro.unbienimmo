"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PACKS = [
  { id: "essentiel", name: "Essentiel", price: 49, ads: "10 annonces" },
  { id: "professionnel", name: "Professionnel", price: 99, ads: "25 annonces" },
  { id: "expert", name: "Expert", price: 199, ads: "50 annonces" },
];

export default function SubscriptionForm() {
  const [loading, setLoading] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState("professionnel");

  const selectedPack = PACKS.find(p => p.id === selectedPackId) || PACKS[1];
  const tva = selectedPack.price * 0.20;
  const total = selectedPack.price + tva;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    console.log("Tentative de paiement pour le pack:", selectedPackId);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: selectedPackId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session");
      }

      if (data.url) {
        console.log("Redirection vers:", data.url);
        window.location.href = data.url;
      } else {
        alert("Impossible de générer le lien de paiement.");
      }
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <Link href="/dashboard/onboarding/plan" className="inline-flex p-2 mb-8 hover:bg-zinc-100 rounded-full">
        <ArrowLeft size={20} />
      </Link>

      <form onSubmit={onSubmit} className="space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Confirmez votre abonnement</h1>
          <p className="text-zinc-500">Paiement sécurisé via Stripe.</p>
        </div>

        <div className="space-y-4">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              onClick={() => setSelectedPackId(pack.id)}
              className={cn(
                "p-6 border-2 rounded-2xl cursor-pointer transition-all flex justify-between items-center",
                selectedPackId === pack.id ? "border-black bg-zinc-50 ring-1 ring-black" : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-5 h-5 rounded-full border-2", selectedPackId === pack.id ? "bg-black border-black" : "border-zinc-300")} />
                <div>
                  <p className="font-bold">Pack {pack.name}</p>
                  <p className="text-sm text-zinc-500">{pack.ads}</p>
                </div>
              </div>
              <p className="text-xl font-bold">{pack.price}€<span className="text-sm font-normal text-zinc-400">/HT</span></p>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t space-y-4">
          <div className="flex justify-between text-zinc-600">
            <span>Abonnement {selectedPack.name}</span>
            <span>{selectedPack.price.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>TVA (20%)</span>
            <span>{tva.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-4 border-t">
            <span>Total TTC</span>
            <span>{total.toFixed(2)}€</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" // FORCE LE SUBMIT
            disabled={loading}
            className="w-full h-14 bg-black text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2">Procéder au paiement <ArrowRight size={18} /></span>}
          </Button>
          
          <div className="flex gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <ShieldCheck className="text-zinc-900 shrink-0" />
            <p className="text-xs text-zinc-500">Paiement 100% sécurisé. Pas d'engagement de durée, résiliable en un clic.</p>
          </div>
        </div>
      </form>
    </div>
  );
}