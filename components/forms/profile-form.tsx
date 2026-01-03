"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check, AlertCircle, ArrowRight } from 'lucide-react'
import { toast } from "sonner"

interface ProfileFormProps {
  isOnboarding?: boolean
}

export function ProfileForm({ isOnboarding = false }: ProfileFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    onboarding_step: 1
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          onboarding_step: data.onboarding_step ?? 1
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")

      // Logique de progression : step 1 -> 2 uniquement si on est en onboarding
      const nextStep = (isOnboarding && form.onboarding_step === 1) ? 2 : form.onboarding_step

      const { error } = await supabase.from('profiles').update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        onboarding_step: nextStep,
        is_pro: true,
      }).eq('id', user.id)

      if (error) throw error

      toast.success("Profil mis à jour")
      
      if (isOnboarding) {
        router.push('/dashboard/onboarding/agency') // Direction étape 2
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 text-lg transition-colors bg-transparent shadow-none"

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Prénom</Label>
          <Input className={minimalInput} value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom</Label>
          <Input className={minimalInput} value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email</Label>
          <Input className={minimalInput} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Téléphone</Label>
          <Input className={minimalInput} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <Button 
          type="submit" 
          disabled={saving}
          className="rounded-none bg-black text-white px-12 h-14 uppercase text-[10px] tracking-[0.3em] font-bold"
        >
          {saving ? <Loader2 className="animate-spin" /> : (
            <span className="flex items-center gap-2">
              {isOnboarding ? "Continuer" : "Enregistrer les modifications"}
              <ArrowRight size={14} />
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}