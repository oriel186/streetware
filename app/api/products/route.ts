import { NextResponse } from "next/server";
import { Product } from "@/lib/types";
import { createProduct, listProducts } from "@/lib/server/products";
import { isAdminRequest } from "@/lib/server/admin-auth";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = (await req.json()) as Product;
  if (!payload?.id || !payload?.name || !payload?.images?.length) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  const created = await createProduct(payload);
  return NextResponse.json({ product: created });
}
