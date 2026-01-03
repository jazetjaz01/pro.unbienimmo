import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ UTILISEZ LA CLÉ ANON ICI
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

  // IMPORTANT: Ne pas utiliser de destructuration directe ici pour éviter les erreurs si data est null
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Définition des zones de navigation
  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/login')
  const isOnboardingChoicePage = pathname === '/onboarding/choice'
  const isJoinAgencyPage = pathname === '/auth/join-agency'
  const isAccessDeniedPage = pathname === '/access-denied'
  const isPublicPage = pathname === '/'

  // 2. LOGIQUE DE SÉCURITÉ : Utilisateur non connecté
  if (!user && !isAuthPage && !isPublicPage && !isAccessDeniedPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 3. LOGIQUE POUR UTILISATEUR CONNECTÉ
  if (user) {
    // Vérifier si nous sommes sur une page d'auth en étant connecté
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, is_admin, onboarding_step')
      .eq('id', user.id)
      .single()

    const step = profile?.onboarding_step || 0

    // A. NOUVEL UTILISATEUR (STEP 0)
    if (step === 0) {
      if (!isOnboardingChoicePage && !isJoinAgencyPage && !isAccessDeniedPage) {
        return NextResponse.redirect(new URL('/onboarding/choice', request.url))
      }
      return supabaseResponse
    }

    // B. GESTION DES ACCÈS (DASHBOARD & ONBOARDING)
    const isInsideDashboard = pathname.startsWith('/dashboard')
    const isOnboardingProcess = pathname.startsWith('/dashboard/onboarding')

    // On autorise si : pro OU admin OU en train de faire l'onboarding
    const hasAccessPermission = profile?.is_pro || profile?.is_admin || isOnboardingProcess

    if (isInsideDashboard && !hasAccessPermission) {
      return NextResponse.redirect(new URL('/access-denied', request.url))
    }

    // C. LOGIQUE DE REDIRECTION PAR ÉTAPE
    if (isInsideDashboard) {
      // Force le formulaire si step 1
      if (step === 1 && !isOnboardingProcess) {
        return NextResponse.redirect(new URL('/dashboard/onboarding', request.url))
      }

      // Empêche le retour à l'onboarding si fini (ex: après step 4 ou 5 selon votre logique)
      if (step >= 5 && isOnboardingProcess) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // Empêcher l'accès à la page de choix si déjà fait
    if (step > 0 && isOnboardingChoicePage) {
       return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}