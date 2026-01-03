import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ✅ EXCEPTION : On laisse passer Stripe sans aucune redirection ni vérification
  // On vérifie avec et sans le "s" pour être totalement sécurisé
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

    const isInsideDashboard = pathname.startsWith('/dashboard')
    const isOnboardingProcess = pathname.startsWith('/dashboard/onboarding')
    const hasAccessPermission = profile?.is_pro || profile?.is_admin || isOnboardingProcess

    if (isInsideDashboard && !hasAccessPermission) {
      return NextResponse.redirect(new URL('/access-denied', request.url))
    }

    if (isInsideDashboard) {
      if (step === 1 && !isOnboardingProcess) {
        return NextResponse.redirect(new URL('/dashboard/onboarding', request.url))
      }
      if (step >= 5 && isOnboardingProcess) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    if (step > 0 && isOnboardingChoicePage) {
       return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}