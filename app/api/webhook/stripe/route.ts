import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  console.log("🔥 Stripe webhook appelé");

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ Signature ou Secret Webhook manquant");
    return new NextResponse("Configuration Error", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("❌ Erreur de vérification Stripe:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("📦 Event reçu:", event.type);

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    console.log("⏳ Paiement non confirmé");
    return NextResponse.json({ received: true });
  }

  // Extraction des metadata (bien utiliser userId et profId du JSON)
  const userId = session.metadata?.userId;
  const profId = session.metadata?.profId;
  const packId = session.metadata?.packId ?? null;

  console.log("🧾 Metadata reçues:", { userId, profId, packId });

  if (!userId || !profId) {
    console.error("❌ IDs manquants dans les metadata");
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  // -------------------------
  // 1️⃣ UPDATE PROFILES
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

  if (profileError) console.error("❌ Erreur Profile:", profileError);
  console.log("🧠 PROFILE UPDATE SUCCESS:", profileData);

  // -------------------------
  // 2️⃣ UPDATE PROFESSIONALS
  // On utilise l'ID de la table pour une précision maximale
  // -------------------------
  const { data: professionalData, error: professionalError } = await supabase
    .from("professionals")
    .update({
      stripe_customer_id: session.customer as string,
      subscription_status: "active",
      subscription_plan: packId,
      is_active: true,
      legal_name: session.customer_details?.name || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profId) // Utilisation de l'ID primaire de la table professionals
    .select();

  if (professionalError) console.error("❌ Erreur Professional:", professionalError);
  console.log("🏢 PROFESSIONAL UPDATE SUCCESS:", professionalData);

  return NextResponse.json({ received: true });
}