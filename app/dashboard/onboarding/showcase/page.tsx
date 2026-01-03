"use client";

import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, ImageIcon, ArrowLeft, ArrowRight, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

// --- COMPOSANT DROPZONE STYLE AIRBNB ---
function FileDropzone({ label, value, onUpload, aspect = "square", description }: { label: string, value: string, onUpload: (file: File) => Promise<void>, aspect?: "square" | "video", description?: string }) {
  const [isUploading, setIsUploading] = useState(false);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      await onUpload(acceptedFiles[0]);
      setIsUploading(false);
    }
  }, [onUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg'] }, 
    multiple: false 
  });

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-zinc-900">{label}</label>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
      </div>
      <div {...getRootProps()} className={cn(
        "relative group flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl",
        aspect === 'square' ? 'aspect-square max-w-[200px]' : 'aspect-video w-full',
        isDragActive ? 'border-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50/50'
      )}>
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
            <span className="text-xs font-medium">Téléchargement...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
              <div className="bg-white rounded-full p-3 shadow-xl">
                <Upload className="text-zinc-900 h-5 w-5" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-zinc-400 group-hover:text-zinc-600 transition-colors">
            <div className="p-4 rounded-full bg-white shadow-sm border border-zinc-100">
               <ImageIcon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">Ajouter une image</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- PAGE PRINCIPALE ---
export default function ShowcaseOnboardingPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(3);

  const [form, setForm] = useState({
    name: '',
    type: '',
    description: '',
    phone: '',
    website: '',
    logo_url: '',
    banner_url: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const [proRes, profileRes] = await Promise.all([
        supabase.from('professionals').select('*').eq('owner_id', user.id).single(),
        supabase.from('profiles').select('onboarding_step').eq('id', user.id).single()
      ]);

      if (proRes.data) {
        setForm({
          name: proRes.data.name ?? '',
          type: proRes.data.type ?? '',
          description: proRes.data.description ?? '',
          phone: proRes.data.phone ?? '',
          website: proRes.data.website ?? '',
          logo_url: proRes.data.logo_url ?? '',
          banner_url: proRes.data.banner_url ?? '',
        });
      }
      if (profileRes.data) setCurrentStep(profileRes.data.onboarding_step ?? 3);
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const handleUpload = async (file: File, field: 'logo_url' | 'banner_url') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const fileExt = file.name.split('.').pop();
      const path = `${user.id}/${field}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(path);

      setForm(prev => ({ ...prev, [field]: publicUrl }));
    } catch (error: any) {
      setStatus({ type: 'error', msg: "Erreur lors de l'envoi de l'image" });
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    
    if (!form.description.trim() || !form.logo_url) {
      return setStatus({ type: 'error', msg: "Le logo et la description sont requis." });
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setSaving(false);

    const { error: proError } = await supabase.from('professionals').upsert({ 
      owner_id: user.id, 
      name: form.name,
      type: form.type,
      description: form.description,
      phone: form.phone,
      website: form.website,
      logo_url: form.logo_url,
      banner_url: form.banner_url,
      updated_at: new Date().toISOString() 
    }, { onConflict: 'owner_id' });

    if (!proError) {
      const nextStep = currentStep >= 5 ? currentStep : 4;
      await supabase.from('profiles').update({ onboarding_step: nextStep }).eq('id', user.id);
      router.push('/dashboard/onboarding');
    } else {
      setStatus({ type: 'error', msg: "Une erreur est survenue lors de la sauvegarde." });
      setSaving(false);
    }
  };

  const inputStyle = "h-[56px] rounded-xl border-zinc-300 focus:border-black focus:ring-1 focus:ring-black text-lg px-4 transition-all bg-white";
  const labelStyle = "text-sm font-medium text-zinc-500 mb-2 block";

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-zinc-900" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 pt-16 pb-24 min-h-screen bg-white text-[#222222]">
      
      <Link href="/dashboard/onboarding" className="inline-flex p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors mb-8">
        <ArrowLeft size={20} strokeWidth={2.5} />
      </Link>

      <div className="mb-12">
        <h1 className="text-[32px] font-semibold leading-[36px] tracking-tight">
          Vitrine de l'agence
        </h1>
        <p className="text-zinc-500 mt-3 text-lg">
          Personnalisez l'apparence de votre profil public pour attirer plus de clients.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-12">
        
        {/* VISUELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <FileDropzone 
            label="Logo de l'agence *" 
            description="Format carré recommandé (PNG, JPG)"
            value={form.logo_url} 
            onUpload={(f) => handleUpload(f, 'logo_url')} 
          />
          <FileDropzone 
            label="Bannière de couverture" 
            description="S'affiche en haut de votre vitrine"
            value={form.banner_url} 
            onUpload={(f) => handleUpload(f, 'banner_url')} 
            aspect="video" 
          />
        </div>

        <div className="py-2 border-b border-zinc-200" />

        {/* À PROPOS */}
        <div className="space-y-2">
          <label className={labelStyle}>Présentation de l'agence *</label>
          <Textarea 
            className="rounded-xl border-zinc-300 focus-visible:ring-black p-4 min-h-[160px] text-lg leading-relaxed shadow-none bg-white"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Décrivez votre expertise, votre histoire et vos valeurs..."
            required
          />
        </div>

        {/* CONTACTS PUBLICS */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelStyle}>Nom affiché</label>
              <Input 
                className={inputStyle} 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="Nom commercial"
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>Téléphone de contact</label>
              <Input 
                className={inputStyle} 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                placeholder="01 02 03 04 05"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelStyle}>Site internet</label>
            <Input 
              className={inputStyle} 
              value={form.website} 
              onChange={e => setForm({...form, website: e.target.value})} 
              placeholder="https://www.votre-agence.com" 
            />
          </div>
        </div>

        {/* STATUS MESSAGES */}
        {status && (
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-1",
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}>
            {status.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {status.msg}
          </div>
        )}

        {/* ACTIONS */}
        <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs text-zinc-500 max-w-xs text-center sm:text-left italic">
            * Ces informations seront visibles par les utilisateurs sur vos annonces publiques.
          </p>
          <Button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto min-w-[240px] h-[54px] bg-[#222222] hover:bg-black text-white rounded-xl text-base font-semibold shadow-none transition-all active:scale-[0.98]"
          >
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <span className="flex items-center gap-2">
                Enregistrer et continuer <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}