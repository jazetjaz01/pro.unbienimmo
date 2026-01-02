"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, Building2 } from "lucide-react"
import { toast } from "sonner"

export function JoinAgencyForm() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 5) return toast.error("Code trop court")

    setLoading(true)
    try {
      // On appelle la fonction SQL que nous venons de créer
      const { error } = await supabase.rpc('join_agency_by_code', { 
        input_code: code.trim().toUpperCase() 
      })

      if (error) throw error

      toast.success("Bienvenue dans votre agence !")
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Code invalide")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleJoin} className="space-y-8 p-8 bg-white border border-gray-100 shadow-xl max-w-md mx-auto">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="p-3 bg-gray-50 rounded-full">
          <Building2 className="h-6 w-6 text-gray-900" />
        </div>
        <h2 className="text-xl font-light italic">Rejoindre une agence</h2>
        <p className="text-xs text-gray-400">Entrez le code d'invitation fourni par votre administrateur.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Code d'invitation</Label>
        <Input 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex: UB-A1B2C"
          className="text-center font-mono text-lg tracking-widest h-14 rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900"
          maxLength={10}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-none uppercase text-[10px] font-bold tracking-[0.3em]"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Valider et rejoindre"}
      </Button>
    </form>
  )
}