import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

export async function AuthButton() {
  const supabase = await createClient();
  
  // 1. Récupération de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Si connecté, on récupère le profil
  let displayName = user?.email;
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single();

    if (profile?.first_name) {
      displayName = profile.first_name;
    }
  }

  // Style minimaliste Airbnb (minuscules, texte gris foncé, propre)
  const minimalStyle = "group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium text-[#222222] hover:bg-[#F7F7F7] rounded-full transition-all";

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-[#222222] lowercase">
        {displayName}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-1">
      <Link href="/auth/login" className={cn(minimalStyle)}>
        Connexion
      </Link>
      <Link href="/auth/sign-up" className={cn(minimalStyle)}>
        Inscription
      </Link>
    </div>
  );
}