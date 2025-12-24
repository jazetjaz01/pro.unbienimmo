'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'
import { useDebounce } from '@/hooks/useDebounce'
import { Loader2, ArrowRight, MapPin, Check, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function Step3Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { listing, updateListing, isLoading: contextLoading } = useListing()
  
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  
  const [addressData, setAddressData] = React.useState({
    street_address: '',
    city: '',
    zip_code: '',
    region: '',
    country: 'France',
    neighborhood: '',
    latitude: null as number | null,
    longitude: null as number | null,
    address_visibility: '500m'
  })

  const debouncedQuery = useDebounce(query, 300)

  // Synchronisation avec les données existantes du listing
  React.useEffect(() => {
    if (listing) {
      setAddressData({
        street_address: listing.street_address || '',
        city: listing.city || '',
        zip_code: listing.zip_code || '',
        region: listing.region || '',
        country: listing.country || 'France',
        neighborhood: listing.neighborhood || '',
        latitude: listing.latitude || null,
        longitude: listing.longitude || null,
        address_visibility: listing.address_visibility || '500m'
      })
      if (listing.street_address) setQuery(listing.street_address)
    }
  }, [listing])

  // Fetch des suggestions Mapbox
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 3 || addressData.latitude) {
        setSuggestions([])
        return
      }

      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery)}.json?access_token=${MAPBOX_TOKEN}&country=fr&language=fr&autocomplete=true&limit=5`
        const response = await fetch(url)
        const data = await response.json()

        const newSuggestions = data.features.map((f: any) => ({
          name: f.place_name,
          lat: f.center[1],
          lng: f.center[0],
          city: f.context?.find((c: any) => c.id.includes('place'))?.text || '',
          zip: f.context?.find((c: any) => c.id.includes('postcode'))?.text || '',
          reg: f.context?.find((c: any) => c.id.includes('region'))?.text || '',
          country: f.context?.find((c: any) => c.id.includes('country'))?.text || 'France',
          neighborhood: f.context?.find((c: any) => c.id.includes('neighborhood'))?.text || ''
        }))
        setSuggestions(newSuggestions)
        setShowSuggestions(true)
      } catch (e) {
        console.error("Erreur Mapbox", e)
      }
    }
    fetchSuggestions()
  }, [debouncedQuery, addressData.latitude])

  const handleSelect = (s: any) => {
    setAddressData(prev => ({
      ...prev,
      street_address: s.name,
      city: s.city,
      zip_code: s.zip,
      region: s.reg,
      country: s.country,
      neighborhood: s.neighborhood,
      latitude: s.lat,
      longitude: s.lng
    }))
    setQuery(s.name)
    setShowSuggestions(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addressData.latitude) {
      toast.error("Veuillez sélectionner une adresse valide dans la liste")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('listings')
        .update({
          street_address: addressData.street_address,
          city: addressData.city,
          zip_code: addressData.zip_code,
          region: addressData.region,
          country: addressData.country,
          neighborhood: addressData.neighborhood,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          address_visibility: addressData.address_visibility,
          step_completed: 3
        })
        .eq('id', params.id)
        .select().single()

      if (error) throw error
      updateListing(data)
      router.push(`/dashboard/listings/${params.id}/edit/step-4`)
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
      <div className="mb-20 border-b border-gray-100 pb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Étape 03 / 08</p>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Localisation</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-24">
        
        {/* --- SECTION RECHERCHE --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Adresse du bien</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Saisissez l'adresse pour géolocaliser votre bien. La ville et le code postal seront remplis automatiquement.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-10">
            <div className="space-y-2 relative">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Recherche d'adresse</Label>
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setAddressData(prev => ({ ...prev, latitude: null }))
                  }}
                  placeholder="Ex: 12 rue de la Paix, Paris..."
                  className={minimalInput}
                />
                <MapPin className="absolute right-0 top-3 h-4 w-4 text-gray-300" />
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-100 shadow-2xl mt-1 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSelect(s)} 
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors text-sm text-gray-600"
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Ville</Label>
                <Input value={addressData.city} readOnly className={`${minimalInput} opacity-50 cursor-not-allowed`} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Code Postal</Label>
                <Input value={addressData.zip_code} readOnly className={`${minimalInput} opacity-50 cursor-not-allowed`} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Quartier ou lieu-dit (Optionnel)</Label>
              <Input 
                value={addressData.neighborhood} 
                onChange={(e) => setAddressData({...addressData, neighborhood: e.target.value})}
                placeholder="Ex: Écusson, Le Marais..." 
                className={minimalInput} 
              />
            </div>
          </div>
        </section>

        {/* --- SECTION CONFIDENTIALITÉ --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Confidentialité</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Choisissez comment le bien apparaît sur la carte publique pour les visiteurs.
            </p>
          </div>
          
          <div className="md:col-span-2">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div 
                  onClick={() => setAddressData({...addressData, address_visibility: '500m'})}
                  className={`p-6 border transition-all cursor-pointer ${addressData.address_visibility === '500m' ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${addressData.address_visibility === '500m' ? 'border-gray-900' : 'border-gray-200'}`}>
                      {addressData.address_visibility === '500m' && <div className="h-1.5 w-1.5 bg-gray-900 rounded-full" />}
                    </div>
                    <Info className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-wider mb-1">Zone floutée</p>
                  <p className="text-[11px] leading-relaxed">Rayon de 500m aléatoire autour du bien.</p>
                </div>

                <div 
                  onClick={() => setAddressData({...addressData, address_visibility: 'exact'})}
                  className={`p-6 border transition-all cursor-pointer ${addressData.address_visibility === 'exact' ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                >
                   <div className="flex justify-between items-start mb-4">
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${addressData.address_visibility === 'exact' ? 'border-gray-900' : 'border-gray-200'}`}>
                      {addressData.address_visibility === 'exact' && <div className="h-1.5 w-1.5 bg-gray-900 rounded-full" />}
                    </div>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-wider mb-1">Point exact</p>
                  <p className="text-[11px] leading-relaxed">Affichage précis du marqueur sur la carte.</p>
                </div>
             </div>
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
          
          <div className="flex items-center gap-6">
            {addressData.latitude && (
              <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                <Check className="h-3 w-3" /> Position validée
              </div>
            )}
            <Button 
              type="submit" 
              disabled={loading || !addressData.latitude} 
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
        </div>
      </form>
    </div>
  )
}