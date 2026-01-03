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
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    console.error("❌ Erreur Signature Webhook:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, profId, packId } = session.metadata || {};

      if (userId && profId) {
        console.log(`✅ Session complétée pour l'utilisateur ${userId}`);

        // 1. Mise à jour de la table professionals
        const { error: profError } = await supabase
          .from("professionals")
          .update({ 
            stripe_customer_id: session.customer as string,
            subscription_status: "active",
            subscription_plan: packId, // On récupère le packId des metadata
            is_active: true
          })
          .eq("id", profId);

        if (profError) console.error("❌ Erreur Update Professional:", profError.message);

        // 2. Mise à jour du profil (On passe à l'étape 5 pour finaliser)
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            onboarding_step: 5, // Passez à 5 pour marquer la fin
            is_pro: true 
          })
          .eq("id", userId);

        if (profileError) console.error("❌ Erreur Update Profile:", profileError.message);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      // Correction TypeScript : on récupère les metadata directement sur l'invoice
      // ou via les lignes de facture (lines)
      const packId = invoice.metadata?.packId;

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
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}