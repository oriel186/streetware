import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: "Stripe non configure" }, { status: 500 });

    const { items, customerEmail, customer, orderRef } = (await req.json()) as {
      items: Array<{ name: string; price: number; quantity: number }>;
      customerEmail?: string;
      customer?: string;
      orderRef?: string;
    };

    const stripe = new Stripe(secret);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      metadata: {
        orderRef: orderRef || "",
        customer: customer || "",
        items: JSON.stringify(items || [])
      },
      line_items: (items || []).map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(item.price * 100),
          product_data: { name: item.name }
        }
      })),
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelled=1`
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Erreur Stripe Checkout." }, { status: 500 });
  }
}
