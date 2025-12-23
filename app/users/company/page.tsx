'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

    // Validation minimale
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
    else setSuccess(true)
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center p-10">Chargement...</div>

  return (
    <div className="w-full max-w-2xl">
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            Fiche Société
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* --- SECTION IDENTIFICATION --- */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold  uppercase tracking-wider border-b pb-1">
                Informations Légales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom commercial *</Label>
                  <Input 
                    id="name" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder="Nom de l'enseigne"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Activité principale *</Label>
                  <Select 
                    value={form.type} 
                    onValueChange={(val) => setForm({ ...form, type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agence">Agence immobilière</SelectItem>
                      <SelectItem value="syndic">Syndic</SelectItem>
                      <SelectItem value="notaire">Notaire</SelectItem>
                      <SelectItem value="promoteur">Promoteur</SelectItem>
                      <SelectItem value="constructeur">Constructeur</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal_name">Raison sociale</Label>
                  <Input 
                    id="legal_name" 
                    value={form.legal_name} 
                    onChange={e => setForm({ ...form, legal_name: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input 
                    id="siret" 
                    value={form.siret} 
                    onChange={e => setForm({ ...form, siret: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION CONTACT --- */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider border-b pb-1">
                Contact & Visibilité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input 
                    id="phone" 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="website">Site internet</Label>
                  <Input 
                    id="website" 
                    type="url" 
                    placeholder="https://www.exemple.com"
                    value={form.website} 
                    onChange={e => setForm({ ...form, website: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION ADRESSE --- */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold  uppercase tracking-wider border-b pb-1">
                Localisation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="street_address">Adresse (Rue)</Label>
                  <Input 
                    id="street_address" 
                    value={form.street_address} 
                    onChange={e => setForm({ ...form, street_address: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">Code Postal</Label>
                  <Input 
                    id="zip_code" 
                    value={form.zip_code} 
                    onChange={e => setForm({ ...form, zip_code: e.target.value })} 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input 
                    id="city" 
                    value={form.city} 
                    onChange={e => setForm({ ...form, city: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Région</Label>
                  <Input 
                    id="region" 
                    value={form.region} 
                    onChange={e => setForm({ ...form, region: e.target.value })} 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input 
                    id="country" 
                    value={form.country} 
                    onChange={e => setForm({ ...form, country: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* --- FEEDBACK & SUBMIT --- */}
            <div className="pt-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md text-center border border-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md text-center border border-green-100">
                  Profil professionnel mis à jour avec succès !
                </div>
              )}
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={saving}>
                {saving ? 'Enregistrement en cours...' : 'Sauvegarder les modifications'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}