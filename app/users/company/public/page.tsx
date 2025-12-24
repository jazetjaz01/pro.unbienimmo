'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon, Globe, Phone, MapPin, Layout, Check, AlertCircle, AlignLeft } from 'lucide-react'

// --- COMPOSANT DROPZONE MINIMALISTE ---
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
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }, 
    multiple: false 
  })

  return (
    <div className="space-y-3 w-full">
      <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{label}</Label>
      <div {...getRootProps()} className={`relative group flex flex-col items-center justify-center border border-gray-100 transition-all duration-300 cursor-pointer overflow-hidden ${aspect === 'square' ? 'aspect-square max-w-[160px]' : 'aspect-video w-full'} ${isDragActive ? 'bg-gray-50' : 'bg-white hover:border-gray-900'}`}>
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-900" />
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload className="text-white h-5 w-5" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-gray-900">
            <ImageIcon className="h-5 w-5" />
            <span className="text-[10px] uppercase font-bold tracking-tighter">Ajouter</span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- PAGE PRINCIPALE ---
export default function PublicPageSettings() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    type: '',
    description: '',
    street_address: '',
    city: '',
    zip_code: '',
    phone: '',
    website: '',
    logo_url: '',
    banner_url: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data } = await supabase.from('professionals').select('*').eq('owner_id', user.id).single()
      if (data) setForm({
        name: data.name ?? '',
        type: data.type ?? '',
        description: data.description ?? '',
        street_address: data.street_address ?? '',
        city: data.city ?? '',
        zip_code: data.zip_code ?? '',
        phone: data.phone ?? '',
        website: data.website ?? '',
        logo_url: data.logo_url ?? '',
        banner_url: data.banner_url ?? '',
      })
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleUpload = async (file: File, field: 'logo_url' | 'banner_url') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const path = `${user.id}/${field}-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('company-assets').upload(path, file, { upsert: true })
    if (error) return setStatus({ type: 'error', msg: error.message })
    const { data: { publicUrl } } = supabase.storage.from('company-assets').getPublicUrl(path)
    setForm(prev => ({ ...prev, [field]: publicUrl }))
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('professionals').upsert({ owner_id: user?.id, ...form, updated_at: new Date().toISOString() }, { onConflict: 'owner_id' })
    if (error) setStatus({ type: 'error', msg: "Erreur lors de la sauvegarde" })
    else {
      setStatus({ type: 'success', msg: "Vitrine mise à jour" })
      setTimeout(() => setStatus(null), 3000)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-20 border-b border-gray-100 pb-8 text-left">
        <div className="flex items-center gap-3 mb-2 text-gray-400">
          <Layout className="h-4 w-4" />
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold">Marketing & Vitrine</p>
        </div>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Ma Vitrine Publique</h1>
      </div>

      <form onSubmit={onSave} className="space-y-24">
        
        {/* --- VISUELS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Identité Visuelle</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Votre logo et votre image de couverture pour la page agence.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
            <FileDropzone label="Logo" value={form.logo_url} onUpload={(f) => handleUpload(f, 'logo_url')} />
            <div className="sm:col-span-2">
              <FileDropzone label="Bannière" value={form.banner_url} onUpload={(f) => handleUpload(f, 'banner_url')} aspect="video" />
            </div>
          </div>
        </section>

        {/* --- PRÉSENTATION --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">À propos</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Rédigez un texte captivant pour vos futurs clients.</p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Biographie de l'agence</Label>
            <Textarea 
              className="rounded-none border border-gray-100 focus-visible:ring-0 focus-visible:border-gray-900 p-4 min-h-[160px] resize-none text-sm leading-relaxed"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Décrivez votre expertise immobilière..."
            />
          </div>
        </section>

        {/* --- COORDONNÉES --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Coordonnées</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Ces informations seront visibles par le public.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom commercial</Label>
              <Input className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 shadow-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Activité</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger className="rounded-none border-0 border-b border-gray-200 focus:ring-0 px-0 shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-none"><SelectItem value="agence">Agence immobilière</SelectItem><SelectItem value="syndic">Syndic</SelectItem><SelectItem value="notaire">Notaire</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Téléphone public</Label>
              <Input className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 shadow-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Site internet</Label>
              <Input className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 shadow-none" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Adresse de l'agence</Label>
              <Input className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 shadow-none" value={form.street_address} onChange={e => setForm({...form, street_address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Code Postal</Label>
              <Input className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 shadow-none" value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Ville</Label>
              <Input className="rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 shadow-none" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            </div>
          </div>
        </section>

        {/* --- FOOTER / ACTIONS --- */}
        <div className="pt-10 border-t border-gray-900 border-opacity-10 flex flex-col items-end gap-6 pb-20">
          {status && (
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] ${status.type === 'success' ? 'text-gray-900' : 'text-red-500'}`}>
              {status.type === 'success' ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {status.msg}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full md:w-auto h-14 px-16 bg-gray-900 hover:bg-black text-white rounded-none text-xs font-bold uppercase tracking-[0.2em] transition-all" 
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Mettre à jour la vitrine'}
          </Button>
        </div>
      </form>
    </div>
  )
}