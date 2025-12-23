'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'

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
      toast.success("Annonce mise à jour")
      router.push(`/dashboard/listings/${data.id}/edit/step-2`)
    } catch (error: any) {
      console.error(error)
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return <div className="p-20 text-center animate-pulse">Chargement...</div>

  return (
    <div className="w-full max-w-xl mx-auto pt-12 pb-20 px-6">
      {/* En-tête épuré sans cadre */}
      <div className="mb-12 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Quel type de bien proposez-vous ?
        </h1>
        <p className="text-lg text-gray-500">
          Étape 1 : Définissons les bases de votre annonce.
        </p>
      </div>

      <div className="space-y-10">
        {/* Choix Transaction */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            Je souhaite faire une
          </Label>
          <Select 
            value={transactionType} 
            onValueChange={(val) => updateListing({ transaction_type: val })}
          >
            <SelectTrigger className="w-full h-16 text-lg border-gray-200 rounded-xl focus:ring-0 focus:border-black transition-all">
              <SelectValue placeholder="Choisir le type de transaction" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id} className="h-12 text-base">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Choix Type de bien */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            Il s'agit d'un / d'une
          </Label>
          <Select 
            value={propertyType} 
            onValueChange={(val) => updateListing({ property_type: val })}
          >
            <SelectTrigger className="w-full h-16 text-lg border-gray-200 rounded-xl focus:ring-0 focus:border-black transition-all">
              <SelectValue placeholder="Sélectionner la catégorie" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id} className="h-12 text-base">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Barre d'action inférieure style Airbnb */}
        <div className="pt-10 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400 underline cursor-not-allowed">
            Retour
          </span>
          <Button 
            className="h-14 px-10 text-lg font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg transition-transform active:scale-95 disabled:bg-gray-200"
            disabled={loading || !transactionType || !propertyType}
            onClick={handleSubmit}
          >
            {loading ? "Enregistrement..." : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  )
}