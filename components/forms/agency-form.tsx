"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, Building2, MapPin } from 'lucide-react'
import { toast } from "sonner"

interface AgencyFormProps {
  isOnboarding?: boolean
}

export function AgencyForm({ isOnboarding = false }: AgencyFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agency, setAgency] = useState({
    id: '',
    name: '',
    address: '',
    type: 'immobilier',
    logo_url: ''
  })

  useEffect(() => {
    const fetchAgency = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data } = await supabase
        .from('professionals')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (data) {
        setAgency({
          id: data.id,
          name: data.name ?? '',
          address: data.address ?? '',
          type: data.type ?? 'immobilier',
          logo_url: data.logo_url ?? ''
        })
      }
      setLoading(false)
    }
    fetchAgency()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")

      // Mise à jour de l'agence
      const { error: agencyError } = await supabase
        .from('professionals')
        .update({
          name: agency.name.trim(),
          address: agency.address.trim(),
          type: agency.type
        })
        .eq('owner_id', user.id)

      if (agencyError) throw agencyError

      // Mise à jour de l'étape d'onboarding dans le profil (Step 2 -> 3)
      if (isOnboarding) {
        await supabase
          .from('profiles')
          .update({ onboarding_step: 3 })
          .eq('id', user.id)
        
        toast.success("Agence configurée")
        router.push('/onboarding/plan') // Vers l'étape des tarifs
      } else {
        toast.success("Informations de l'agence mises à jour")
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 text-lg transition-colors bg-transparent shadow-none"

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-900" /></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-16">
      
      {/* IDENTITÉ DE L'AGENCE */}
      <div className="space-y-10">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Nom de l'enseigne</Label>
          <div className="relative">
            <Building2 className="absolute right-0 bottom-3 text-gray-200" size={18} strokeWidth={1} />
            <Input 
              className={minimalInput} 
              value={agency.name} 
              onChange={e => setAgency({...agency, name: e.target.value})} 
              placeholder="Ex: Agence du Palais"
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Adresse du siège</Label>
          <div className="relative">
            <MapPin className="absolute right-0 bottom-3 text-gray-200" size={18} strokeWidth={1} />
            <Input 
              className={minimalInput} 
              value={agency.address} 
              onChange={e => setAgency({...agency, address: e.target.value})} 
              placeholder="15 avenue Montaigne, Paris"
              required 
            />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
        <p className="text-[9px] text-gray-300 uppercase tracking-widest max-w-[200px] leading-relaxed italic">
          Ces informations figureront sur vos documents officiels.
        </p>
        
        <Button 
          type="submit" 
          disabled={saving}
          className="rounded-none bg-black text-white px-12 h-14 uppercase text-[10px] tracking-[0.3em] font-bold shadow-xl hover:bg-gray-800 transition-all"
        >
          {saving ? <Loader2 className="animate-spin" /> : (
            <span className="flex items-center gap-2">
              {isOnboarding ? "Continuer vers les offres" : "Enregistrer"}
              <ArrowRight size={14} />
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}