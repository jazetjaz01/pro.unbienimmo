import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any, // Utilisez une version stable
});
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pro.unbienimmo.com";
const PRICE_IDS: Record<string, string> = {
  essentiel: process.env.STRIPE_PRICE_ID_ESSENTIEL!,
  professionnel: process.env.STRIPE_PRICE_ID_PRO!,
  expert: process.env.STRIPE_PRICE_ID_EXPERT!,
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient(); // BIEN AJOUTER LE AWAIT ICI
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { packId } = await req.json();
    const priceId = PRICE_IDS[packId];

    if (!priceId) {
      return NextResponse.json({ error: "Pack invalide" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/dashboard/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/dashboard/onboarding/plan`,
      metadata: { userId: user.id, packId: packId },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("STRIPE_ERROR:", error);
    // On renvoie du JSON même en cas d'erreur
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}