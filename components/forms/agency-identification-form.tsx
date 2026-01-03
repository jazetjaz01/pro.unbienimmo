"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2, Check, AlertCircle, ArrowRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export function AgencyIdentificationForm({ isOnboarding = false }: { isOnboarding?: boolean }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    legal_name: '',
    siret: '',
    vat_number: '',
    type: '',
    street_address: '',
    city: '',
    zip_code: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: agency } = await supabase
        .from('professionals')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (agency) {
        setForm({
          name: agency.name ?? '',
          legal_name: agency.legal_name ?? '',
          siret: agency.siret ?? '',
          vat_number: agency.vat_number ?? '',
          type: agency.type ?? '',
          street_address: agency.street_address ?? '',
          city: agency.city ?? '',
          zip_code: agency.zip_code ?? '',
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanSiret = form.siret.replace(/\s/g, "")
    
    if (!form.name || !form.type || cleanSiret.length !== 14) {
      setError("Veuillez remplir les champs obligatoires (SIRET: 14 chiffres)")
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error: upsertError } = await supabase.from('professionals').upsert({
      owner_id: user?.id,
      ...form,
      siret: cleanSiret,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_id' })

    if (upsertError) {
      setError(upsertError.message)
    } else {
      if (isOnboarding) {
        // On passe au step 3 (Vitrine)
        await supabase.from('profiles').update({ onboarding_step: 3 }).eq('id', user?.id)
        router.push('/dashboard') // Le dashboard affichera le tracker mis à jour
      } else {
        toast.success("Fiche société mise à jour")
      }
    }
    setSaving(false)
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-10 transition-colors bg-transparent shadow-none"

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Identification</h3>
          <p className="text-xs text-gray-400 leading-relaxed italic">Données légales.</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom commercial *</Label>
            <Input className={minimalInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Activité *</Label>
            <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
              <SelectTrigger className="rounded-none border-0 border-b border-gray-200 px-0 shadow-none"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="agence">Agence immobilière</SelectItem><SelectItem value="notaire">Notaire</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">SIRET *</Label>
            <Input className={minimalInput} value={form.siret} onChange={e => setForm({ ...form, siret: e.target.value })} />
          </div>
        </div>
      </section>

      <div className="flex flex-col items-end gap-4">
        {error && <p className="text-rose-500 text-[10px] uppercase font-bold">{error}</p>}
        <Button type="submit" disabled={saving} className="rounded-none bg-black text-white px-12 h-14 uppercase text-[10px] tracking-widest">
          {saving ? <Loader2 className="animate-spin" /> : "Valider et continuer"}
        </Button>
      </div>
    </form>
  )
}