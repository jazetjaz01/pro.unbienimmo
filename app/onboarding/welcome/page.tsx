import { createClient } from '@/lib/supabase/server'
import { OnboardingTracker } from '@/components/onboarding/onboarding-tracker'
import { redirect } from 'next/navigation'

export default async function WelcomeOnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_step')
    .eq('id', user.id)
    .single()

  // Si l'onboarding est totalement fini (step 5), on redirige vers le dashboard
  if (profile?.onboarding_step >= 5) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <OnboardingTracker currentStep={profile?.onboarding_step || 1} />
    </div>
  )
}