'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'
import { Loader2, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TRANSACTION_TYPES = [
  { id: 'vente', label: 'Vente' },
  { id: 'location', label: 'Location' }
]

const PROPERTY_TYPES = [
  { id: 'appartement', label: 'Appartement' },
  { id: 'maison', label: 'Maison' },
  { id: 'immeuble', label: 'Immeuble' },
  { id: 'bureaux', label: 'Bureaux' },
  { id: 'garage', label: 'Garage' },
  { id: 'parking', label: 'Parking' },
  { id: 'local_commercial', label: 'Local commercial' },
  { id: 'entrepot', label: 'Entrepôt' },
  { id: 'terrain_constructible', label: 'Terrain constructible' },
  { id: 'terrain_non_constructible', label: 'Terrain non constructible' },
  { id: 'terrain_agricole', label: 'Terrain agricole' },
  { id: 'vignes', label: 'Vignes' },
  { id: 'chateau', label: 'Château' },
  { id: 'autre', label: 'Autre' }
]

export default function Step1Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { listing, updateListing, isLoading } = useListing()
  const [loading, setLoading] = React.useState(false)

  const transactionType = listing?.transaction_type || ''
  const propertyType = listing?.property_type || ''

  async function handleSubmit() {
    if (!transactionType || !propertyType || loading) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")

      const payload: any = {
        owner_id: user.id,
        transaction_type: transactionType,
        property_type: propertyType,
        step_completed: 1,
      }

      const urlId = Number(params.id)
      if (!isNaN(urlId)) {
        payload.id = urlId
      } else if (listing?.id) {
        payload.id = listing.id
      }

      const { data, error } = await supabase.from('listings').upsert(payload).select().single()

      if (error) throw error

      updateListing(data)
      router.push(`/dashboard/listings/${data.id}/edit/step-2`)
    } catch (error: any) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-4xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER MINIMALISTE */}
      <div className="mb-20 border-b border-gray-100 pb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Étape 01 / 08</p>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Type de bien & transaction</h1>
      </div>

      <div className="space-y-24">
        {/* SECTION TRANSACTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Transaction</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Précisez si ce bien est destiné à la vente ou à la location.
            </p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nature du projet</Label>
            <Select 
              value={transactionType} 
              onValueChange={(val) => updateListing({ transaction_type: val })}
            >
              <SelectTrigger className="rounded-none border-0 border-b border-gray-200 focus:ring-0 px-0 h-14 text-lg shadow-none hover:border-gray-900 transition-colors">
                <SelectValue placeholder="Choisir une option" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-gray-100">
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="rounded-none py-3 cursor-pointer">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* SECTION TYPE DE BIEN */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Catégorie</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sélectionnez la nature exacte du bien immobilier.
            </p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Type de propriété</Label>
            <Select 
              value={propertyType} 
              onValueChange={(val) => updateListing({ property_type: val })}
            >
              <SelectTrigger className="rounded-none border-0 border-b border-gray-200 focus:ring-0 px-0 h-14 text-lg shadow-none hover:border-gray-900 transition-colors">
                <SelectValue placeholder="Sélectionner le type de bien" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-gray-100 max-h-[300px]">
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="rounded-none py-3 cursor-pointer">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* ACTIONS FOOTER */}
        <div className="pt-10 border-t border-gray-900 border-opacity-10 flex items-center justify-between pb-20">
          <button 
            onClick={() => router.back()}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors"
          >
            Retour
          </button>
          
          <Button 
            className="rounded-none bg-gray-900 hover:bg-black text-white h-14 px-12 transition-all uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-20"
            disabled={loading || !transactionType || !propertyType}
            onClick={handleSubmit}
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
      </div>
    </div>
  )
}