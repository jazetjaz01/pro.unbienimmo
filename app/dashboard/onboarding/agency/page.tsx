"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OnboardingAgencyPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(2);

  const [form, setForm] = useState({
    name: "",
    type: "",
    siret: "",
    vat_number: "",
    phone: "",
    website: "",
    street_address: "",
    city: "",
    zip_code: "",
  });

  useEffect(() => {
    const fetchAgencyData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const [agencyRes, profileRes] = await Promise.all([
        supabase.from("professionals").select("*").eq("owner_id", user.id).single(),
        supabase.from("profiles").select("onboarding_step").eq("id", user.id).single(),
      ]);

      if (agencyRes.data) {
        setForm({
          name: agencyRes.data.name ?? "",
          type: agencyRes.data.type ?? "",
          siret: agencyRes.data.siret ?? "",
          vat_number: agencyRes.data.vat_number ?? "",
          phone: agencyRes.data.phone ?? "",
          website: agencyRes.data.website ?? "",
          street_address: agencyRes.data.street_address ?? "",
          city: agencyRes.data.city ?? "",
          zip_code: agencyRes.data.zip_code ?? "",
        });
      }
      if (profileRes.data) setCurrentStep(profileRes.data.onboarding_step ?? 2);
      setLoading(false);
    };
    fetchAgencyData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const cleanSiret = form.siret.replace(/\s/g, "");
    
    // Validation stricte incluant la TVA
    if (!form.name.trim() || !form.type || cleanSiret.length !== 14 || !form.vat_number.trim()) {
      setSaving(false);
      return setError("Le nom, le type, le SIRET et le numéro de TVA sont obligatoires.");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setSaving(false);

    const { error: agencyError } = await supabase.from("professionals").upsert(
      {
        owner_id: user.id,
        ...form,
        siret: cleanSiret,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id" }
    );

    if (!agencyError) {
      const nextStep = currentStep >= 5 ? currentStep : 3;
      await supabase.from("profiles").update({ onboarding_step: nextStep }).eq("id", user.id);
      router.push("/dashboard/onboarding");
    } else {
      setError(agencyError.message);
      setSaving(false);
    }
  };

  const inputStyle = "h-[56px] rounded-xl border-zinc-300 focus:border-black focus:ring-1 focus:ring-black text-lg px-4 transition-all bg-white";
  const labelStyle = "text-sm font-medium text-zinc-500 mb-2 block";

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-zinc-900" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-24 min-h-screen bg-white text-[#222222]">
      
      <Link href="/dashboard/onboarding" className="inline-flex p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors mb-8">
        <ArrowLeft size={20} strokeWidth={2.5} />
      </Link>

      <div className="mb-12">
        <h1 className="text-[32px] font-semibold leading-9 tracking-tight">
          Identité de votre société
        </h1>
        <p className="text-zinc-500 mt-3 text-lg">
          Données légales nécessaires pour la diffusion et la facturation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SECTION IDENTIFICATION */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className={labelStyle}>Nom entreprise</label>
            <Input
              className={inputStyle}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Agence Immobilière de Provence"
              required
            />
          </div>

          <div className="space-y-2">
            <label className={labelStyle}>Activité principale</label>
            <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
              <SelectTrigger className="h-14 rounded-xl border-zinc-300 focus:ring-black text-lg px-4">
                <SelectValue placeholder="Choisir un secteur" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200">
                <SelectItem value="agence immobilière">Agence immobilière</SelectItem>
                <SelectItem value="notaire">Notaire</SelectItem>
                <SelectItem value="promoteur">Promoteur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelStyle}>SIRET (14 chiffres)</label>
              <Input
                className={cn(inputStyle, "font-mono")}
                value={form.siret}
                onChange={(e) => setForm({ ...form, siret: e.target.value.replace(/\D/g, "").slice(0, 14) })}
                placeholder="000 000 000 00000"
                required
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>Numéro de TVA intracommunautaire</label>
              <Input
                className={cn(inputStyle, "font-mono uppercase")}
                value={form.vat_number}
                onChange={(e) => setForm({ ...form, vat_number: e.target.value.trim() })}
                placeholder="FR00000000000"
                required
              />
              <Link 
                href="https://www.service-public.fr/professionnels-entreprises/vosdroits/F23570" 
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 underline hover:text-zinc-600 mt-1 transition-colors"
              >
                <HelpCircle size={12} strokeWidth={2.5} />
                Où trouver mon numéro de TVA ?
              </Link>
            </div>
          </div>
        </div>

        <div className="py-2 border-b border-zinc-200" />

        {/* SECTION ADRESSE */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className={labelStyle}>Siège social (Adresse)</label>
            <Input
              className={inputStyle}
              value={form.street_address}
              onChange={(e) => setForm({ ...form, street_address: e.target.value })}
              placeholder="Numéro et nom de la rue"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelStyle}>Code postal</label>
              <Input
                className={inputStyle}
                value={form.zip_code}
                onChange={(e) => setForm({ ...form, zip_code: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                placeholder="75000"
                required
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>Ville</label>
              <Input
                className={inputStyle}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Paris"
                required
              />
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium flex items-center gap-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="pt-8 border-t border-zinc-100">
          <Button 
            type="submit" 
            disabled={saving}
            className="w-full md:w-auto min-w-55 h-13.5 bg-[#222222] hover:bg-black text-white rounded-xl text-base font-semibold shadow-none transition-all active:scale-[0.98]"
          >
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <span className="flex items-center gap-2">
                Enregistrer et continuer <ArrowRight size={18} />
              </span>
            )}
          </Button>
          <p className="mt-4 text-[13px] text-zinc-500">
            En cliquant sur Continuer, vous certifiez l'exactitude de ces informations.
          </p>
        </div>
      </form>
    </div>
  );
}

// Fonction utilitaire simple pour l'icône d'alerte (si non importée)
function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
}