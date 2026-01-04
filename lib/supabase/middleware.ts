import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ✅ 1. EXCEPTION WEBHOOKS : On laisse passer Stripe sans aucune vérification
  if (pathname.startsWith('/api/webhook/stripe') || pathname.startsWith('/api/webhooks/stripe')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // 2. DÉFINITION DES ZONES
  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/login')
  const isPublicPage = pathname === '/' || pathname.startsWith('/public')
  const isAccessDeniedPage = pathname === '/access-denied'
  const isInsideDashboard = pathname.startsWith('/dashboard')
  const isOnboardingProcess = pathname.startsWith('/dashboard/onboarding')
  const isSuccessPage = pathname === '/dashboard/onboarding/success'

  // 3. LOGIQUE UTILISATEUR NON CONNECTÉ
  if (!user) {
    if (!isAuthPage && !isPublicPage && !isAccessDeniedPage) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return supabaseResponse
  }

  // 4. LOGIQUE UTILISATEUR CONNECTÉ
  if (user) {
    // Rediriger les gens connectés qui vont sur login/auth vers le dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Récupération du profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, is_admin, onboarding_step')
      .eq('id', user.id)
      .single()

    const step = profile?.onboarding_step || 0

    // ✅ EXCEPTION PRIORITAIRE : La page Success
    // Si l'utilisateur est sur la page de succès, on arrête tout et on affiche la page
    if (isSuccessPage) {
      return supabaseResponse
    }

    // A. NOUVEL UTILISATEUR (STEP 0)
    if (step === 0) {
      const isOnboardingChoicePage = pathname === '/onboarding/choice'
      const isJoinAgencyPage = pathname === '/auth/join-agency'
      
      if (!isOnboardingChoicePage && !isJoinAgencyPage && !isAccessDeniedPage) {
        return NextResponse.redirect(new URL('/onboarding/choice', request.url))
      }
      return supabaseResponse
    }

    // B. PROTECTION DU DASHBOARD (is_pro ou is_admin requis)
    const hasAccess = profile?.is_pro || profile?.is_admin || isOnboardingProcess
    if (isInsideDashboard && !hasAccess) {
      return NextResponse.redirect(new URL('/access-denied', request.url))
    }

    // C. GESTION DES ÉTAPES D'ONBOARDING DANS LE DASHBOARD
    if (isInsideDashboard) {
      // Si l'utilisateur a commencé l'onboarding (step 1) mais n'est pas dans le dossier onboarding
      if (step === 1 && !isOnboardingProcess) {
        return NextResponse.redirect(new URL('/dashboard/onboarding', request.url))
      }

      // Si l'onboarding est terminé (step >= 5) et qu'il essaie d'aller sur les pages d'onboarding
      // SAUF la page success (déjà gérée plus haut)
      if (step >= 5 && isOnboardingProcess && !isSuccessPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // Si l'onboarding a commencé, on ne peut plus retourner sur le choix initial
    if (step > 0 && pathname === '/onboarding/choice') {
       return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}