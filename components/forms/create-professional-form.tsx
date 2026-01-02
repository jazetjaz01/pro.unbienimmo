"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Loader2, Check, AlertCircle, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function CreateProfessionalForm() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    type: "",
    siret: "",
    email: "",
    phone: "",
    street_address: "",
    city: "",
    zip_code: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // LOG de débogage
    console.log("🚀 Tentative d'enregistrement avec :", form)

    try {
      // 1. Vérification utilisateur
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Vous devez être connecté")

      // 2. Validation minimale manuelle (pour éviter les blocages Zod invisibles)
      if (!form.name || !form.siret || !form.type) {
        throw new Error("Le nom, le type et le SIRET sont obligatoires.")
      }

      const inviteCode = `UB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      // 3. Insertion de l'agence
      const { data: pro, error: proError } = await supabase
        .from('professionals')
        .insert({
          ...form,
          owner_id: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single()

      if (proError) throw proError

      // 4. Liaison Admin
      const { error: memberError } = await supabase
        .from('professional_members')
        .insert({
          professional_id: pro.id,
          profile_id: user.id,
          role: 'admin'
        })

      if (memberError) throw memberError

      // 5. Mise à jour de l'onboarding step dans le profil
      await supabase
        .from('profiles')
        .update({ onboarding_step: 2 })
        .eq('id', user.id)

      toast.success("Agence créée avec succès !")
      
      // On donne un petit délai pour être sûr que la DB est à jour avant de rediriger
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1000)

    } catch (err: any) {
      console.error("❌ Erreur :", err)
      setError(err.message || "Une erreur est survenue")
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 shadow-none bg-transparent"

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-2xl mx-auto p-8 bg-white shadow-sm border border-gray-100">
      <div className="space-y-2">
        <h2 className="text-2xl font-light italic tracking-tight">Configuration de l'agence</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Informations légales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom de l'agence *</Label>
          <Input 
            className={inputStyle} 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            placeholder="Ex: Agence Immobilière"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Type d'activité *</Label>
          <Select onValueChange={(v) => setForm({...form, type: v})} value={form.type}>
            <SelectTrigger className={inputStyle}>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agence immobilière">Agence immobilière</SelectItem>
              <SelectItem value="notaire">Notaire</SelectItem>
              <SelectItem value="promoteur">Promoteur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">SIRET (14 chiffres) *</Label>
          <Input 
            className={inputStyle} 
            value={form.siret} 
            onChange={e => setForm({...form, siret: e.target.value})} 
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email professionnel</Label>
          <Input 
            className={inputStyle} 
            type="email" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-col gap-6">
        {error && (
          <div className="flex items-center gap-2 text-rose-500 text-[10px] uppercase font-bold tracking-widest animate-pulse">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="h-14 bg-gray-900 hover:bg-black text-white rounded-none uppercase text-[10px] tracking-[0.3em] font-bold transition-all"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
            <span className="flex items-center gap-2">
              Enregistrer l'agence <ArrowRight size={14} />
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}