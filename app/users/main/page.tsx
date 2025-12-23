'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, Mail, Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

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
      setTimeout(() => setSuccess(false), 5000) // Cache le message après 5s
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-muted-foreground animate-pulse">Chargement de votre profil...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="shadow-xl border-none bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-50 rounded-full text-teal-600">
              <User size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center tracking-tight">
            Utilisateur principal
          </CardTitle>
          <CardDescription className="text-center text-slate-500">
            Gérez vos informations personnelles et vos moyens de contact
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Prénom & Nom sur la même ligne */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">Prénom *</Label>
                <Input
                  id="first_name"
                  placeholder="Jean"
                  required
                  value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })}
                  className="bg-slate-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">Nom *</Label>
                <Input
                  id="last_name"
                  placeholder="Dupont"
                  required
                  value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })}
                  className="bg-slate-50/50"
                />
              </div>
            </div>

            {/* Email avec Icône */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Adresse e-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="pl-10 bg-slate-50/50"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            {/* Téléphone avec Icône */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="pl-10 bg-slate-50/50"
                  placeholder="06 00 00 00 00"
                />
              </div>
            </div>

            {/* Messages d'alerte */}
            <div className="pt-2">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-1">
                  <CheckCircle2 size={16} />
                  <span>Votre profil a été mis à jour avec succès.</span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 transition-colors shadow-md"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}