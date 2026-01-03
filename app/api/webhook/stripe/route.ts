import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  console.log("🔥 Stripe webhook appelé");

  // 1. Lecture du body brut (OBLIGATOIRE pour Stripe)
  const body = await req.text();

  // 2. Récupération de la signature Stripe
  const signature = headers().get("stripe-signature");

  if (!signature) {
    console.error("❌ Signature Stripe absente");
    return new NextResponse("No Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  // 3. Vérification de la signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Erreur de vérification Stripe:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("📦 Event reçu:", event.type);

  // 4. Initialisation Supabase ADMIN
  const supabase = createAdminClient();

  // 5. Traitement du checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Sécurité minimale
    if (session.payment_status !== "paid") {
      console.log("⏳ Paiement non confirmé");
      return NextResponse.json({ received: true });
    }

    const userId = session.metadata?.userId;
    const packId = session.metadata?.packId;

    console.log("🧾 Metadata reçues:", { userId, packId });

    if (!userId) {
      console.error("❌ userId manquant dans les metadata");
      return NextResponse.json({ received: true });
    }

    // -------------------------
    // 6. UPDATE PROFILES
    // -------------------------
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({
        onboarding_step: 5,
        is_pro: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select();

    if (profileError) {
      console.error("❌ Erreur update profiles:", profileError);
    } else {
      console.log("✅ Profile mis à jour:", profileData);
    }

    // -------------------------
    // 7. UPDATE PROFESSIONALS
    // IMPORTANT : jointure sur owner_id
    // -------------------------
    const { data: professionalData, error: professionalError } =
      await supabase
        .from("professionals")
        .update({
          stripe_customer_id: session.customer as string,
          subscription_status: "active",
          subscription_plan: packId ?? null,
          is_active: true,
          legal_name: session.customer_details?.name || null,
          updated_at: new Date().toISOString(),
        })
        .eq("owner_id", userId)
        .select();

    if (professionalError) {
      console.error(
        "❌ Erreur update professionals:",
        professionalError
      );
    } else {
      console.log(
        "✅ Professional mis à jour:",
        professionalData
      );
    }
  }

  return NextResponse.json({ received: true });
}
