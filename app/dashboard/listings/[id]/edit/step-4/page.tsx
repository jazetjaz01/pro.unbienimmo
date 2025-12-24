'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Car, Grid, Sun, Sunrise, Sunset, Cloud, 
  UserCheck, Video, ThermometerSnowflake, Flame, Zap, 
  Euro, Warehouse, SquareParking, Archive, Columns,
  Loader2, ArrowRight, Check
} from 'lucide-react'

const AMENITIES = [
  { id: 'parking_collectif', label: 'Parking collectif', icon: Car, category: 'Stationnement' },
  { id: 'parking_individuel', label: 'Parking individuel', icon: SquareParking, category: 'Stationnement' },
  { id: 'garage_individuel', label: 'Garage individuel', icon: Warehouse, category: 'Stationnement' },
  { id: 'cave', label: 'Cave', icon: Archive, category: 'Stockage' },
  { id: 'volets_electriques', label: 'Volets électriques', icon: Columns, category: 'Confort' },
  { id: 'double_vitrage', label: 'Double vitrage', icon: Grid, category: 'Confort' },
  { id: 'concierge', label: 'Concierge', icon: UserCheck, category: 'Services' },
  { id: 'camera_interieure', label: 'Caméra intérieure', icon: Video, category: 'Sécurité' },
  { id: 'expo_sud', label: 'Sud', icon: Sun, category: 'Exposition' },
  { id: 'expo_est', label: 'Est', icon: Sunrise, category: 'Exposition' },
  { id: 'expo_ouest', label: 'Ouest', icon: Sunset, category: 'Exposition' },
  { id: 'expo_nord', label: 'Nord', icon: Cloud, category: 'Exposition' },
]

const HEATING_TYPES = [
  { id: 'chauffage_collectif', label: 'Collectif', icon: ThermometerSnowflake },
  { id: 'chauffage_indiv_gaz', label: 'Indiv. Gaz', icon: Flame },
  { id: 'chauffage_indiv_elec', label: 'Indiv. Élec', icon: Zap },
]

export default function Step4Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { listing, updateListing, isLoading: contextLoading } = useListing()

  const [loading, setLoading] = React.useState(false)
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([])
  
  const [financialData, setFinancialData] = React.useState({
    property_tax: '',
    condo_fees_annual: '',
    heating_type: ''
  })

  const categories = Array.from(new Set(AMENITIES.map(a => a.category)))

  React.useEffect(() => {
    if (listing) {
      setFinancialData({
        property_tax: listing.property_tax?.toString() || '',
        condo_fees_annual: listing.condo_fees_annual?.toString() || '',
        heating_type: listing.heating_type || ''
      })

      const fetchFeatures = async () => {
        const { data } = await supabase
          .from('listing_features')
          .select('features(slug)')
          .eq('listing_id', params.id)
        
        if (data) {
          const slugs = data.map((f: any) => f.features.slug)
          setSelectedFeatures(slugs)
        }
      }
      fetchFeatures()
    }
  }, [listing, params.id, supabase])

  const toggleFeature = (slug: string) => {
    setSelectedFeatures(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: updatedListing, error: listError } = await supabase
        .from('listings')
        .update({
          property_tax: financialData.property_tax || null,
          condo_fees_annual: financialData.condo_fees_annual || null,
          heating_type: financialData.heating_type,
          step_completed: 4
        })
        .eq('id', params.id)
        .select().single()

      if (listError) throw listError

      await supabase.from('listing_features').delete().eq('listing_id', params.id)
      
      if (selectedFeatures.length > 0) {
        const { data: featureRows } = await supabase
          .from('features')
          .select('id, slug')
          .in('slug', selectedFeatures)

        if (featureRows) {
          const insertData = featureRows.map(f => ({
            listing_id: params.id,
            feature_id: f.id
          }))
          await supabase.from('listing_features').insert(insertData)
        }
      }

      updateListing(updatedListing)
      router.push(`/dashboard/listings/${params.id}/edit/step-5`)
    } catch (error) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 text-lg transition-colors bg-transparent shadow-none w-full"

  if (contextLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-20 border-b border-gray-100 pb-8 text-left">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Étape 04 / 08</p>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Équipements & Coûts</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-24">
        
        {/* --- SECTION FINANCES --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Frais Annuels</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Indiquez les charges liées à la possession ou l'usage du bien.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-slate-400">Taxe Foncière (€/an)</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  className={minimalInput}
                  value={financialData.property_tax}
                  onChange={(e) => setFinancialData({...financialData, property_tax: e.target.value})}
                />
                <Euro className="absolute right-0 top-3 h-4 w-4 text-gray-300" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Charges Copro (€/an)</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  className={minimalInput}
                  value={financialData.condo_fees_annual}
                  onChange={(e) => setFinancialData({...financialData, condo_fees_annual: e.target.value})}
                />
                <Euro className="absolute right-0 top-3 h-4 w-4 text-gray-300" />
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION CHAUFFAGE --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Énergie</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Le type de chauffage principal du bien.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HEATING_TYPES.map((type) => {
              const isActive = financialData.heating_type === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFinancialData({...financialData, heating_type: type.id})}
                  className={`flex flex-col items-center justify-center gap-3 p-6 border transition-all ${isActive ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                >
                  <type.icon className={`h-5 w-5 ${isActive ? 'text-gray-900' : 'text-gray-300'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-gray-900' : ''}`}>{type.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* --- SECTION ÉQUIPEMENTS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Équipements</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Cochez les prestations incluses.</p>
          </div>
          <div className="md:col-span-2 space-y-16">
            {categories.map((category) => (
              <div key={category} className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-300">{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {AMENITIES.filter(a => a.category === category).map((item) => {
                    const isSelected = selectedFeatures.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleFeature(item.id)}
                        className={`group relative flex items-center gap-4 p-4 border transition-all ${isSelected ? 'border-gray-900 bg-white' : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'}`}
                      >
                        <item.icon className={`h-4 w-4 ${isSelected ? 'text-gray-900' : 'text-gray-300 group-hover:text-gray-400'}`} />
                        <span className={`text-[11px] font-medium leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{item.label}</span>
                        {isSelected && <Check className="absolute right-3 h-3 w-3 text-gray-900" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- FOOTER --- */}
        <div className="pt-10 border-t border-gray-900 border-opacity-10 flex items-center justify-between pb-20">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors"
          >
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