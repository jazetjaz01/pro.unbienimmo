import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

// Imports des composants
import { OnboardingView } from "@/components/onboarding/OnboardingView";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Désactive le cache pour refléter instantanément le changement d'étape après paiement
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Vérification de la session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Récupération des données (Profil + Annonces)
  const [profileRes, listingsRes] = await Promise.all([
    supabase.from("profiles").select("onboarding_step").eq("id", user.id).single(),
    supabase.from("listings")
      .select("id, is_published, status, property_type, price, city, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  // Debug pour vérifier la valeur en base de données
  const userCurrentStep = profileRes.data?.onboarding_step || 1;
  
  // LOGS DE DEBUG (visibles dans votre terminal VS Code)
  console.log("------------------------------------------");
  console.log("UTILISATEUR ID:", user.id);
  console.log("ÉTAPE RÉCUPÉRÉE (DB):", userCurrentStep);
  console.log("------------------------------------------");

  // Condition logique : On bloque l'accès tant qu'on n'est pas à l'étape 5 (succès paiement)
  const isOnboardingComplete = userCurrentStep >= 5;

  const listings = listingsRes.data || [];

  // Calcul des statistiques
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.is_published === true).length,
    pending: listings.filter(l => l.is_published === false).length,
    views: 0, 
  };

  const recentListings = listings.slice(0, 3);

  // --- RENDU CONDITIONNEL ---

  // Si l'onboarding n'est pas terminé (étape 1, 2, 3 ou 4)
  if (!isOnboardingComplete) {
    return (
      <main className="min-h-screen bg-white">
        {/* On passe l'étape actuelle au composant pour qu'il affiche la bonne vue */}
        <OnboardingView step={userCurrentStep} />
      </main>
    );
  }

  // Si l'onboarding est terminé (étape 5+)
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-12 px-8 space-y-24 animate-in fade-in duration-700">
        
        {/* TITRE SECTION */}
        <div className="space-y-6">
          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-gray-400">Aperçu</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-gray-900 italic">
            Tableau de bord<span className="text-orange-600 not-italic">.</span>
          </h1>
          <div className="w-12 h-px bg-gray-900" />
        </div>

        {/* GRILLE DE STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-gray-200">
          <StatBlock label="Annonces" value={stats.total} description="Total en parc" border />
          <StatBlock label="Vues" value={stats.views} description="Visites cumulées" border />
          <StatBlock label="Publiées" value={stats.active} description="En ligne" border highlighted />
          <StatBlock label="Brouillons" value={stats.pending} description="Hors ligne" />
        </div>

        {/* SECTION CONTENU : ANNONCES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-20">
          <div className="lg:col-span-8 space-y-12">
            <div className="flex justify-between items-end border-b border-gray-900 pb-4">
              <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-900">Annonces récentes</h2>
              <Link href="/dashboard/listings" className="text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-orange-600 transition-colors">
                Voir toutes les annonces →
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {recentListings.length > 0 ? recentListings.map((item) => (
                <div key={item.id} className="group py-8 flex items-center justify-between transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-300 font-light">#{String(item.id).slice(0, 5)}</span>
                      <h3 className="text-lg font-medium text-gray-900 capitalize tracking-tight group-hover:text-orange-600 transition-colors">
                        {item.property_type?.replace('_', ' ') || "Bien immobilier"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <MapPin size={10} /> {item.city || "France"} — {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.price || 0)}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <span className={cn(
                      "text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 border",
                      item.is_published ? "border-gray-900 text-gray-900" : "border-gray-100 text-gray-300"
                    )}>
                      {item.is_published ? 'En ligne' : 'Brouillon'}
                    </span>
                    <Link href={`/dashboard/listings/${item.id}`}>
                      <ArrowRight size={20} className="text-gray-200 group-hover:text-gray-900 transform group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>
              )) : (
                <p className="py-12 text-center text-[11px] uppercase tracking-widest text-gray-400 italic">Aucune annonce trouvée</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-zinc-900 p-10 text-white flex flex-col items-center text-center space-y-6 shadow-2xl">
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-orange-500">Diffusion</p>
                <h3 className="text-2xl font-light tracking-tight italic">Nouveau bien ?</h3>
                <div className="w-8 h-px bg-white/30" />
                <Button className="w-full h-14 rounded-none bg-white text-black hover:bg-orange-600 hover:text-white transition-all uppercase text-[10px] tracking-[0.2em] font-bold" asChild>
                  <Link href="/dashboard/listings/new">Ajouter une annonce</Link>
                </Button>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Composant StatBlock
function StatBlock({ label, value, description, border, highlighted }: any) {
  return (
    <div className={cn(
      "p-10 flex flex-col space-y-4",
      border && "border-b md:border-b-0 md:border-r border-gray-100",
      highlighted && "bg-gray-50/50"
    )}>
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">{label}</p>
      <div className="text-5xl font-bold text-gray-900 tracking-tighter italic">
        {value}<span className="text-orange-600 not-italic">.</span>
      </div>
      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500">{description}</p>
    </div>
  );
}