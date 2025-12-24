'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Home, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Confetti from 'react-confetti'

// --- HOOK POUR LES CONFETTIS ---
function useWindowSize() {
  const [size, setSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  React.useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

export default function ListingSuccessPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { width, height } = useWindowSize()

  const [listing, setListing] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // URL de base pour le site public (sans le "pro.")
  const PUBLIC_SITE_URL = "https://www.unbienimmo.com"

  React.useEffect(() => {
    async function fetchListingDetails() {
      if (!params.id) return;
      
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id, 
            title, 
            street_address, 
            city, 
            zip_code, 
            price, 
            property_type,
            professionals:professional_id ( name, email, phone )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        setListing(data)

      } catch (e: any) {
        console.error("Erreur Success Page:", e.message)
        setError("Impossible de charger les détails de l'annonce.")
      } finally {
        setLoading(false)
      }
    }
    fetchListingDetails()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-rose-500" />
        <p className="text-xl font-medium">Finalisation de la publication...</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-600 mb-6">
          {error || "Annonce introuvable."}
        </div>
        <Button onClick={() => router.push('/dashboard/listings')} className="bg-slate-900">
          Retour au tableau de bord
        </Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6 text-center">
      
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.15}
        colors={['#FDA4AF', '#F43F5E', '#BE123C', '#27272A']}
      />

      <div className="z-10 bg-white p-8 md:p-12 rounded-[40px] shadow-2xl max-w-2xl w-full border border-gray-50 animate-in fade-in zoom-in duration-700">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Annonce Publiée !
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Félicitations, votre bien est désormais visible en ligne.
        </p>

        <div className="space-y-3 mb-10 text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Récapitulatif</h2>
          <p className="text-slate-900 font-bold text-lg leading-tight">{listing.title}</p>
          <p className="text-slate-600 text-sm">
            {listing.street_address}, {listing.zip_code} {listing.city}
          </p>
          <div className="pt-3 border-t border-slate-200 mt-2">
            <p className="text-rose-600 font-black text-xl">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price)}
            </p>
          </div>
          {listing.professionals && (
            <p className="text-xs text-slate-500 mt-2 italic text-right">
              Publiée par : {listing.professionals.name}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => router.push(`/dashboard`)}
            className="h-14 px-8 bg-slate-900 hover:bg-black text-white rounded-2xl text-lg font-bold transition-all flex items-center gap-2"
          >
            <Home className="h-5 w-5" /> Dashboard
          </Button>
          
          {/* BOUTON CORRIGÉ ICI POUR POINTER VERS WWW */}
          <Button 
            onClick={() => window.open(`${PUBLIC_SITE_URL}/listings/${listing.id}`, '_blank')}
            variant="outline"
            className="h-14 px-8 border-2 border-slate-200 text-slate-900 hover:bg-slate-50 rounded-2xl text-lg font-bold transition-all flex items-center gap-2"
          >
            <ExternalLink className="h-5 w-5" /> Voir en ligne
          </Button>
        </div>
      </div>
    </div>
  )
}