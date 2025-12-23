'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function Step2Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { listing, updateListing, isLoading } = useListing()
  const [loading, setLoading] = React.useState(false)

  const [localData, setLocalData] = React.useState({
    price_net: '',     
    price_fees: '',    
    fees_paid_by: 'vendeur',
    rent_base: '',
    rent_charges: '',
    surface_area_m2: '',
    room_count: '',
    bedroom_count: '',
    bathroom_count: '' // Ajouté
  })

  const isRental = listing?.transaction_type === 'location'

  React.useEffect(() => {
    if (listing) {
      setLocalData({
        price_net: listing.price_net?.toString() || '',
        price_fees: listing.price_fees?.toString() || '',
        fees_paid_by: listing.fees_paid_by || 'vendeur',
        rent_base: listing.rent_base?.toString() || '',
        rent_charges: listing.rent_charges?.toString() || '',
        surface_area_m2: listing.surface_area_m2?.toString() || '',
        room_count: listing.room_count?.toString() || '',
        bedroom_count: listing.bedroom_count?.toString() || '',
        bathroom_count: listing.bathroom_count?.toString() || '' // Ajouté
      })
    }
  }, [listing])

  const totalSalePrice = (Number(localData.price_net) || 0) + (Number(localData.price_fees) || 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!params.id || params.id === 'new') return
    setLoading(true)

    try {
      const updatePayload: any = {
        surface_area_m2: localData.surface_area_m2 ? Number(localData.surface_area_m2) : null,
        room_count: localData.room_count ? Number(localData.room_count) : null,
        bedroom_count: localData.bedroom_count ? Number(localData.bedroom_count) : null,
        bathroom_count: localData.bathroom_count ? Number(localData.bathroom_count) : null, // Ajouté
        step_completed: 2
      }

      if (isRental) {
        const base = Number(localData.rent_base) || 0
        const charges = Number(localData.rent_charges) || 0
        updatePayload.rent_base = base
        updatePayload.rent_charges = charges
        updatePayload.rent_total = base + charges
        updatePayload.price = null
        updatePayload.price_net = null
        updatePayload.price_fees = null
      } else {
        updatePayload.price_net = Number(localData.price_net) || 0
        updatePayload.price_fees = Number(localData.price_fees) || 0
        updatePayload.price = totalSalePrice
        updatePayload.fees_paid_by = localData.fees_paid_by
        updatePayload.rent_base = null
        updatePayload.rent_charges = null
        updatePayload.rent_total = null
      }

      const { data, error } = await supabase
        .from('listings')
        .update(updatePayload)
        .eq('id', params.id)
        .select().single()

      if (error) throw error
      updateListing(data)
      toast.success("Informations enregistrées")
      router.push(`/dashboard/listings/${params.id}/edit/step-3`)
    } catch (error: any) {
      console.error(error)
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const airbnbInput = "h-14 text-lg border-gray-200 rounded-xl focus-visible:ring-0 focus-visible:border-black transition-all"

  if (isLoading) return <div className="p-20 text-center animate-pulse text-gray-400 font-medium">Chargement des données...</div>

  return (
    <div className="w-full max-w-xl mx-auto pt-12 pb-20 px-6">
      <div className="mb-12 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Prix et dimensions</h1>
        <p className="text-lg text-gray-500">Étape 2 : Détails financiers et surface.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {!isRental && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Vendeur</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={localData.price_net} 
                    onChange={(e) => setLocalData({...localData, price_net: e.target.value})} 
                    className={airbnbInput} 
                    placeholder="0" 
                  />
                  <span className="absolute right-4 top-4 text-gray-400">€</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Honoraires</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={localData.price_fees} 
                    onChange={(e) => setLocalData({...localData, price_fees: e.target.value})} 
                    className={airbnbInput} 
                    placeholder="0" 
                  />
                  <span className="absolute right-4 top-4 text-gray-400">€</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Prix de vente FAI (Total)</p>
                <p className="text-4xl font-black text-gray-900">{totalSalePrice.toLocaleString()} €</p>
            </div>

            <div className="space-y-4 pt-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Honoraires à charge du</Label>
              <RadioGroup 
                value={localData.fees_paid_by} 
                onValueChange={(val) => setLocalData({ ...localData, fees_paid_by: val })}
                className="grid grid-cols-2 gap-3"
              >
                <div 
                  className={`flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer ${
                    localData.fees_paid_by === 'vendeur' ? 'border-black bg-gray-50' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem value="vendeur" id="vendeur" />
                  <Label htmlFor="vendeur" className="flex-1 cursor-pointer font-medium text-base">Vendeur</Label>
                </div>
                <div 
                  className={`flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer ${
                    localData.fees_paid_by === 'acquereur' ? 'border-black bg-gray-50' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem value="acquereur" id="acquereur" />
                  <Label htmlFor="acquereur" className="flex-1 cursor-pointer font-medium text-base">Acquéreur</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {isRental && (
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-3">
               <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loyer HC</Label>
               <div className="relative">
                <Input type="number" value={localData.rent_base} onChange={(e) => setLocalData({...localData, rent_base: e.target.value})} className={airbnbInput} />
                <span className="absolute right-4 top-4 text-gray-400">€</span>
               </div>
             </div>
             <div className="space-y-3">
               <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Charges</Label>
               <div className="relative">
                <Input type="number" value={localData.rent_charges} onChange={(e) => setLocalData({...localData, rent_charges: e.target.value})} className={airbnbInput} />
                <span className="absolute right-4 top-4 text-gray-400">€</span>
               </div>
             </div>
          </div>
        )}

        {/* SECTION CARACTÉRISTIQUES MISE À JOUR */}
        <div className="space-y-6 pt-10 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Surface (m²)</Label>
                    <Input 
                      type="number" 
                      value={localData.surface_area_m2} 
                      onChange={(e) => setLocalData({...localData, surface_area_m2: e.target.value})} 
                      className={airbnbInput} 
                      placeholder="0"
                      required 
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nb de pièces</Label>
                    <Input 
                      type="number" 
                      value={localData.room_count} 
                      onChange={(e) => setLocalData({...localData, room_count: e.target.value})} 
                      className={airbnbInput} 
                      placeholder="Ex: 4"
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nb de chambres</Label>
                    <Input 
                      type="number" 
                      value={localData.bedroom_count} 
                      onChange={(e) => setLocalData({...localData, bedroom_count: e.target.value})} 
                      className={airbnbInput} 
                      placeholder="Ex: 2"
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nb salle bain/douche</Label>
                    <Input 
                      type="number" 
                      value={localData.bathroom_count} 
                      onChange={(e) => setLocalData({...localData, bathroom_count: e.target.value})} 
                      className={airbnbInput} 
                      placeholder="Ex: 1"
                    />
                </div>
            </div>
        </div>

        {/* BARRE D'ACTION */}
        <div className="pt-10 border-t border-gray-100 flex items-center justify-between">
          <span 
            className="text-sm font-medium text-gray-900 underline cursor-pointer hover:text-gray-600 transition-colors" 
            onClick={() => router.push(`/dashboard/listings/${params.id}/edit/step-1`)}
          >
            Retour
          </span>
          <Button 
            type="submit" 
            disabled={loading} 
            className="h-14 px-12 text-lg font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-200"
          >
            {loading ? "Enregistrement..." : "Suivant"}
          </Button>
        </div>
      </form>
    </div>
  )
}