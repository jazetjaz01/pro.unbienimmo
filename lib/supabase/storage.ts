// lib/supabase/storage.ts

export function getFullPublicUrl(path: string | null, bucket: string = 'images'): string {
  if (!path) return '';

  // Si le path est déjà une URL complète (http...), on le retourne tel quel
  if (path.startsWith('http')) return path;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.warn("NEXT_PUBLIC_SUPABASE_URL n'est pas défini");
    return '';
  }

  // Construction de l'URL publique standard Supabase
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}