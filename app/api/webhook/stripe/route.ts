import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  console.log("🔥 Stripe webhook appelé");

  // 1️⃣ Lecture du body brut (OBLIGATOIRE)
  const body = await req.text();

  // 2️⃣ Signature Stripe (UTILISER req.headers)
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Signature Stripe absente");
    return new NextResponse("No Stripe signature", { status: 400 });
  }

  // 3️⃣ Vérification de la signature Stripe
  let event: Stripe.Event;

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

  // 4️⃣ On ne crée Supabase QUE si nécessaire
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // 5️⃣ Sécurité paiement
  if (session.payment_status !== "paid") {
    console.log("⏳ Paiement non confirmé");
    return NextResponse.json({ received: true });
  }

  const userId = session.metadata?.userId;
  const packId = session.metadata?.packId ?? null;

  console.log("🧾 Metadata reçues:", { userId, packId });

  if (!userId) {
    console.error("❌ userId manquant dans les metadata");
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  // -------------------------
  // 6️⃣ UPDATE PROFILES
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

  console.log("🧠 PROFILE UPDATE:", profileData, profileError);

  // -------------------------
  // 7️⃣ UPDATE PROFESSIONALS
  // jointure correcte = owner_id
  // -------------------------
  const { data: professionalData, error: professionalError } =
    await supabase
      .from("professionals")
      .update({
        stripe_customer_id: session.customer as string,
        subscription_status: "active",
        subscription_plan: packId,
        is_active: true,
        legal_name: session.customer_details?.name || null,
        updated_at: new Date().toISOString(),
      })
      .eq("owner_id", userId)
      .select();

  console.log(
    "🏢 PROFESSIONAL UPDATE:",
    professionalData,
    professionalError
  );

  return NextResponse.json({ received: true });
}
