import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { migrateUsernames } from "@/lib/server/users";

export async function POST(req: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { confirmText?: string };
  if ((body.confirmText || "").trim().toUpperCase() !== "MIGRER") {
    return NextResponse.json({ error: "Confirmation requise." }, { status: 400 });
  }

  const summary = await migrateUsernames();
  return NextResponse.json({ summary });
}
