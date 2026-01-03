import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Initialisation de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;
  let event: Stripe.Event;

  // 1. Validation de la signature Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`❌ Webhook Signature Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // 2. Initialisation du client Admin Supabase
  const supabase = createAdminClient();

  // 3. Traitement des événements
  try {
    switch (event.type) {
      
      /**
       * ÉVÉNEMENT : Session de paiement terminée avec succès
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extraction des métadonnées (correspond au JSON que vous avez envoyé)
        const userId = session.metadata?.userId;
        const profId = session.metadata?.profId;
        const packId = session.metadata?.packId;

        console.log(`🔔 Webhook reçu: Session terminée pour l'utilisateur ${userId}`);

        if (userId && profId) {
          // A. Mise à jour des infos de souscription dans 'professionals'
          const { error: profError } = await supabase
            .from("professionals")
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: "active",
              subscription_plan: packId,
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq("id", profId);

          if (profError) {
            console.error("❌ Erreur mise à jour professionals:", profError.message);
          }

          // B. Mise à jour de l'étape d'onboarding dans 'profiles'
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ 
              onboarding_step: 5, // Passage à l'étape finale
              is_pro: true 
            })
            .eq("id", userId);

          if (profileError) {
            console.error("❌ Erreur mise à jour profiles:", profileError.message);
          }

          console.log("✅ Base de données synchronisée avec Stripe.");
        }
        break;
      }

      /**
       * ÉVÉNEMENT : Paiement de facture réussi (Renouvellements)
       */
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        
        await supabase
          .from("professionals")
          .update({
            subscription_status: "active",
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_customer_id", invoice.customer as string);
        
        console.log(`💳 Facture payée pour le client Stripe: ${invoice.customer}`);
        break;
      }

      /**
       * ÉVÉNEMENT : Échec de paiement ou fin d'abonnement
       */
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const dataObject = event.data.object as any;
        
        await supabase
          .from("professionals")
          .update({ 
            subscription_status: "past_due", 
            is_active: false 
          })
          .eq("stripe_customer_id", dataObject.customer as string);
        
        console.log(`⚠️ Abonnement suspendu ou paiement échoué pour: ${dataObject.customer}`);
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error("🚨 Erreur interne du Webhook:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}