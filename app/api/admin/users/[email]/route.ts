import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { deleteUser, updateUser } from "@/lib/server/users";
import { User } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: { email: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const patch = (await req.json()) as Partial<User>;
  let updated = null;
  try {
    updated = await updateUser(decodeURIComponent(params.email), patch);
  } catch (error) {
    const code = (error as Error).message;
    if (code === "USERNAME_TAKEN") {
      return NextResponse.json({ error: "Ce nom d’utilisateur est déjà utilisé." }, { status: 409 });
    }
    if (code === "INVALID_PHONE") return NextResponse.json({ error: "Format du téléphone invalide." }, { status: 400 });
    if (code === "INVALID_EMAIL") return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    if (code === "INVALID_BIRTHDATE") return NextResponse.json({ error: "Format de date invalide." }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  if (!updated) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json({ user: updated });
}

export async function DELETE(_: Request, { params }: { params: { email: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteUser(decodeURIComponent(params.email));
  if (!ok) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
