import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Erreur Webhook Stripe: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // On extrait les metadata exactement comme dans votre JSON
    const userId = session.metadata?.userId;
    const profId = session.metadata?.profId;
    const packId = session.metadata?.packId;

    if (userId && profId) {
      console.log(`🚀 Traitement du paiement pour l'utilisateur: ${userId}`);

      // 1. Mise à jour du profil (Étape finale)
      const { error: errorProfile } = await supabase
        .from("profiles")
        .update({ 
          onboarding_step: 5, 
          is_pro: true 
        })
        .eq("id", userId);

      // 2. Mise à jour de la table "professionals"
      const { error: errorProf } = await supabase
        .from("professionals")
        .update({ 
          stripe_customer_id: session.customer as string,
          subscription_status: 'active',
          subscription_plan: packId,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", profId); // On utilise l'ID de la table professionals

      if (errorProfile || errorProf) {
        console.error("❌ Erreur Supabase:", { errorProfile, errorProf });
      } else {
        console.log("✅ Base de données mise à jour avec succès !");
      }
    }
  }

  return NextResponse.json({ received: true });
}