'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check, AlertCircle, ArrowRight } from 'lucide-react'

export default function UserProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, email')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') setError(error.message)
      if (data) setForm({
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
      })

      setLoading(false)
    }

    fetchProfile()
  }, [supabase])

  const validateForm = () => {
    if (!form.first_name.trim()) return 'Le prénom est obligatoire.'
    if (!form.last_name.trim()) return 'Le nom est obligatoire.'
    if (!form.email.trim()) return "L'adresse e-mail est obligatoire."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const validationError = validateForm()
    if (validationError) return setError(validationError)

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setSaving(false)

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim(),
      updated_at: new Date().toISOString(),
    })

    if (error) setError(error.message)
    else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    }
    setSaving(false)
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 text-lg transition-colors bg-transparent shadow-none"

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER EDITORIAL */}
      <div className="mb-20 border-b border-gray-100 pb-8 text-left">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Compte Utilisateur</p>
        <h1 className="text-4xl font-light tracking-tight text-gray-900 italic">Profil Principal</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-24">
        
        {/* SECTION: IDENTITÉ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Identité</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              "Vos informations officielles utilisées pour vos communications professionnelles."
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Prénom</Label>
              <Input
                required
                className={minimalInput}
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                placeholder="Ex: Jean"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom</Label>
              <Input
                required
                className={minimalInput}
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                placeholder="Ex: Dupont"
              />
            </div>
          </div>
        </section>

        {/* SECTION: CONTACT */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Coordonnées</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Moyens de contact pour vos clients et la plateforme.
            </p>
          </div>

          <div className="md:col-span-2 space-y-12">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Adresse e-mail</Label>
              <Input
                type="email"
                required
                className={minimalInput}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="nom@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Téléphone portable</Label>
              <Input
                className={minimalInput}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="06 00 00 00 00"
              />
            </div>
          </div>
        </section>

        {/* MESSAGES & ACTION */}
        <div className="pt-10 flex flex-col items-end gap-6 border-t border-gray-900 border-opacity-10">
          
          <div className="w-full md:w-2/3">
            {error && (
              <div className="flex items-center gap-3 text-rose-500 mb-4">
                <AlertCircle size={14} />
                <span className="text-[10px] uppercase tracking-widest font-bold">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-3 text-emerald-500 mb-4">
                <Check size={14} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Profil synchronisé avec succès</span>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="rounded-none bg-gray-900 hover:bg-black text-white h-16 px-16 transition-all uppercase text-xs tracking-[0.3em] font-bold disabled:opacity-20 shadow-2xl"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-4">
                Mettre à jour <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}