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
  Euro, Warehouse, SquareParking, Archive, Columns
} from 'lucide-react'

// Liste des features enrichie et catégorisée
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

  // Groupement des équipements par catégorie pour l'affichage
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

      // Synchro table de liaison
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
      toast.success("Informations enregistrées")
    } catch (error) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const airbnbInput = "h-14 text-lg border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all"

  if (contextLoading) return <div className="p-20 text-center animate-pulse text-gray-400">Chargement...</div>

  return (
    <div className="w-full max-w-2xl mx-auto pt-12 pb-20 px-6 font-sans">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Détails et équipements</h1>
        <span className="text-sm font-bold uppercase tracking-widest text-rose-500">Étape 4 sur 6</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* FINANCES */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Euro className="h-5 w-5" /> Coûts annuels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Taxe Foncière (€/an)</Label>
              <Input 
                type="number" 
                className={airbnbInput}
                value={financialData.property_tax}
                onChange={(e) => setFinancialData({...financialData, property_tax: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Charges Copro (€/an)</Label>
              <Input 
                type="number" 
                className={airbnbInput}
                value={financialData.condo_fees_annual}
                onChange={(e) => setFinancialData({...financialData, condo_fees_annual: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* CHAUFFAGE */}
        <section className="space-y-4">
          <Label className="text-xs font-bold uppercase text-gray-400">Type de Chauffage</Label>
          <div className="grid grid-cols-3 gap-3">
            {HEATING_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFinancialData({...financialData, heating_type: type.id})}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${financialData.heating_type === type.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <type.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* ÉQUIPEMENTS PAR CATÉGORIE */}
        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category} className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES.filter(a => a.category === category).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleFeature(item.id)}
                    className={`flex flex-col items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedFeatures.includes(item.id) ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* NAVIGATION */}
        <div className="pt-10 border-t flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="text-sm font-bold underline text-gray-900">Retour</button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="h-14 px-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg font-bold"
          >
            {loading ? "Chargement..." : "Suivant"}
          </Button>
        </div>
      </form>
    </div>
  )
}