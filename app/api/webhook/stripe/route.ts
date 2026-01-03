import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin"; // Chemin vers votre fonction

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2023-10-16" as any 
});

export async function POST(req: Request) {
  const body = await req.text();
  
  // Correction ici : on ajoute await devant headers()
  const headerList = await headers(); 
  const signature = headerList.get("Stripe-Signature") as string;

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  let event: Stripe.Event;
  
  // ... reste du code pour constructEvent

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Initialisation du client admin
  const supabaseAdmin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const userId = session.metadata?.userId;
    const packId = session.metadata?.packId;

    if (userId) {
      // Mise à jour propre avec le client Admin
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ 
          onboarding_step: 5,
          subscription_status: 'active',
          plan_id: packId,
          stripe_customer_id: session.customer as string,
        })
        .eq("id", userId);

      if (error) {
        console.error("Erreur mise à jour profil:", error);
        return new NextResponse("Database error", { status: 500 });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}