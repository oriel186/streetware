import { NextResponse } from "next/server";
import { createAdminToken, setAdminCookie } from "@/lib/server/admin-auth";
import { listUsers } from "@/lib/server/users";

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email: string; password: string };
  const configuredEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  const fallbackEmail = (process.env.ADMIN_EMAIL || "admin@vk770.com").toLowerCase();
  const expectedEmails = configuredEmails.length ? configuredEmails : [fallbackEmail];
  const expectedPassword = process.env.ADMIN_PASSWORD || "vk770admin";
  const normalizedEmail = (email || "").toLowerCase();

  if (!expectedEmails.includes(normalizedEmail)) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  // Admin générique (fallback)
  if (password === expectedPassword) {
    setAdminCookie(createAdminToken());
    return NextResponse.json({ ok: true });
  }

  // Admin via mot de passe du compte client existant
  const users = await listUsers();
  const found = users.find((u) => (u.email || "").toLowerCase() === normalizedEmail);
  if (!found || found.password !== password) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  setAdminCookie(createAdminToken());
  return NextResponse.json({ ok: true });
}
