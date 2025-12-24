'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'
import { Loader2, ArrowRight, Euro } from 'lucide-react'

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
    bathroom_count: ''
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
        bathroom_count: listing.bathroom_count?.toString() || ''
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
        bathroom_count: localData.bathroom_count ? Number(localData.bathroom_count) : null,
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

      const { data, error } = await supabase.from('listings').update(updatePayload).eq('id', params.id).select().single()
      if (error) throw error
      updateListing(data)
      router.push(`/dashboard/listings/${params.id}/edit/step-3`)
    } catch (error: any) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 text-lg transition-colors bg-transparent shadow-none w-full"

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-20 border-b border-gray-100 pb-8 text-left">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Étape 02 / 08</p>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Prix et dimensions</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-24">
        
        {/* --- SECTION FINANCIÈRE --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Économie</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Détaillez le prix {isRental ? 'du loyer' : 'de vente'} et les honoraires.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-12">
            {!isRental ? (
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Net Vendeur</Label>
                    <div className="relative">
                      <Input type="number" value={localData.price_net} onChange={(e) => setLocalData({...localData, price_net: e.target.value})} className={minimalInput} />
                      <Euro className="absolute right-0 top-3 h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Honoraires</Label>
                    <div className="relative">
                      <Input type="number" value={localData.price_fees} onChange={(e) => setLocalData({...localData, price_fees: e.target.value})} className={minimalInput} />
                      <Euro className="absolute right-0 top-3 h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </div>

                <div className="py-8 border-y border-gray-50">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Total FAI</p>
                  <p className="text-5xl font-light text-gray-900">{totalSalePrice.toLocaleString()} €</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Charge des honoraires</Label>
                  <RadioGroup 
                    value={localData.fees_paid_by} 
                    onValueChange={(val) => setLocalData({ ...localData, fees_paid_by: val })}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vendeur" id="vendeur" className="border-gray-200 text-gray-900 focus:ring-gray-900" />
                      <Label htmlFor="vendeur" className="text-sm font-medium cursor-pointer">Vendeur</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="acquereur" id="acquereur" className="border-gray-200 text-gray-900 focus:ring-gray-900" />
                      <Label htmlFor="acquereur" className="text-sm font-medium cursor-pointer">Acquéreur</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Loyer HC</Label>
                  <div className="relative">
                    <Input type="number" value={localData.rent_base} onChange={(e) => setLocalData({...localData, rent_base: e.target.value})} className={minimalInput} />
                    <Euro className="absolute right-0 top-3 h-4 w-4 text-gray-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Charges</Label>
                  <div className="relative">
                    <Input type="number" value={localData.rent_charges} onChange={(e) => setLocalData({...localData, rent_charges: e.target.value})} className={minimalInput} />
                    <Euro className="absolute right-0 top-3 h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- SECTION MESURES --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Dimensions</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Surface habitable et distribution des pièces.
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-2 gap-x-10 gap-y-12">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Surface (m²)</Label>
              <Input type="number" value={localData.surface_area_m2} onChange={(e) => setLocalData({...localData, surface_area_m2: e.target.value})} className={minimalInput} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Pièces</Label>
              <Input type="number" value={localData.room_count} onChange={(e) => setLocalData({...localData, room_count: e.target.value})} className={minimalInput} placeholder="Ex: 4" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Chambres</Label>
              <Input type="number" value={localData.bedroom_count} onChange={(e) => setLocalData({...localData, bedroom_count: e.target.value})} className={minimalInput} placeholder="Ex: 2" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Salles de bain</Label>
              <Input type="number" value={localData.bathroom_count} onChange={(e) => setLocalData({...localData, bathroom_count: e.target.value})} className={minimalInput} placeholder="Ex: 1" />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <div className="pt-10 border-t border-gray-900 border-opacity-10 flex items-center justify-between pb-20">
          <button 
            type="button"
            onClick={() => router.push(`/dashboard/listings/${params.id}/edit/step-1`)}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors"
          >
            Retour
          </button>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="rounded-none bg-gray-900 hover:bg-black text-white h-14 px-12 transition-all uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Suivant <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}