import { NextResponse } from "next/server";
import { deleteProduct, getProductById, updateProduct } from "@/lib/server/products";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { Product } from "@/lib/types";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const patch = (await req.json()) as Partial<Product>;
  const updated = await updateProduct(params.id, patch);
  if (!updated) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteProduct(params.id);
  if (!ok) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
