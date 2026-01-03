import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    // Vérification que la requête vient bien de Stripe
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`❌ Erreur Signature Webhook: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      /**
       * ÉVÉNEMENT : Paiement réussi (Premier achat ou abonnement)
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, profId, packId } = session.metadata || {};

        if (userId && profId) {
          console.log(`✅ Paiement validé pour profId: ${profId}`);

          // 1. Mise à jour de la table "professionals"
          const { error: profError } = await supabase
            .from("professionals")
            .update({ 
              stripe_customer_id: session.customer as string,
              subscription_status: "active",
              subscription_plan: packId, // Ex: 'expert', 'professionnel'
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq("id", profId);

          if (profError) throw new Error(`Erreur Professionals: ${profError.message}`);

          // 2. Mise à jour du profil pour débloquer l'accès au Dashboard (Step 5)
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ 
              onboarding_step: 5, 
              is_pro: true 
            })
            .eq("id", userId);

          if (profileError) throw new Error(`Erreur Profile: ${profileError.message}`);
        }
        break;
      }

      /**
       * ÉVÉNEMENT : Facture payée (Renouvellement d'abonnement)
       */
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // On utilise l'ID client de Stripe pour retrouver le pro
        await supabase
          .from("professionals")
          .update({
            subscription_status: "active",
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_customer_id", invoice.customer as string);
        break;
      }

      /**
       * ÉVÉNEMENT : Échec de paiement ou désabonnement
       */
      case "invoice.payment_failed":
      case "customer.subscription.deleted": {
        const sessionOrInvoice = event.data.object as any;
        
        await supabase
          .from("professionals")
          .update({ 
            subscription_status: "past_due", 
            is_active: false 
          })
          .eq("stripe_customer_id", sessionOrInvoice.customer as string);
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (err: any) {
    console.error("🚨 Erreur lors du traitement du Webhook:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}