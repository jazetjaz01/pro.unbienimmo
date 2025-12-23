'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, User, CheckCircle2 } from 'lucide-react'

export default function Step8Page() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = React.useState(false)
  const [fetchingData, setFetchingData] = React.useState(true)
  const [proId, setProId] = React.useState<number | null>(null)
  
  const [formData, setFormData] = React.useState({
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    mandate_type: 'simple', 
  })

  // --- CHARGEMENT DES DONNÉES (VÉRIFICATION PRO + RÉCUPÉRATION ANNONCE) ---
  React.useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // 1. Vérification du profil professionnel
        const { data: proData, error: proError } = await supabase
          .from('professionals')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (proError || !proData) {
          toast.error("Profil professionnel requis")
          router.push('/dashboard/profile/setup')
          return
        }
        setProId(Number(proData.id))

        // 2. Récupération des données existantes de l'annonce
        if (params.id) {
          const { data: listing, error: listError } = await supabase
            .from('listings')
            .select('owner_name, owner_phone, owner_email, mandate_type')
            .eq('id', params.id)
            .single()

          if (listing) {
            setFormData({
              owner_name: listing.owner_name || '',
              owner_phone: listing.owner_phone || '',
              owner_email: listing.owner_email || '',
              mandate_type: listing.mandate_type || 'simple',
            })
          }
        }
      } catch (e) {
        console.error("Erreur chargement:", e)
      } finally {
        setFetchingData(false)
      }
    }

    loadInitialData()
  }, [params.id, router, supabase])

  // --- ENREGISTREMENT ET PUBLICATION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proId) return toast.error("Liaison professionnelle manquante")
    
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          owner_name: formData.owner_name,
          owner_phone: formData.owner_phone,
          owner_email: formData.owner_email,
          mandate_type: formData.mandate_type,
          exclusivite_agence: formData.mandate_type === 'exclusif',
          professional_id: proId,
          is_published: true, // L'annonce devient publique
          status: 'published',
          step_completed: 8,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      toast.success("Annonce publiée avec succès !")
      
      // Redirection vers la page succès
      router.push(`/dashboard/listings/${params.id}/success`)

    } catch (error: any) {
      toast.error("Erreur : " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
        <p className="text-gray-500 font-medium">Finalisation de l'annonce...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto pt-12 pb-20 px-6 font-sans">
      <div className="mb-10 space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Dernière vérification</h1>
        <p className="text-sm font-bold text-rose-500 uppercase tracking-widest">Étape 8 sur 8</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION PROPRIÉTAIRE */}
        <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-gray-100 rounded-xl"><User className="h-5 w-5 text-gray-600" /></div>
            <h2 className="font-bold text-gray-900">Contact du propriétaire</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nom du propriétaire</label>
              <input 
                required 
                placeholder="Ex: Jean Dupont" 
                className="w-full h-14 px-5 rounded-2xl border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all bg-gray-50/50"
                value={formData.owner_name} 
                onChange={e => setFormData({...formData, owner_name: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Téléphone</label>
                <input 
                  required 
                  placeholder="06 00 00 00 00" 
                  className="w-full h-14 px-5 rounded-2xl border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all bg-gray-50/50"
                  value={formData.owner_phone} 
                  onChange={e => setFormData({...formData, owner_phone: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="proprietaire@mail.com" 
                  className="w-full h-14 px-5 rounded-2xl border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all bg-gray-50/50"
                  value={formData.owner_email} 
                  onChange={e => setFormData({...formData, owner_email: e.target.value})} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION MANDAT */}
        <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-gray-100 rounded-xl"><ShieldCheck className="h-5 w-5 text-gray-600" /></div>
            <h2 className="font-bold text-gray-900">Type de contrat</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'simple', label: 'Mandat Simple', desc: 'Votre agence parmi d\'autres' },
              { id: 'exclusif', label: 'Mandat Exclusif', desc: 'Exclusivité totale pour votre agence' }
            ].map((type) => (
              <button 
                key={type.id} 
                type="button" 
                onClick={() => setFormData({...formData, mandate_type: type.id})}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left ${
                  formData.mandate_type === type.id 
                  ? 'border-black bg-gray-50 shadow-inner' 
                  : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div>
                  <p className="font-bold text-gray-900">{type.label}</p>
                  <p className="text-sm text-gray-500">{type.desc}</p>
                </div>
                {formData.mandate_type === type.id && <CheckCircle2 className="h-6 w-6 text-black" />}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS BAS DE PAGE */}
        <div className="pt-10 flex items-center justify-between border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="text-sm font-bold underline text-gray-900 hover:text-gray-600 transition-colors"
          >
            Retour
          </button>
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="h-16 px-12 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-xl font-bold transition-all active:scale-95 disabled:bg-gray-200 min-w-[280px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Publication en cours...</span>
              </div>
            ) : (
              "Enregistrer et Publier"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}