// app/dashboard/onboarding/page.tsx
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

  const currentStep = profile?.onboarding_step || 1

  // Redirection automatique si tout est terminé
  if (currentStep >= 5) redirect('/dashboard')

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* On passe le currentStep au tracker pour qu'il sache quelles cases cocher */}
        <OnboardingTracker currentStep={currentStep} />
        
        <div className="mt-16 text-center">
            <p className="text-[10px] text-gray-300 uppercase tracking-[0.5em] font-light">
                Sélectionnez une étape pour compléter votre configuration
            </p>
        </div>
      </div>
    </div>
  )
}