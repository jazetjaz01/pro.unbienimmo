import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Définition des zones de navigation
  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/login')
  const isOnboardingChoicePage = pathname === '/onboarding/choice'
  const isJoinAgencyPage = pathname === '/auth/join-agency'
  const isAccessDeniedPage = pathname === '/access-denied'

  // 2. LOGIQUE DE SÉCURITÉ DE BASE : Non connecté
  if (!user && !isAuthPage && !isAccessDeniedPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 3. LOGIQUE POUR UTILISATEUR CONNECTÉ
  if (user && !isAuthPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, is_admin, onboarding_step')
      .eq('id', user.id)
      .single()

    const step = profile?.onboarding_step || 0

    // A. GESTION DU NOUVEL UTILISATEUR (STEP 0)
    // On l'autorise à aller sur la page de choix ou la page agent, même s'il n'est pas encore "is_pro"
    if (step === 0) {
      if (!isOnboardingChoicePage && !isJoinAgencyPage && !isAccessDeniedPage) {
        return NextResponse.redirect(new URL('/onboarding/choice', request.url))
      }
      return supabaseResponse // On le laisse accéder à Choice ou Join-Agency
    }

    // B. SÉCURITÉ STRICTE (Après le choix du rôle)
    // Une fois que l'utilisateur a commencé son onboarding (step > 0), 
    // il doit être pro ou admin pour continuer
    if (!profile?.is_pro && !profile?.is_admin) {
      if (!isAccessDeniedPage) {
        return NextResponse.redirect(new URL('https://unbienimmo.com/access-denied', request.url))
      }
      return supabaseResponse
    }

    // C. LOGIQUE D'ONBOARDING PATRON (STEP 1)
    if (profile.is_pro && !profile.is_admin) {
      const isOnboardingFormPage = pathname === '/dashboard/onboarding'
      const isInsideDashboard = pathname.startsWith('/dashboard')

      // Rediriger vers le formulaire de création d'agence si step 1
      if (isInsideDashboard && !isOnboardingFormPage && step === 1) {
        return NextResponse.redirect(new URL('/dashboard/onboarding', request.url))
      }

      // Protection : Empêcher de retourner sur les pages d'onboarding si fini (step >= 2)
      if (step >= 2 && (isOnboardingFormPage || isOnboardingChoicePage || isJoinAgencyPage)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}