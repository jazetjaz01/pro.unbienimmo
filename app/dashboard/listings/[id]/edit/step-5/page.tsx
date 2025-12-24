'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useListing } from '@/context/ListingContext'
import { Loader2, ArrowRight, Type, AlignLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function Step5Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { listing, updateListing, isLoading: contextLoading } = useListing()

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
    if (data.title.length < 10) return toast.error("Le titre est trop court (min. 10 caractères)")
    
    setLoading(true)
    const slug = `${generateSlug(data.title)}-${params.id}`

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
      router.push(`/dashboard/listings/${params.id}/edit/step-6`)
    } catch (error) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 transition-colors bg-transparent shadow-none w-full"

  if (contextLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-20 border-b border-gray-100 pb-8 text-left">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Étape 05 / 08</p>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Titre & Description</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-24">
        
        {/* --- SECTION TITRE --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">L'essentiel</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Le titre est le premier élément vu par les acquéreurs. Soyez clair, précis et accrocheur.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Titre de l'annonce</Label>
              <span className={`text-[10px] font-mono ${data.title.length >= MAX_TITLE ? 'text-red-500' : 'text-gray-300'}`}>
                {data.title.length} / {MAX_TITLE}
              </span>
            </div>
            <Input 
              className={`${minimalInput} h-16 text-2xl font-light italic`}
              placeholder="ex: Appartement Haussmannien avec balcon..."
              value={data.title}
              onChange={(e) => setData({...data, title: e.target.value.slice(0, MAX_TITLE)})}
            />
          </div>
        </section>

        {/* --- SECTION DESCRIPTION --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Détails</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Décrivez l'agencement, les matériaux, l'ambiance du quartier et les points forts uniques de votre bien.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Corps de l'annonce</Label>
              <span className={`text-[10px] font-mono ${data.description.length >= MAX_DESC ? 'text-red-500' : 'text-gray-300'}`}>
                {data.description.length} / {MAX_DESC}
              </span>
            </div>
            <Textarea 
              className={`${minimalInput} min-h-75 text-lg leading-relaxed py-4 resize-none`}
              placeholder="Commencez à rédiger ici..."
              value={data.description}
              onChange={(e) => setData({...data, description: e.target.value.slice(0, MAX_DESC)})}
            />
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
            disabled={loading || data.title.length < 10} 
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