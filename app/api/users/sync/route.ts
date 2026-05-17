import { NextResponse } from "next/server";
import { User } from "@/lib/types";
import { upsertUser } from "@/lib/server/users";

export async function POST(req: Request) {
  const user = (await req.json()) as User;
  if (!user?.email || !user?.fullName || !user?.username || !user?.phone || !user?.address || !user?.birthDate || !user?.password) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  try {
    await upsertUser(user);
  } catch (error) {
    const code = (error as Error).message;
    if (code === "USERNAME_TAKEN") {
      return NextResponse.json({ error: "Ce nom d’utilisateur est déjà utilisé." }, { status: 409 });
    }
    if (code === "INVALID_PHONE") return NextResponse.json({ error: "Format du téléphone invalide." }, { status: 400 });
    if (code === "INVALID_EMAIL") return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    if (code === "INVALID_BIRTHDATE") return NextResponse.json({ error: "Format de date invalide." }, { status: 400 });
    if (code === "PHONE_REQUIRED") return NextResponse.json({ error: "Numéro de téléphone requis." }, { status: 400 });
    if (code === "ADDRESS_REQUIRED") return NextResponse.json({ error: "Adresse complète requise." }, { status: 400 });
    if (code === "BIRTHDATE_REQUIRED") return NextResponse.json({ error: "Date de naissance requise." }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
