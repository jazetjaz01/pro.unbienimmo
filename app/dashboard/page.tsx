import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import { CopyInviteCode } from '@/components/dashboard/copy-invite-code'
export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Récupérer l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Récupérer les infos de l'agence (Professionals) dont il est le owner
  const { data: agency } = await supabase
    .from('professionals')
    .select('name, invite_code, type')
    .eq('owner_id', user.id)
    .single()

  // Si par erreur il arrive ici sans agence, on le renvoie à l'onboarding
  if (!agency) redirect('/dashboard/onboarding')

  return (
    <div className="p-8 space-y-8">
      {/* Header Dynamique */}
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">
            Tableau de bord — {agency.type}
          </p>
          <h1 className="text-3xl font-light italic tracking-tight text-gray-900">
            {agency.name}
          </h1>
        </div>

        {/* Composant pour copier le code d'invitation */}
        <div className="hidden md:block">
          <CopyInviteCode code={agency.invite_code} />
        </div>
      </div>

      {/* Reste de ton Dashboard (Statistiques, Annonces récentes, etc.) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-gray-400">Annonces actives</p>
          <p className="text-2xl font-light italic">0</p>
        </div>
        <div className="p-6 bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-gray-400">Agents rattachés</p>
          <p className="text-2xl font-light italic">1 (Vous)</p>
        </div>
      </div>
    </div>
  )
}