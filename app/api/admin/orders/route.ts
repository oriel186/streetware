import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { listOrders, updateOrderStatus } from "@/lib/server/orders";
import { OrderStatus } from "@/lib/types";

export async function GET() {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId, status } = (await req.json()) as { orderId: string; status: OrderStatus };
  const updated = await updateOrderStatus(orderId, status);
  if (!updated) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  return NextResponse.json({ order: updated });
}
