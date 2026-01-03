import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

const PRICE_IDS: Record<string, string> = {
  essentiel: process.env.STRIPE_PRICE_ID_ESSENTIEL!,
  professionnel: process.env.STRIPE_PRICE_ID_PRO!,
  expert: process.env.STRIPE_PRICE_ID_EXPERT!,
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { packId } = await req.json();
    const priceId = PRICE_IDS[packId];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pro.unbienimmo.com";

    // 1. Récupérer les infos pro dans la table 'professionals'
    const supabaseAdmin = createAdminClient();
    const { data: prof, error: profError } = await supabaseAdmin
      .from("professionals")
      .select("*")
      .eq("owner_id", user.id) // Utilisation de owner_id selon votre schéma
      .single();

    if (profError || !prof) {
      return NextResponse.json({ error: "Profil professionnel introuvable" }, { status: 400 });
    }

    let stripeCustomerId = prof.stripe_customer_id;

    // 2. Créer ou mettre à jour le client Stripe avec vos données Supabase
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: prof.email || user.email,
        name: prof.legal_name || prof.name, // Nom légal pour la facture
        address: {
          line1: prof.street_address,
          city: prof.city,
          postal_code: prof.zip_code,
          country: prof.country || "FR",
        },
        metadata: {
          supabase_prof_id: prof.id,
        },
      });
      stripeCustomerId = customer.id;

      // Optionnel : Sauvegarder immédiatement l'ID dans Supabase
      await supabaseAdmin
        .from("professionals")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", prof.id);
    }

    // 3. Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/dashboard/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/onboarding/plan`,
      
      // Paramètres pour une facture légale en France
      automatic_tax: { enabled: true },
      billing_address_collection: "auto", // Utilise l'adresse déjà fournie
      tax_id_collection: { enabled: true }, // Permet de saisir la TVA si absente
      
      metadata: {
        userId: user.id,
        profId: prof.id,
        packId: packId,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("STRIPE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}