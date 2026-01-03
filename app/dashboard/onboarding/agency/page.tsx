"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2, Check, AlertCircle, ArrowLeft, ArrowRight, Globe, Phone } from 'lucide-react'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OnboardingAgencyPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(2)

  const [form, setForm] = useState({
    name: '',
    type: '',
    siret: '',
    vat_number: '',
    phone: '',
    website: '',
    street_address: '',
    city: '',
    zip_code: '',
  })

  useEffect(() => {
    const fetchAgencyData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const [agencyRes, profileRes] = await Promise.all([
        supabase.from('professionals').select('*').eq('owner_id', user.id).single(),
        supabase.from('profiles').select('onboarding_step').eq('id', user.id).single()
      ])

      if (agencyRes.data) {
        setForm({
          name: agencyRes.data.name ?? '',
          type: agencyRes.data.type ?? '',
          siret: agencyRes.data.siret ?? '',
          vat_number: agencyRes.data.vat_number ?? '',
          phone: agencyRes.data.phone ?? '',
          website: agencyRes.data.website ?? '',
          street_address: agencyRes.data.street_address ?? '',
          city: agencyRes.data.city ?? '',
          zip_code: agencyRes.data.zip_code ?? '',
        })
      }
      if (profileRes.data) setCurrentStep(profileRes.data.onboarding_step ?? 2)
      setLoading(false)
    }
    fetchAgencyData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const cleanSiret = form.siret.replace(/\s/g, "")
    if (!form.name.trim() || !form.type || cleanSiret.length !== 14) {
      setSaving(false)
      return setError('Nom, Type et SIRET (14 chiffres) sont obligatoires.')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setSaving(false)

    const { error: agencyError } = await supabase.from('professionals').upsert({
      owner_id: user.id,
      ...form,
      siret: cleanSiret,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_id' })

    const nextStep = currentStep >= 5 ? currentStep : 3
    if (!agencyError && currentStep < 5) {
      await supabase.from('profiles').update({ onboarding_step: nextStep }).eq('id', user.id)
    }

    if (agencyError) {
      setError(agencyError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/onboarding'), 1500)
    }
    setSaving(false)
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-10 transition-colors bg-transparent shadow-none"

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-900" /></div>

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      <Link href="/dashboard/onboarding" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors mb-12 group">
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        Retour au tracker
      </Link>

      <div className="mb-16 border-b border-gray-100 pb-8 text-left">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-5 w-5 text-gray-900" />
          <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase font-bold">
            {currentStep >= 5 ? "Société" : "Étape 02"}
          </p>
        </div>
        <h1 className="text-4xl font-light tracking-tight text-gray-900 italic leading-tight">Identité Légale</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-20">
        
        {/* SECTION 1: IDENTIFICATION & CONTACT */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Identification</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic border-l border-gray-100 pl-4">
              "Données officielles et coordonnées de l'agence."
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom commercial *</Label>
              <Input className={minimalInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Agence Horizon" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Activité *</Label>
              <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                <SelectTrigger className="rounded-none border-0 border-b border-gray-200 focus:ring-0 px-0 shadow-none">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-100">
                  <SelectItem value="agence immobilière">Agence immobilière</SelectItem>
                  <SelectItem value="notaire">Notaire</SelectItem>
                  <SelectItem value="promoteur">Promoteur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">SIRET *</Label>
              <Input 
                className={`${minimalInput} font-mono`} 
                value={form.siret} 
                onChange={e => setForm({ ...form, siret: e.target.value.replace(/\D/g, "").slice(0, 14) })} 
                placeholder="14 chiffres"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">TVA Intracommunautaire</Label>
              <Input className={`${minimalInput} font-mono uppercase`} value={form.vat_number} onChange={e => setForm({ ...form, vat_number: e.target.value })} placeholder="FR..." />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                <Phone size={10} /> Téléphone Agence
              </Label>
              <Input className={minimalInput} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01 .. .. .. .." />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                <Globe size={10} /> Site Internet
              </Label>
              <Input className={minimalInput} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="www.agence.com" />
            </div>
          </div>
        </section>

        {/* SECTION 2: ADRESSE */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Siège Social</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic border-l border-gray-100 pl-4">
              "Adresse légale utilisée pour vos documents officiels."
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
            <div className="md:col-span-3 space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Adresse (Rue et numéro)</Label>
              <Input className={minimalInput} value={form.street_address} onChange={e => setForm({ ...form, street_address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Code Postal *</Label>
              <Input className={minimalInput} value={form.zip_code} onChange={e => setForm({ ...form, zip_code: e.target.value.replace(/\D/g, "").slice(0, 5) })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Ville *</Label>
              <Input className={minimalInput} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>
        </section>

        <div className="pt-10 border-t border-gray-900 border-opacity-10 flex flex-col items-end gap-6 pb-20">
          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-[10px] font-bold uppercase tracking-wider">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
              <Check className="h-4 w-4" /> Société enregistrée. Direction l'étape 03...
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={saving}
            className="w-full md:w-auto h-16 px-16 bg-gray-900 hover:bg-orange-600 text-white rounded-none text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-2xl group"
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : (
              <span className="flex items-center gap-3">
                Continuer vers la vitrine <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}