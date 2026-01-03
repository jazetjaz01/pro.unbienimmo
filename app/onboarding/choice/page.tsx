"use client";

import { useState } from "react";
import { Building2, UserCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OnboardingChoicePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<'patron' | 'agent' | null>(null);

  const handleChoice = async (role: 'patron' | 'agent') => {
    setLoading(role);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Session expirée");
        router.push('/auth/login');
        return;
      }

      if (role === 'patron') {
        // ✅ On met à jour le step ET on déclare l'utilisateur comme PRO
        const { error } = await supabase
          .from('profiles')
          .update({ 
            onboarding_step: 1,
            is_pro: true // Permet au middleware de valider l'accès au dashboard immédiatement
          })
          .eq('id', user.id);
        
        if (error) throw error;
        
        // On force un rafraîchissement léger pour que le middleware lise les nouvelles données
        router.refresh(); 
        router.push('/dashboard/onboarding');
      } else {
        // Pour l'agent, on le redirige vers la saisie du code
        router.push('/auth/join-agency');
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#222222]">
      <div className="max-w-xl w-full space-y-12">
        
        {/* Header Style Airbnb */}
        <div className="space-y-4">
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight">
            Comment souhaitez-vous utiliser UnBienimmo ?
          </h1>
          <p className="text-[18px] text-[#717171] font-normal">
            Sélectionnez votre rôle pour configurer votre espace de travail.
          </p>
        </div>

        {/* Liste de choix façon Airbnb Setup */}
        <div className="space-y-4">
          
          {/* OPTION 1 : PATRON */}
          <button 
            onClick={() => handleChoice('patron')}
            disabled={loading !== null}
            className={cn(
              "w-full group relative p-8 bg-white border border-[#DDDDDD] rounded-[16px] transition-all duration-200",
              "hover:border-black hover:shadow-md flex items-center justify-between text-left",
              "disabled:opacity-50"
            )}
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-zinc-50 rounded-lg group-hover:bg-zinc-100 transition-colors">
                {loading === 'patron' ? (
                  <Loader2 className="animate-spin h-8 w-8 text-[#222222]" />
                ) : (
                  <Building2 size={32} strokeWidth={1.5} className="text-[#222222]" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-[18px] font-semibold">Créer mon agence</h3>
                <p className="text-[14px] text-[#717171]">Gérant de structure, configurer mon équipe et mes biens.</p>
              </div>
            </div>
            <ChevronRight className="text-[#222222] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>

          {/* OPTION 2 : AGENT */}
          <button 
            onClick={() => handleChoice('agent')}
            disabled={loading !== null}
            className={cn(
              "w-full group relative p-8 bg-white border border-[#DDDDDD] rounded-[16px] transition-all duration-200",
              "hover:border-black hover:shadow-md flex items-center justify-between text-left",
              "disabled:opacity-50"
            )}
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-zinc-50 rounded-lg group-hover:bg-zinc-100 transition-colors">
                {loading === 'agent' ? (
                  <Loader2 className="animate-spin h-8 w-8 text-[#222222]" />
                ) : (
                  <UserCircle2 size={32} strokeWidth={1.5} className="text-[#222222]" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-[18px] font-semibold">Rejoindre une agence</h3>
                <p className="text-[14px] text-[#717171]">Collaborateur avec un code d'invitation agence.</p>
              </div>
            </div>
            <ChevronRight className="text-[#222222] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>

        </div>

        {/* Aide footer */}
        <div className="pt-6 border-t border-[#EEEEEE]">
            <p className="text-[14px] text-[#717171]">
                Besoin d'aide ? <span className="font-semibold underline cursor-pointer">Contacter le support</span>
            </p>
        </div>
      </div>
    </div>
  );
}