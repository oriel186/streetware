import { NextResponse } from "next/server";
import Stripe from "stripe";
import { addOrder, orderExists } from "@/lib/server/orders";
import { Order } from "@/lib/types";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return NextResponse.json({ error: "Webhook non configure" }, { status: 500 });

  const stripe = new Stripe(secret);
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paid = session.payment_status === "paid";
    if (paid) {
      const metadata = session.metadata || {};
      const orderRef = metadata.orderRef || `VK770-${Date.now().toString().slice(-8)}`;
      const exists = await orderExists(orderRef);
      if (!exists) {
        const parsedCustomer = metadata.customer ? JSON.parse(metadata.customer) : null;
        const parsedItems = metadata.items ? JSON.parse(metadata.items) : [];
        const total = parsedItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
        const order: Order = {
          id: orderRef,
          customer: parsedCustomer || { fullName: "Client", phone: "", address: "", email: session.customer_details?.email || "", notes: "" },
          items: parsedItems,
          paymentMethod: "carte",
          status: "payee",
          total,
          createdAt: new Date().toISOString()
        };
        await addOrder(order);
      }
    }
  }

  return NextResponse.json({ received: true });
}
