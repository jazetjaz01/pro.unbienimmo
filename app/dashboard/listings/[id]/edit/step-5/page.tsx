'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Type, AlignLeft } from 'lucide-react'

export default function Step5Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { listing, updateListing, isLoading } = useListing()

  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState({
    title: '',
    description: ''
  })

  // Limites
  const MAX_TITLE = 70
  const MAX_DESC = 2000

  React.useEffect(() => {
    if (listing) {
      setData({
        title: listing.title || '',
        description: listing.description || ''
      })
    }
  }, [listing])

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (data.title.length < 10) return toast.error("Le titre est trop court")
    
    setLoading(true)
    const slug = `${generateSlug(data.title)}-${params.id}` // On ajoute l'ID à la fin pour garantir l'unicité

    try {
      const { data: updated, error } = await supabase
        .from('listings')
        .update({
          title: data.title,
          description: data.description,
          slug: slug,
          step_completed: 5
        })
        .eq('id', params.id)
        .select().single()

      if (error) throw error
      updateListing(updated)
      toast.success("Titre et description enregistrés")
      router.push(`/dashboard/listings/${params.id}/edit/step-6`) // Étape finale : Photos
    } catch (error) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const airbnbInput = "border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all"

  if (isLoading) return <div className="p-20 text-center">Chargement...</div>

  return (
    <div className="w-full max-w-2xl mx-auto pt-12 pb-20 px-6 font-sans">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Donnez un nom à votre bien</h1>
        <span className="text-sm font-bold uppercase tracking-widest text-rose-500">Étape 5 sur 6</span>
        <p className="text-gray-500">Les titres courts et percutants fonctionnent le mieux.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TITRE */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-bold flex items-center gap-2">
              <Type className="h-4 w-4" /> Titre de l'annonce
            </Label>
            <span className={`text-xs ${data.title.length > MAX_TITLE ? 'text-red-500' : 'text-gray-400'}`}>
              {data.title.length}/{MAX_TITLE}
            </span>
          </div>
          <Input 
            className={`${airbnbInput} h-16 text-xl font-medium`}
            placeholder="Ex: Superbe T3 avec vue sur mer"
            value={data.title}
            onChange={(e) => setData({...data, title: e.target.value.slice(0, MAX_TITLE)})}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-bold flex items-center gap-2">
              <AlignLeft className="h-4 w-4" /> Description
            </Label>
            <span className={`text-xs ${data.description.length > MAX_DESC ? 'text-red-500' : 'text-gray-400'}`}>
              {data.description.length}/{MAX_DESC}
            </span>
          </div>
          <Textarea 
            className={`${airbnbInput} min-h-[250px] text-lg leading-relaxed pt-4`}
            placeholder="Décrivez les atouts de votre bien, le quartier et les points forts..."
            value={data.description}
            onChange={(e) => setData({...data, description: e.target.value.slice(0, MAX_DESC)})}
          />
        </div>

        {/* FOOTER */}
        <div className="pt-10 border-t flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="text-sm font-bold underline text-gray-900">Retour</button>
          <Button 
            type="submit" 
            disabled={loading || data.title.length < 5} 
            className="h-14 px-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg font-bold"
          >
            {loading ? "Chargement..." : "Suivant"}
          </Button>
        </div>
      </form>
    </div>
  )
}