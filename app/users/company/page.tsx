'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2, Check, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CompanyProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    legal_name: '',
    siret: '',
    type: '',
    email: '',
    phone: '',
    website: '',
    street_address: '',
    city: '',
    zip_code: '',
    region: '',
    country: 'FR',
  })

  useEffect(() => {
    const fetchCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') setError(error.message)
      if (data) setForm({
        name: data.name ?? '',
        legal_name: data.legal_name ?? '',
        siret: data.siret ?? '',
        type: data.type ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        website: data.website ?? '',
        street_address: data.street_address ?? '',
        city: data.city ?? '',
        zip_code: data.zip_code ?? '',
        region: data.region ?? '',
        country: data.country ?? 'FR',
      })

      setLoading(false)
    }
    fetchCompany()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.name.trim() || !form.type) {
      return setError('Le nom commercial et le type d’activité sont obligatoires.')
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError("Session expirée")
      return setSaving(false)
    }

    const { error } = await supabase.from('professionals').upsert({
      owner_id: user.id,
      name: form.name.trim(),
      legal_name: form.legal_name.trim() || null,
      siret: form.siret.trim() || null,
      type: form.type,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      street_address: form.street_address.trim() || null,
      city: form.city.trim() || null,
      zip_code: form.zip_code.trim() || null,
      region: form.region.trim() || null,
      country: form.country,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_id' })

    if (error) setError(error.message)
    else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-4xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER MINIMALISTE */}
      <div className="mb-16 border-b border-gray-100 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-5 w-5 text-gray-900" />
          <p className="text-gray-400 text-sm tracking-[0.2em] uppercase font-bold">Paramètres</p>
        </div>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Fiche Société</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-20">
        
        {/* --- SECTION IDENTIFICATION --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Identification</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Les informations officielles de votre établissement.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom commercial *</Label>
              <Input 
                className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 transition-colors"
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                placeholder="Ex: Agence du Palais"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Activité *</Label>
              <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                <SelectTrigger className="rounded-none border-0 border-b border-gray-200 focus:ring-0 px-0 shadow-none">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-100">
                  <SelectItem value="agence">Agence immobilière</SelectItem>
                  <SelectItem value="syndic">Syndic</SelectItem>
                  <SelectItem value="notaire">Notaire</SelectItem>
                  <SelectItem value="promoteur">Promoteur</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Raison sociale</Label>
              <Input 
                className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0"
                value={form.legal_name} 
                onChange={e => setForm({ ...form, legal_name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">SIRET</Label>
              <Input 
                className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0"
                value={form.siret} 
                onChange={e => setForm({ ...form, siret: e.target.value })} 
              />
            </div>
          </div>
        </section>

        {/* --- SECTION CONTACT --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Visibilité</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Coordonnées affichées sur vos annonces publiques.</p>
          </div>
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email pro</Label>
                <Input 
                  className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0"
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Téléphone</Label>
                <Input 
                  className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0"
                  value={form.phone} 
                  onChange={e => setForm({ ...form, phone: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Site internet</Label>
              <Input 
                className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0"
                type="url" 
                value={form.website} 
                onChange={e => setForm({ ...form, website: e.target.value })} 
              />
            </div>
          </div>
        </section>

        {/* --- SECTION ADRESSE --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Localisation</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Adresse du siège ou de l'agence principale.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
            <div className="md:col-span-3 space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Adresse (Rue)</Label>
              <Input 
                className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0"
                value={form.street_address} 
                onChange={e => setForm({ ...form, street_address: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Code Postal</Label>
              <Input 
                className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0"
                value={form.zip_code} 
                onChange={e => setForm({ ...form, zip_code: e.target.value })} 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Ville</Label>
              <Input 
                className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0"
                value={form.city} 
                onChange={e => setForm({ ...form, city: e.target.value })} 
              />
            </div>
          </div>
        </section>

        {/* --- FOOTER / ACTIONS --- */}
        <div className="pt-10 border-t border-gray-900 border-opacity-10 flex flex-col items-end gap-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-gray-900 text-xs font-bold uppercase tracking-wider">
              <Check className="h-4 w-4" /> Profil mis à jour
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full md:w-auto h-14 px-12 bg-gray-900 hover:bg-black text-white rounded-none text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50" 
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
          </Button>
        </div>
      </form>
    </div>
  )
}