'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Home, ExternalLink, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Confetti from 'react-confetti'

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
  const [mounted, setMounted] = React.useState(false)
  const [listing, setListing] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  const PUBLIC_SITE_URL = "https://www.unbienimmo.com"

  React.useEffect(() => {
    setMounted(true)
    async function fetchListingDetails() {
      if (!params.id) return;
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`id, title, street_address, city, zip_code, price, professionals:professional_id ( name )`)
          .eq('id', params.id)
          .single()
        if (error) throw error
        setListing(data)
      } catch (e: any) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchListingDetails()
  }, [params.id, supabase])

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 bg-white">
      
      {/* CONFETTIS AU PREMIER PLAN */}
      {mounted && createPortal(
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
          colors={['#000000', '#FF385C', '#717171', '#EBEBEB']}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        />,
        document.body
      )}

      <div className="w-full max-w-[500px] animate-in fade-in duration-700">
        <div className="text-center mb-12">
          <Sparkles className="h-10 w-10 text-gray-900 mx-auto mb-6" />
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-4">
            Annonce publiée.
          </h1>
          <p className="text-gray-500">
            Votre bien est désormais visible sur la plateforme.
          </p>
        </div>

        {/* SECTION RECAPITULATIF SANS BORDURES NI ARRONDIS */}
        <div className="py-8 border-t border-b border-gray-100 mb-12">
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-lg font-medium text-gray-900">
              {listing?.title}
            </h2>
            <span className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing?.price)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-400 gap-1 text-sm mb-6">
            <MapPin className="h-3 w-3" />
            {listing?.street_address}, {listing?.zip_code} {listing?.city}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">
              Statut : Actif en ligne
            </span>
          </div>
        </div>

        {/* BOUTONS CARRES / STYLE MINIMAL */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.open(`${PUBLIC_SITE_URL}/listings/${listing.id}`, '_blank')}
            className="h-14 bg-gray-900 hover:bg-black text-white rounded-none text-sm font-bold transition-all uppercase tracking-widest"
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Voir l'annonce
          </Button>
          
          <Button 
            onClick={() => router.push(`/dashboard`)}
            variant="ghost"
            className="h-14 text-gray-500 hover:text-gray-900 rounded-none text-sm font-medium transition-all"
          >
            <Home className="mr-2 h-4 w-4" /> Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  )
}