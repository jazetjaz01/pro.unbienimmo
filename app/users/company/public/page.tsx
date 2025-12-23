'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea' // Ajout du composant Textarea
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon, Globe, Phone, MapPin, Building2, CheckCircle2, AlertCircle, AlignLeft } from 'lucide-react'

// --- COMPOSANT DROPZONE ---
function FileDropzone({ label, value, onUpload, aspect = "square" }: { label: string, value: string, onUpload: (file: File) => Promise<void>, aspect?: "square" | "video" }) {
  const [isUploading, setIsUploading] = useState(false)
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true)
      await onUpload(acceptedFiles[0])
      setIsUploading(false)
    }
  }, [onUpload])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }, multiple: false })

  return (
    <div className="space-y-3 w-full">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <div {...getRootProps()} className={`relative group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer shadow-sm ${aspect === 'square' ? 'aspect-square max-w-[180px]' : 'aspect-video w-full'} ${isDragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400'}`}>
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-blue-600"><Loader2 className="h-8 w-8 animate-spin" /><span className="text-xs font-medium">Envoi...</span></div>
        ) : value ? (
          <><img src={value} alt="Preview" className="w-full h-full object-cover rounded-xl" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-xl"><Upload className="text-white h-6 w-6 mb-1" /><p className="text-white text-[10px] font-bold uppercase">Remplacer</p></div></>
        ) : (
          <div className="flex flex-col items-center p-6 text-center text-slate-400"><ImageIcon className="h-6 w-6 mb-2" /><p className="text-xs font-semibold">Glissez-déposez</p></div>
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
    description: '', // Nouvelle colonne
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
    if (error) setStatus({ type: 'error', msg: error.message })
    else setStatus({ type: 'success', msg: "Modifications enregistrées !" })
    setSaving(false)
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>

  return (
   <div className="w-full max-w-2xl">
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg"><Building2 size={28} /></div>
            <div>
              <CardTitle className="text-2xl font-bold">Ma Vitrine Professionnelle</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Configurez l'image publique de votre agence</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={onSave} className="space-y-10">
            
            {/* --- VISUELS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <FileDropzone label="Logo" value={form.logo_url} onUpload={(f) => handleUpload(f, 'logo_url')} />
              <div className="lg:col-span-2">
                <FileDropzone label="Bannière de couverture" value={form.banner_url} onUpload={(f) => handleUpload(f, 'banner_url')} aspect="video" />
              </div>
            </div>

            {/* --- PRÉSENTATION --- */}
            <div className="space-y-4 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <AlignLeft size={16} /> Présentation de la société
              </h3>
              <div className="space-y-2">
                <Label htmlFor="description">Texte de présentation (Bio)</Label>
                <Textarea 
                  id="description"
                  rows={6}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Décrivez votre expertise, votre histoire et vos valeurs en quelques lignes..."
                  className="resize-none bg-white border-slate-200 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400">Ce texte apparaîtra sur votre page de profil publique.</p>
              </div>
            </div>

            {/* --- COORDONNÉES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-2">
                <Label>Nom commercial</Label>
                <Input className="bg-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Type d'activité</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Activité..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agence">Agence immobilière</SelectItem>
                    <SelectItem value="syndic">Syndic</SelectItem>
                    <SelectItem value="notaire">Notaire</SelectItem>
                    <SelectItem value="promoteur">Promoteur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone size={14}/> Téléphone</Label>
                <Input className="bg-white" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe size={14}/> Site internet</Label>
                <Input className="bg-white" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2"><MapPin size={14}/> Adresse (Rue)</Label>
                <Input className="bg-white" value={form.street_address} onChange={e => setForm({...form, street_address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Code Postal</Label>
                <Input className="bg-white" value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input className="bg-white" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              </div>
            </div>

            {/* --- ACTIONS --- */}
            <div className="pt-8 border-t space-y-4">
              {status && (
                <div className={`p-4 rounded-xl border flex items-center gap-2 text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {status.msg}
                </div>
              )}
              <Button type="submit" className="w-full h-14  font-bold rounded-2xl shadow-xl transition-all active:scale-95" disabled={saving}>
                {saving ? <><Loader2 className="animate-spin mr-2" /> Enregistrement...</> : "Mettre à jour ma vitrine"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}