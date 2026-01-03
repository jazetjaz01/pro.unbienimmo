import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ Webhook: Signature ou Secret manquant");
    return NextResponse.json({ error: "Configuration manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // ATTENTION : Doit correspondre EXACTEMENT à vos metadata Stripe
      const userId = session.metadata?.userId; 
      const profId = session.metadata?.profId;
      const stripeCustomerId = session.customer as string;

      if (!userId) {
        console.error("❌ Pas de userId dans les metadata de la session");
        break;
      }

      // 1. On débloque l'accès immédiat
      const { error: errorProfile } = await supabase
        .from("profiles")
        .update({ onboarding_step: 5, is_pro: true })
        .eq("id", userId);

      // 2. On lie le client Stripe au professionnel
      const { error: errorProf } = await supabase
        .from("professionals")
        .update({ 
          stripe_customer_id: stripeCustomerId,
          subscription_status: 'active' // Optionnel ici, peut attendre invoice.paid
        })
        .eq("owner_id", userId); // Utilise owner_id pour être sûr de cibler le bon
      
      if (errorProfile || errorProf) {
        console.error("❌ Erreur SQL:", { errorProfile, errorProf });
      } else {
        console.log(`✅ Onboarding fini et Stripe ID lié pour ${userId}`);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from("professionals")
        .update({
          subscription_status: 'active',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq("stripe_customer_id", customerId);
      
      console.log(`💰 Paiement confirmé pour le client ${customerId}`);
      break;
    }

    case "invoice.payment_failed":
    case "customer.subscription.deleted": {
      const sessionOrSub = event.data.object as any;
      const customerId = sessionOrSub.customer as string;

      await supabase
        .from("professionals")
        .update({
          subscription_status: 'past_due',
          is_active: false
        })
        .eq("stripe_customer_id", customerId);
      
      console.log(`❌ Abonnement suspendu pour le client ${customerId}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}