'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'
import { useDebounce } from '@/hooks/useDebounce'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, CheckCircle2, ShieldCheck } from 'lucide-react'

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
    toast.success("Adresse sélectionnée")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addressData.latitude) {
      toast.error("Veuillez sélectionner une adresse")
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

  const airbnbInput = "h-14 text-lg border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all"

  if (contextLoading) return <div className="p-20 text-center animate-pulse text-gray-400">Chargement des données...</div>

  return (
    <div className="w-full max-w-xl mx-auto pt-12 pb-20 px-6 font-sans">
      <div className="mb-8 space-y-2">
        
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Où se situe votre bien ?</h1>
        <span className="text-sm font-bold  uppercase tracking-widest">Étape 3 sur 6</span>
       <p className="text-sm text-gray-600 leading-relaxed max-w-md">
    À cette étape, il convient de saisir l'adresse du bien. 
    Vous pouvez choisir ci-dessous de présenter votre bien de façon exacte 
    sur une carte ou dans un rayon de 500 mètres.
  </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* RECHERCHE D'ADRESSE */}
        <div className="space-y-2 relative">
          <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Adresse</Label>
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setAddressData(prev => ({ ...prev, latitude: null }))
            }}
            placeholder="Saisissez l'adresse complète..."
            className={airbnbInput}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-2xl mt-1 overflow-hidden">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors"
                >
                  <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VILLE & CP */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Ville</Label>
            <Input value={addressData.city} readOnly className={`${airbnbInput} bg-gray-50 text-gray-500 cursor-not-allowed`} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Code Postal</Label>
            <Input value={addressData.zip_code} readOnly className={`${airbnbInput} bg-gray-50 text-gray-500 cursor-not-allowed`} />
          </div>
        </div>

        {/* PAYS */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Pays</Label>
          <Input value={addressData.country} readOnly className={`${airbnbInput} bg-gray-50 text-gray-500 cursor-not-allowed`} />
        </div>

        {/* QUARTIER / ARRONDISSEMENT */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Quartier ou lieu-dit (optionnel)</Label>
          <Input 
            value={addressData.neighborhood} 
            onChange={(e) => setAddressData({...addressData, neighborhood: e.target.value})}
            placeholder="Ex: Le Marais, 8ème arr..." 
            className={airbnbInput} 
          />
        </div>

        <hr className="my-8 border-gray-100" />

        {/* VISIBILITÉ */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-gray-900">Affichage public sur la carte</Label>
          
          <div className="grid gap-3">
            <div 
              onClick={() => setAddressData({...addressData, address_visibility: '500m'})}
              className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${addressData.address_visibility === '500m' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${addressData.address_visibility === '500m' ? 'border-black' : 'border-gray-300'}`}>
                {addressData.address_visibility === '500m' && <div className="h-3 w-3 bg-black rounded-full" />}
              </div>
              <div>
                <p className="font-semibold text-sm">Zone floutée (Recommandé)</p>
                <p className="text-xs text-gray-500">Un rayon de 500m sans l'adresse exacte.</p>
              </div>
            </div>

            <div 
              onClick={() => setAddressData({...addressData, address_visibility: 'exact'})}
              className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${addressData.address_visibility === 'exact' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${addressData.address_visibility === 'exact' ? 'border-black' : 'border-gray-300'}`}>
                {addressData.address_visibility === 'exact' && <div className="h-3 w-3 bg-black rounded-full" />}
              </div>
              <div>
                <p className="font-semibold text-sm">Adresse exacte</p>
                <p className="text-xs text-gray-500">Marqueur précis sur l'emplacement du bien.</p>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS GPS */}
        {addressData.latitude && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs font-bold uppercase">Position GPS enregistrée</span>
          </div>
        )}

        <div className="pt-10 border-t flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="text-sm font-bold underline text-gray-900">Retour</button>
          <Button 
            type="submit" 
            disabled={loading || !addressData.latitude} 
            className="h-14 px-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg font-bold"
          >
            {loading ? "Enregistrement..." : "Suivant"}
          </Button>
        </div>
      </form>
    </div>
  )
}