"use client"

import { useState } from "react"
import { Building2, UserCircle2, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function OnboardingChoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<'patron' | 'agent' | null>(null)

  const handleChoice = async (role: 'patron' | 'agent') => {
    setLoading(role)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Session expirée, veuillez vous reconnecter")
        router.push('/auth/login')
        return
      }

      if (role === 'patron') {
        // Le patron passe à l'étape 1 (Prêt à créer son agence)
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_step: 1 })
          .eq('id', user.id)
        
        if (error) throw error
        router.push('/dashboard/onboarding')
      } else {
        // Pour l'agent, on le redirige vers la saisie du code
        // Son onboarding_step changera via la fonction RPC join_agency_by_code
        router.push('/auth/join-agency')
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue lors de la sélection du rôle")
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-light italic tracking-tight text-gray-900">
            Bienvenue sur UnBienimmo.com
          </h1>
          <p className="text-gray-400 uppercase text-[10px] tracking-[0.3em] font-bold">
            Choisissez votre mode d'utilisation
          </p>
        </div>

        {/* Grille de choix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* OPTION 1 : LE PATRON (ADMIN) */}
          <button 
            onClick={() => handleChoice('patron')}
            disabled={loading !== null}
            className="group relative bg-white p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-gray-900 transition-all duration-500 flex flex-col items-center text-center gap-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-4 bg-gray-50 rounded-full group-hover:bg-gray-900 group-hover:text-white transition-colors">
              {loading === 'patron' ? (
                <Loader2 className="animate-spin h-8 w-8" />
              ) : (
                <Building2 size={32} strokeWidth={1} />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase tracking-tighter">Créer mon agence</h3>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "Je suis gérant d'une structure et je souhaite configurer mon entité et gérer mon équipe."
              </p>
            </div>
            <ArrowRight className="text-gray-200 group-hover:text-gray-900 transition-colors mt-auto" />
          </button>

          {/* OPTION 2 : L'AGENT (COLLABORATEUR) */}
          <button 
            onClick={() => handleChoice('agent')}
            disabled={loading !== null}
            className="group relative bg-white p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-gray-900 transition-all duration-500 flex flex-col items-center text-center gap-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-4 bg-gray-50 rounded-full group-hover:bg-gray-900 group-hover:text-white transition-colors">
              {loading === 'agent' ? (
                <Loader2 className="animate-spin h-8 w-8" />
              ) : (
                <UserCircle2 size={32} strokeWidth={1} />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase tracking-tighter">Rejoindre une agence</h3>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "Je suis collaborateur et je possède un code d'invitation fourni par mon agence."
              </p>
            </div>
            <ArrowRight className="text-gray-200 group-hover:text-gray-900 transition-colors mt-auto" />
          </button>

        </div>

        {/* Footer discret */}
        <p className="text-center text-[9px] text-gray-300 uppercase tracking-widest">
          Plateforme sécurisée pour professionnels de l'immobilier
        </p>
      </div>
    </div>
  )
}