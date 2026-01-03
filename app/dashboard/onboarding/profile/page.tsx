"use client"
import { cn } from "@/lib/utils"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, User, Check, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(1)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, onboarding_step')
        .eq('id', user.id)
        .single()

      if (profile) {
        setForm({
          first_name: profile.first_name ?? '',
          last_name: profile.last_name ?? '',
          email: profile.email ?? user.email ?? '', // Fallback sur l'email d'auth
          phone: profile.phone ?? '',
        })
        setCurrentStep(profile.onboarding_step ?? 1)
      }
      setLoading(false)
    }
    fetchProfileData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.first_name.trim() || !form.last_name.trim()) {
      return setError('Le nom et le prénom sont obligatoires.')
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setSaving(false)

    // Mise à jour du profil et passage au Step 2
    const nextStep = currentStep >= 5 ? currentStep : 2
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        onboarding_step: nextStep,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      // On redirige vers le dashboard pour que l'utilisateur voie la progression sur le tracker
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setSaving(false)
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-10 transition-colors bg-transparent shadow-none"

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-900" /></div>

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      <Link href="/dashboard" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors mb-12 group">
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        Retour au tracker
      </Link>

      <div className="mb-16 border-b border-gray-100 pb-8 text-left">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-5 w-5 text-gray-900" />
          <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase font-bold">
            {currentStep >= 5 ? "Profil" : "Étape 01"}
          </p>
        </div>
        <h1 className="text-4xl font-light tracking-tight text-gray-900 italic">Identité Leader</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-20">
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Informations Personnelles</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic">"Ces coordonnées nous permettent de personnaliser votre interface et vos échanges."</p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Prénom *</Label>
              <Input className={minimalInput} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Jean" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom *</Label>
              <Input className={minimalInput} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Dupont" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email (Lecture seule)</Label>
              <Input className={cn(minimalInput, "text-gray-400 cursor-not-allowed")} value={form.email} disabled />
              <p className="text-[9px] text-gray-300 italic mt-1">L'email est lié à votre compte d'authentification.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Téléphone Direct</Label>
              <Input className={minimalInput} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="06 .. .. .. .." />
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
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
              <Check className="h-4 w-4" /> Profil mis à jour. Étape suivante...
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={saving}
            className="w-full md:w-auto h-16 px-16 bg-gray-900 hover:bg-black text-white rounded-none text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-2xl"
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : (
              <span className="flex items-center gap-3">
                Valider mon profil <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}