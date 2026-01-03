"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  isOnboarding?: boolean;
}

export function ProfileForm({ isOnboarding = false }: ProfileFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    onboarding_step: 1,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          onboarding_step: data.onboarding_step ?? 1,
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const nextStep = isOnboarding && form.onboarding_step === 1 ? 2 : form.onboarding_step;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          onboarding_step: nextStep,
          is_pro: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil mis à jour");
      if (isOnboarding) router.push("/dashboard/onboarding/agency");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Classe utilitaire pour le champ flottant
  const floatingContainer = "relative flex flex-col border-b last:border-b-0 border-zinc-200 focus-within:z-10 focus-within:ring-2 focus-within:ring-zinc-950 transition-all px-4 pt-5 pb-2";
  const floatingInput = "peer h-6 w-full border-0 p-0 text-zinc-900 placeholder-transparent focus-visible:ring-0 text-base font-normal";
  const floatingLabel = "absolute left-4 top-4 text-zinc-500 text-base transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-zinc-500 not-placeholder-shown:top-1.5 not-placeholder-shown:text-[11px] not-placeholder-shown:font-semibold";

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-zinc-400" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white">
          {/* GRILLE PRENOM / NOM */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-zinc-300">
            <div className={cn(floatingContainer, "md:border-r border-zinc-200")}>
              <Input
                id="first_name"
                placeholder="Prénom"
                className={floatingInput}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
              <label htmlFor="first_name" className={floatingLabel}>Prénom</label>
            </div>
            
            <div className={floatingContainer}>
              <Input
                id="last_name"
                placeholder="Nom"
                className={floatingInput}
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
              <label htmlFor="last_name" className={floatingLabel}>Nom</label>
            </div>
          </div>

          {/* EMAIL */}
          <div className={floatingContainer}>
            <Input
              id="email"
              type="email"
              placeholder="Adresse e-mail"
              className={floatingInput}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <label htmlFor="email" className={floatingLabel}>Adresse e-mail</label>
          </div>

          {/* TELEPHONE */}
          <div className={floatingContainer}>
            <Input
              id="phone"
              placeholder="Téléphone"
              className={floatingInput}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <label htmlFor="phone" className={floatingLabel}>Téléphone</label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400 max-w-[280px]">
            Airbnb utilise ce type de micro-interactions pour rendre la saisie plus fluide.
          </p>
          
          <Button
            type="submit"
            disabled={saving}
            className="h-12 px-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition-all active:scale-95"
          >
            {saving ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <span className="flex items-center gap-2">
                {isOnboarding ? "Suivant" : "Enregistrer"}
                <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}