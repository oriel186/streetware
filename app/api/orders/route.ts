import { NextResponse } from "next/server";
import { addOrder, listOrdersByEmail } from "@/lib/server/orders";
import { Order, OrderStatus } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ orders: [] });
  const orders = await listOrdersByEmail(email);
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { customer, items, paymentMethod } = body as {
    customer: Order["customer"];
    items: Order["items"];
    paymentMethod: Order["paymentMethod"];
  };

  if (!customer || !items?.length) return NextResponse.json({ error: "Payload invalide" }, { status: 400 });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const status: OrderStatus = paymentMethod === "carte" ? "payee" : "en attente";
  const order: Order = {
    id: `VK770-${Date.now().toString().slice(-8)}`,
    customer,
    items,
    paymentMethod,
    status,
    total,
    createdAt: new Date().toISOString()
  };

  await addOrder(order);
  return NextResponse.json({ order });
}
