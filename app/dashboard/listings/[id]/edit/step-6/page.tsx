'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Zap, Leaf, Calendar, Hash, Info } from 'lucide-react'

const ENERGY_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export default function Step6Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { listing, updateListing, isLoading } = useListing()
  
  const [loading, setLoading] = React.useState(false)
  const [diagData, setDiagData] = React.useState({
    dpe_not_applicable: false,
    ademe_number: '',
    energy_consumption: '',
    energy_class: '',
    ghg_emissions: '',
    ghg_class: '',
    diagnostic_date: '',
    energy_reference_year: '2021',
    annual_energy_cost_min: '',
    annual_energy_cost_max: ''
  })

  React.useEffect(() => {
    if (listing) {
      setDiagData({
        dpe_not_applicable: listing.dpe_not_applicable || false,
        ademe_number: listing.ademe_number || '',
        energy_consumption: listing.energy_consumption?.toString() || '',
        energy_class: listing.energy_class || '',
        ghg_emissions: listing.ghg_emissions?.toString() || '',
        ghg_class: listing.ghg_class || '',
        diagnostic_date: listing.diagnostic_date ? new Date(listing.diagnostic_date).toISOString().split('T')[0] : '',
        energy_reference_year: listing.energy_reference_year || '2021',
        annual_energy_cost_min: listing.annual_energy_cost_min?.toString() || '',
        annual_energy_cost_max: listing.annual_energy_cost_max?.toString() || ''
      })
    }
  }, [listing])

  // Fonction utilitaire pour empêcher les nombres négatifs
  const handleNumberChange = (field: string, value: string) => {
    const numValue = parseFloat(value)
    if (numValue < 0) return // Bloque la mise à jour si négatif
    setDiagData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...diagData,
      energy_consumption: diagData.dpe_not_applicable ? null : (Number(diagData.energy_consumption) || null),
      ghg_emissions: diagData.dpe_not_applicable ? null : (Number(diagData.ghg_emissions) || null),
      annual_energy_cost_min: diagData.dpe_not_applicable ? null : (Number(diagData.annual_energy_cost_min) || null),
      annual_energy_cost_max: diagData.dpe_not_applicable ? null : (Number(diagData.annual_energy_cost_max) || null),
      diagnostic_date: diagData.diagnostic_date || null,
      step_completed: 6
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .update(payload)
        .eq('id', params.id)
        .select().single()

      if (error) throw error
      updateListing(data)
      toast.success("Diagnostics enregistrés")
      router.push(`/dashboard/listings/${params.id}/edit/step-7`)
    } catch (error) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const airbnbInput = "h-14 text-lg border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-black transition-all disabled:opacity-30 disabled:bg-gray-50"

  if (isLoading) return <div className="p-20 text-center animate-pulse">Chargement...</div>

  return (
    <div className="w-full max-w-2xl mx-auto pt-12 pb-20 px-6 font-sans">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Diagnostic Performance Energetique</h1>
        <span className="text-sm font-bold uppercase tracking-widest text-rose-500">Étape 6 sur 7</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        <div className="flex items-center justify-between p-6 rounded-2xl border-2 border-gray-100 bg-gray-50/50">
          <div className="space-y-1">
            <Label className="text-base font-bold text-gray-900">Bien non soumis au DPE</Label>
            <p className="text-sm text-gray-500">Cochez si le bien n'est pas soumis à l'obligation de DPE.</p>
          </div>
          <Switch 
            checked={diagData.dpe_not_applicable}
            onCheckedChange={(val) => setDiagData({...diagData, dpe_not_applicable: val})}
          />
        </div>

        <div className={`space-y-12 transition-all duration-300 ${diagData.dpe_not_applicable ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
          
          {/* NUMÉRO ADEME */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2">
              <Hash className="h-4 w-4" /> Numéro ADEME
            </Label>
            <Input 
              placeholder="Numéro du DPE"
              className={airbnbInput}
              value={diagData.ademe_number}
              onChange={(e) => setDiagData({...diagData, ademe_number: e.target.value})}
            />
          </div>

          {/* DPE & GES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="font-bold flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" /> Consommation (DPE)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {ENERGY_CLASSES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDiagData({...diagData, energy_class: c})}
                    className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${diagData.energy_class === c ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Input 
                type="number" 
                min="0" // Empêche les flèches du navigateur d'aller en dessous de 0
                placeholder="kWh/m²/an" 
                className={airbnbInput}
                value={diagData.energy_consumption}
                onChange={(e) => handleNumberChange('energy_consumption', e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label className="font-bold flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-500" /> Gaz à effet de serre</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {ENERGY_CLASSES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDiagData({...diagData, ghg_class: c})}
                    className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${diagData.ghg_class === c ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Input 
                type="number" 
                min="0"
                placeholder="kg CO2/m²/an" 
                className={airbnbInput}
                value={diagData.ghg_emissions}
                onChange={(e) => handleNumberChange('ghg_emissions', e.target.value)}
              />
            </div>
          </div>

          {/* ESTIMATION COUTS */}
          <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <Label className="font-bold">Coûts annuels d'énergie estimés</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs text-gray-400 font-medium">Prix Min (€)</span>
                <Input 
                  type="number" 
                  min="0" 
                  className={airbnbInput} 
                  value={diagData.annual_energy_cost_min} 
                  onChange={(e) => handleNumberChange('annual_energy_cost_min', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs text-gray-400 font-medium">Prix Max (€)</span>
                <Input 
                  type="number" 
                  min="0" 
                  className={airbnbInput} 
                  value={diagData.annual_energy_cost_max} 
                  onChange={(e) => handleNumberChange('annual_energy_cost_max', e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="text-sm font-bold underline text-gray-900">Retour</button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="h-14 px-12 bg-black hover:bg-zinc-800 text-white rounded-xl shadow-lg font-bold transition-all active:scale-95"
          >
            {loading ? "Sauvegarde..." : "Suivant"}
          </Button>
        </div>
      </form>
    </div>
  )
}