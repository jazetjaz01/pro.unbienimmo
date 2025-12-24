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
import { Loader2, ArrowRight, Zap, Leaf, Hash, Calendar, Info } from 'lucide-react'

const ENERGY_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export default function Step6Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { listing, updateListing, isLoading: contextLoading } = useListing()
  
  const [loading, setLoading] = React.useState(false)
  const [diagData, setDiagData] = React.useState({
    dpe_not_applicable: false,
    ademe_number: '',
    energy_consumption: '',
    energy_class: '',
    ghg_emissions: '',
    ghg_class: '',
    diagnostic_date: '',
    energy_reference_year: '', // Stockera la mention ex: "Janvier 2021" ou "01/01/2021"
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
        energy_reference_year: listing.energy_reference_year || '',
        annual_energy_cost_min: listing.annual_energy_cost_min?.toString() || '',
        annual_energy_cost_max: listing.annual_energy_cost_max?.toString() || ''
      })
    }
  }, [listing])

  const handleNumberChange = (field: string, value: string) => {
    if (parseFloat(value) < 0) return
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
      energy_reference_year: diagData.energy_reference_year,
      step_completed: 6
    }

    try {
      const { data, error } = await supabase.from('listings').update(payload).eq('id', params.id).select().single()
      if (error) throw error
      updateListing(data)
      router.push(`/dashboard/listings/${params.id}/edit/step-7`)
    } catch (error) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 text-lg transition-colors bg-transparent shadow-none w-full appearance-none"

  if (contextLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-20 border-b border-gray-100 pb-8 text-left">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Étape 06 / 08</p>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Performance Énergétique</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-24">
        
        {/* --- EXEMPTION --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Dispense</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Le DPE est obligatoire pour la diffusion sauf exceptions légales.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between p-8 border border-gray-50 bg-gray-50/30">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-900">Bien non soumis au DPE</Label>
                <p className="text-[11px] text-gray-400">Cochez si le bien n'est pas soumis à l'obligation.</p>
              </div>
              <Switch 
                checked={diagData.dpe_not_applicable}
                onCheckedChange={(val) => setDiagData({...diagData, dpe_not_applicable: val})}
                className="data-[state=checked]:bg-gray-900"
              />
            </div>
          </div>
        </section>

        <div className={`space-y-24 transition-all duration-500 ${diagData.dpe_not_applicable ? "opacity-20 grayscale pointer-events-none" : "opacity-100"}`}>
          
          {/* --- IDENTIFICATION --- */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
            <div className="md:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Identification</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Références officielles du diagnostic.</p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Numéro ADEME</Label>
                <div className="relative">
                  <Input 
                    placeholder="Ex: 2134E1234567W" 
                    className={minimalInput} 
                    value={diagData.ademe_number} 
                    onChange={(e) => setDiagData({...diagData, ademe_number: e.target.value})} 
                  />
                  <Hash className="absolute right-0 top-3 h-4 w-4 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Date du diagnostic</Label>
                <div className="relative">
                  <Input 
                    type="date" 
                    className={minimalInput} 
                    value={diagData.diagnostic_date} 
                    onChange={(e) => setDiagData({...diagData, diagnostic_date: e.target.value})} 
                  />
                  <Calendar className="absolute right-0 top-3 h-4 w-4 text-gray-300 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* --- PERFORMANCE --- */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
            <div className="md:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Résultats</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Classes énergétiques et climatiques.</p>
            </div>
            <div className="md:col-span-2 space-y-16">
              {/* DPE */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">DPE (Énergie)</Label>
                  <span className="text-[10px] font-mono text-gray-300">kWh/m²/an</span>
                </div>
                <div className="flex border-b border-gray-100 pb-4">
                  {ENERGY_CLASSES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDiagData({...diagData, energy_class: c})}
                      className={`flex-1 py-3 text-xs font-bold transition-all border-r last:border-r-0 border-white ${diagData.energy_class === c ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <Input type="number" placeholder="Valeur DPE" className={minimalInput} value={diagData.energy_consumption} onChange={(e) => handleNumberChange('energy_consumption', e.target.value)} />
              </div>

              {/* GES */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">GES (Climat)</Label>
                  <span className="text-[10px] font-mono text-gray-300">kg CO2/m²/an</span>
                </div>
                <div className="flex border-b border-gray-100 pb-4">
                  {ENERGY_CLASSES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDiagData({...diagData, ghg_class: c})}
                      className={`flex-1 py-3 text-xs font-bold transition-all border-r last:border-r-0 border-white ${diagData.ghg_class === c ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <Input type="number" placeholder="Valeur GES" className={minimalInput} value={diagData.ghg_emissions} onChange={(e) => handleNumberChange('ghg_emissions', e.target.value)} />
              </div>
            </div>
          </section>

          {/* --- ESTIMATION & INDEXATION --- */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
            <div className="md:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Estimation Financière</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Mention obligatoire sur l'indexation des prix.</p>
            </div>
            
            <div className="md:col-span-2 space-y-12">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Prix Min (€/an)</Label>
                  <Input type="number" className={minimalInput} value={diagData.annual_energy_cost_min} onChange={(e) => handleNumberChange('annual_energy_cost_min', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Prix Max (€/an)</Label>
                  <Input type="number" className={minimalInput} value={diagData.annual_energy_cost_max} onChange={(e) => handleNumberChange('annual_energy_cost_max', e.target.value)} />
                </div>
              </div>

              <div className="space-y-6 bg-gray-50/50 p-8 border border-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-4 w-4 text-gray-900" />
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Date de référence des prix</Label>
                </div>
                
                <div className="space-y-6">
                  <div className="max-w-md">
                    <Label className="text-[11px] text-gray-400 uppercase font-bold mb-2 block tracking-tight">Mois et année de référence (ex: Janvier 2021)</Label>
                    <Input 
                      type="text" 
                      placeholder="Ex: 1er Janvier 2021" 
                      className={`${minimalInput} text-base h-10`} 
                      value={diagData.energy_reference_year} 
                      onChange={(e) => setDiagData({...diagData, energy_reference_year: e.target.value})} 
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">Aperçu de la mention légale :</p>
                    <p className="text-xs text-gray-600 leading-relaxed italic italic">
                      "Prix moyens des énergies indexés au <span className="text-gray-900 font-bold underline decoration-gray-300 underline-offset-4">{diagData.energy_reference_year || "[Date non saisie]"}</span> (abonnements compris)"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --- FOOTER --- */}
        <div className="pt-10 border-t border-gray-900 border-opacity-10 flex items-center justify-between pb-20">
          <button type="button" onClick={() => router.back()} className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors">
            Retour
          </button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="rounded-none bg-gray-900 hover:bg-black text-white h-14 px-12 transition-all uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="flex items-center gap-2">Suivant <ArrowRight className="h-4 w-4" /></span>}
          </Button>
        </div>
      </form>
    </div>
  )
}