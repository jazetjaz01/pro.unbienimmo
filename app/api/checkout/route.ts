import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  try {
    const { packId } = await req.json();
    const supabase = await createClient();
    
    // 1. Récupération de l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Session expirée, veuillez vous reconnecter" }, { status: 401 });
    }

    // 2. Client Admin pour contourner les RLS
    const supabaseAdmin = createAdminClient();

    // 3. Tentative de récupération du profil professionnel
    let { data: prof, error: profError } = await supabaseAdmin
      .from("professionals")
      .select("id, stripe_customer_id")
      .eq("owner_id", user.id)
      .maybeSingle();

    // 4. AUTO-CRÉATION (avec sécurité sur l'email)
    if (!prof) {
      // Sécurité : Si l'email est manquant dans l'objet user, on crée un fallback
      // pour éviter l'erreur "column email contains null values"
      const safeEmail = user.email || `pro_${user.id.slice(0, 8)}@unbienimmo.local`;
      
      console.log("🛠️ Création du profil pro pour l'utilisateur:", user.id, "avec l'email:", safeEmail);
      
      const { data: newProf, error: createError } = await supabaseAdmin
        .from("professionals")
        .insert([{ 
          owner_id: user.id,
          email: safeEmail,
          subscription_status: 'trialing' 
        }])
        .select()
        .single();

      if (createError || !newProf) {
        console.error("❌ ERREUR SUPABASE (Insertion):", createError?.message);
        return NextResponse.json({ 
          error: `Base de données : ${createError?.message || "Échec de création du profil pro"}` 
        }, { status: 500 });
      }
      
      prof = newProf;
    }

    // 5. VÉRIFICATION TYPESCRIPT
    if (!prof || !prof.id) {
      return NextResponse.json({ error: "Données de profil introuvables." }, { status: 500 });
    }

    // 6. Mapping des Price IDs
    const PRICE_IDS: Record<string, string | undefined> = {
      essentiel: process.env.STRIPE_PRICE_ID_ESSENTIEL,
      professionnel: process.env.STRIPE_PRICE_ID_PRO,
      expert: process.env.STRIPE_PRICE_ID_EXPERT,
    };

    const priceId = PRICE_IDS[packId];

    if (!priceId) {
      console.error("❌ Price ID introuvable pour le pack:", packId);
      return NextResponse.json({ error: "Ce pack n'est pas encore configuré dans Stripe." }, { status: 400 });
    }

    // 7. Création de la session Checkout Stripe
    console.log("💳 Lancement de Stripe Checkout pour profId:", prof.id);
    
    // On définit l'email pour Stripe
    const customerEmail = user.email || undefined;

    const session = await stripe.checkout.sessions.create({
      // Si on a déjà un client Stripe (stripe_customer_id), on l'utilise
      // sinon on passe l'email pour que Stripe crée le client
      customer: prof.stripe_customer_id || undefined,
      customer_email: prof.stripe_customer_id ? undefined : customerEmail,
      
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/onboarding/subscription`,
      
      metadata: {
        userId: user.id,
        profId: String(prof.id), 
        packId: packId
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("🚨 ERREUR STRIPE API:", error.message);
    return NextResponse.json(
      { error: `Erreur Stripe : ${error.message}` },
      { status: 500 }
    );
  }
}