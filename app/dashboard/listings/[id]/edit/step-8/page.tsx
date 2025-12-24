'use client'
import { Label } from "@/components/ui/label"
import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, User, CheckCircle2, ArrowRight, Check } from 'lucide-react'

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

  React.useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

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
          is_published: true,
          status: 'published',
          step_completed: 8,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      toast.success("Annonce publiée avec succès !")
      router.push(`/dashboard/listings/${params.id}/success`)

    } catch (error: any) {
      toast.error("Erreur : " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const minimalInput = "rounded-none border-0 border-b border-gray-200 focus-visible:ring-0 focus-visible:border-gray-900 px-0 h-12 text-lg transition-colors bg-transparent shadow-none w-full appearance-none placeholder:text-gray-200"

  if (fetchingData) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
    </div>
  )

  return (
    <div className="p-6 md:p-12 w-full max-w-5xl mx-auto bg-white min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-20 border-b border-gray-100 pb-8 text-left">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-400 mb-2">Étape 08 / 08</p>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Mandat & Finalisation</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-24">
        
        {/* SECTION: PROPRIÉTAIRE */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Propriétaire</h3>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              "Ces informations sont strictement confidentielles et réservées à votre gestion interne."
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-12">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nom Complet</Label>
              <input 
                required 
                className={minimalInput}
                value={formData.owner_name} 
                onChange={e => setFormData({...formData, owner_name: e.target.value})} 
                placeholder="Ex: Jean Dupont"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Téléphone</Label>
                <input 
                  required 
                  className={minimalInput}
                  value={formData.owner_phone} 
                  onChange={e => setFormData({...formData, owner_phone: e.target.value})} 
                  placeholder="06 00 00 00 00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email</Label>
                <input 
                  type="email" 
                  required 
                  className={minimalInput}
                  value={formData.owner_email} 
                  onChange={e => setFormData({...formData, owner_email: e.target.value})} 
                  placeholder="jean.dupont@mail.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: TYPE DE MANDAT */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-50 pt-16">
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Contrat</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Définissez le cadre juridique de votre diffusion.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { id: 'simple', label: 'Mandat Simple', desc: 'Diffusion non exclusive' },
              { id: 'exclusif', label: 'Mandat Exclusif', desc: 'Exclusivité agence' }
            ].map((type) => (
              <button 
                key={type.id} 
                type="button" 
                onClick={() => setFormData({...formData, mandate_type: type.id})}
                className={`flex flex-col p-8 border transition-all duration-500 text-left relative
                  ${formData.mandate_type === type.id 
                  ? 'border-gray-900 bg-gray-900 text-white' 
                  : 'border-gray-100 bg-gray-50/50 text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${formData.mandate_type === type.id ? 'text-gray-400' : 'text-gray-400'}`}>
                    Option {type.id === 'simple' ? '01' : '02'}
                  </span>
                  {formData.mandate_type === type.id && <Check className="h-4 w-4 text-white" />}
                </div>
                <p className="text-lg font-light tracking-tight mb-1">{type.label}</p>
                <p className={`text-[10px] uppercase tracking-tighter ${formData.mandate_type === type.id ? 'text-gray-400' : 'text-gray-400'}`}>
                  {type.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* FOOTER ACTIONS */}
        <div className="pt-20 border-t border-gray-900 border-opacity-10 flex items-center justify-between pb-20">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors"
          >
            Retour
          </button>
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="rounded-none bg-gray-900 hover:bg-black text-white h-16 px-16 transition-all uppercase text-xs tracking-[0.3em] font-bold disabled:opacity-20 shadow-2xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-4">
                Publier l'annonce <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}