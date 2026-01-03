"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OnboardingProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, phone, onboarding_step")
        .eq("id", user.id)
        .single();

      if (profile) {
        setForm({
          first_name: profile.first_name ?? "",
          last_name: profile.last_name ?? "",
          email: profile.email ?? user.email ?? "",
          phone: profile.phone ?? "",
        });
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setSaving(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        onboarding_step: 2,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!updateError) router.push("/dashboard");
    setSaving(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-zinc-900" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-24 min-h-screen bg-white text-[#222222]">
      
      <Link href="/dashboard" className="inline-flex p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors mb-8">
        <ArrowLeft size={20} strokeWidth={2.5} />
      </Link>

      <div className="mb-12">
        <h1 className="text-[32px] font-semibold leading-[36px] tracking-tight">
          Modifier les détails du profil
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION NOM / PRENOM */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Prénom</label>
              <Input
                className="h-[56px] rounded-xl border-zinc-300 focus:border-black focus:ring-1 focus:ring-black text-lg px-4 transition-all"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Nom de famille</label>
              <Input
                className="h-[56px] rounded-xl border-zinc-300 focus:border-black focus:ring-1 focus:ring-black text-lg px-4 transition-all"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pt-4 pb-2 border-b border-zinc-200" />

          {/* EMAIL (LECTURE SEULE) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500">Adresse e-mail</label>
            <div className="flex justify-between items-center h-[56px] text-lg text-zinc-400">
              {form.email}
              <span className="text-xs font-semibold underline text-black cursor-not-allowed">Privé</span>
            </div>
            <p className="text-[13px] text-zinc-500">L'adresse e-mail est utilisée pour les notifications.</p>
          </div>

          <div className="pt-4 pb-2 border-b border-zinc-200" />

          {/* TELEPHONE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500">Numéro de téléphone</label>
            <Input
              className="h-[56px] rounded-xl border-zinc-300 focus:border-black focus:ring-1 focus:ring-black text-lg px-4 transition-all"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ajouter un numéro"
            />
          </div>
        </div>

        {/* BOUTON D'ACTION FIXE OU BAS DE PAGE */}
        <div className="pt-12">
          <Button 
            type="submit" 
            disabled={saving}
            className="w-full md:w-auto min-w-[180px] h-[52px] bg-[#222222] hover:bg-black text-white rounded-lg text-base font-semibold shadow-none transition-transform active:scale-[0.98]"
          >
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}