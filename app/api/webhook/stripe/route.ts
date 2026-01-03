import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Erreur de signature Webhook: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  // Traitement de l'événement
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extraction précise selon votre JSON
    const userId = session.metadata?.userId;
    const profId = session.metadata?.profId;
    const packId = session.metadata?.packId;

    console.log("🔔 Webhook Checkout Reçu :", { userId, profId, packId });

    if (userId && profId) {
      // 1. Mise à jour de la table PROFILES
      const { error: errorProfile } = await supabase
        .from("profiles")
        .update({ 
          onboarding_step: 5, 
          is_pro: true 
        })
        .eq("id", userId);

      if (errorProfile) console.error("❌ Erreur Profile Update:", errorProfile);

      // 2. Mise à jour de la table PROFESSIONALS
      // Note : on remplit aussi 'legal_name' avec le nom de facturation Stripe
      const { error: errorProf } = await supabase
        .from("professionals")
        .update({ 
          stripe_customer_id: session.customer as string,
          subscription_status: 'active',
          subscription_plan: packId,
          is_active: true,
          legal_name: session.customer_details?.name || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", profId);

      if (errorProf) console.error("❌ Erreur Professionals Update:", errorProf);

      if (!errorProfile && !errorProf) {
        console.log("✅ BRAVO : Les tables sont synchronisées !");
      }
    } else {
      console.error("⚠️ Metadata manquantes dans la session Stripe.");
    }
  }

  return NextResponse.json({ received: true });
}