"use client"

import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload, ImageIcon, Store, Check, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from "@/lib/utils"

// --- COMPOSANT DROPZONE PERSONNALISÉ ---
function FileDropzone({ label, value, onUpload, aspect = "square" }: { label: string, value: string, onUpload: (file: File) => Promise<void>, aspect?: "square" | "video" }) {
  const [isUploading, setIsUploading] = useState(false)
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true)
      await onUpload(acceptedFiles[0])
      setIsUploading(false)
    }
  }, [onUpload])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg'] }, 
    multiple: false 
  })

  return (
    <div className="space-y-3 w-full">
      <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{label}</Label>
      <div {...getRootProps()} className={cn(
        "relative group flex flex-col items-center justify-center border border-gray-100 transition-all duration-500 cursor-pointer overflow-hidden",
        aspect === 'square' ? 'aspect-square max-w-[160px]' : 'aspect-video w-full',
        isDragActive ? 'bg-orange-50 border-orange-500' : 'bg-white hover:border-gray-900'
      )}>
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover transition-all group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload className="text-white h-5 w-5" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-orange-600 transition-colors">
            <ImageIcon className="h-5 w-5" />
            <span className="text-[10px] uppercase font-bold tracking-tighter">Ajouter</span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- PAGE PRINCIPALE ---
export default function ShowcaseOnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(3)

  const [form, setForm] = useState({
    name: '',
    type: '', // Ajouté pour corriger la contrainte NOT NULL
    description: '',
    phone: '',
    website: '',
    logo_url: '',
    banner_url: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const [proRes, profileRes] = await Promise.all([
        supabase.from('professionals').select('*').eq('owner_id', user.id).single(),
        supabase.from('profiles').select('onboarding_step').eq('id', user.id).single()
      ])

      if (proRes.data) {
        setForm({
          name: proRes.data.name ?? '',
          type: proRes.data.type ?? '', // On récupère le type déjà enregistré
          description: proRes.data.description ?? '',
          phone: proRes.data.phone ?? '',
          website: proRes.data.website ?? '',
          logo_url: proRes.data.logo_url ?? '',
          banner_url: proRes.data.banner_url ?? '',
        })
      }
      if (profileRes.data) setCurrentStep(profileRes.data.onboarding_step ?? 3)
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleUpload = async (file: File, field: 'logo_url' | 'banner_url') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const fileExt = file.name.split('.').pop()
      const path = `${user.id}/${field}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(path)

      setForm(prev => ({ ...prev, [field]: publicUrl }))
    } catch (error: any) {
      setStatus({ type: 'error', msg: "Erreur upload : " + error.message })
    }
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    
    if (!form.description.trim() || !form.logo_url) {
      return setStatus({ type: 'error', msg: "Logo et description requis pour valider votre vitrine." })
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setSaving(false)

    // UPSERT : On inclut explicitement 'type' pour éviter l'erreur NOT NULL
    const { error: proError } = await supabase.from('professionals').upsert({ 
      owner_id: user.id, 
      name: form.name,
      type: form.type, // Champ critique
      description: form.description,
      phone: form.phone,
      website: form.website,
      logo_url: form.logo_url,
      banner_url: form.banner_url,
      updated_at: new Date().toISOString() 
    }, { onConflict: 'owner_id' })

    const nextStep = currentStep >= 5 ? currentStep : 4
    if (!proError && currentStep < 5) {
      await supabase.from('profiles').update({ onboarding_step: nextStep }).eq('id', user.id)
    }

    if (proError) {
      console.error("Erreur SQL:", proError)
      setStatus({ type: 'error', msg: "Erreur lors de la sauvegarde : " + proError.message })
    } else {
      setStatus({ type: 'success', msg: "Vitrine validée. Redirection..." })
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

      <div className="mb-20 border-b border-gray-100 pb-8 text-left">
        <div className="flex items-center gap-3 mb-2 text-gray-400">
          <Store className="h-4 w-4" />
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold">
            {currentStep >= 5 ? "Marketing & Vitrine" : "Étape 03"}
          </p>
        </div>
        <h1 className="text-4xl font-light tracking-tight text-gray-900 italic">Identité Visuelle</h1>
      </div>

      <form onSubmit={onSave} className="space-y-24">
        
        {/* SECTION 1: VISUELS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Visuels</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic border-l border-gray-100 pl-4">
              "Ces éléments définissent votre image de marque auprès des acquéreurs."
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
            <FileDropzone label="Logo Agence *" value={form.logo_url} onUpload={(f) => handleUpload(f, 'logo_url')} />
            <div className="sm:col-span-2">
              <FileDropzone label="Bannière Vitrine" value={form.banner_url} onUpload={(f) => handleUpload(f, 'banner_url')} aspect="video" />
            </div>
          </div>
        </section>

        {/* SECTION 2: DESCRIPTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">À propos</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic border-l border-gray-100 pl-4">
              "Décrivez votre expertise et vos secteurs de prédilection."
            </p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Biographie de l'agence *</Label>
            <Textarea 
              className="rounded-none border border-gray-100 focus-visible:ring-0 focus-visible:border-gray-900 p-6 min-h-[180px] resize-none text-sm leading-relaxed italic shadow-none bg-gray-50/30"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Ex: Spécialiste de l'immobilier de prestige depuis 1998..."
            />
          </div>
        </section>

        {/* SECTION 3: INFOS PUBLIQUES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Contacts Publics</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic border-l border-gray-100 pl-4">
              Ces informations seront affichées sur vos annonces.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom commercial</Label>
              <Input className={minimalInput} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Téléphone contact</Label>
              <Input className={minimalInput} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Site internet</Label>
              <Input className={minimalInput} value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://..." />
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <div className="pt-10 border-t border-gray-900 border-opacity-10 flex flex-col items-end gap-6 pb-20">
          {status && (
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
              status.type === 'success' ? 'text-orange-600' : 'text-rose-600'
            )}>
              {status.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {status.msg}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full md:w-auto h-16 px-16 bg-gray-900 hover:bg-orange-600 text-white rounded-none text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-2xl group" 
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : (
              <span className="flex items-center gap-3">
                Continuer vers l'abonnement <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}