import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

export async function AuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Ton style exact du NavMenu
  const minimalStyle = "group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-gray-900 transition-colors bg-transparent relative after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-gray-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left";

  return user ? (
    <div className="flex items-center gap-6">
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
        {user.email}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {/* CONNEXION */}
      <Link href="/auth/login" className={cn(minimalStyle)}>
        Connexion
      </Link>

      {/* INSCRIPTION (Style identique) */}
      <Link href="/auth/sign-up" className={cn(minimalStyle)}>
        Inscription
      </Link>
    </div>
  );
}