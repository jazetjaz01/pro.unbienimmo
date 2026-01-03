import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // On récupère les variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Nom standard recommandé

  // Sécurité pour le développement
  if (!url || !anonKey) {
    console.error("Variables Supabase manquantes dans le navigateur")
  }

  return createBrowserClient(
    url!,
    anonKey!
  )
}