import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" as any });

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const profId = session.metadata?.profId;
    const packId = session.metadata?.packId;

    if (profId) {
      await supabaseAdmin
        .from("professionals")
        .update({ 
          subscription_plan: packId,
          subscription_status: "active",
          stripe_customer_id: session.customer as string,
          is_active: true
        })
        .eq("id", profId);
    }
  }

  return new NextResponse(null, { status: 200 });
}