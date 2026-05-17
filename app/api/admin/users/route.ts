import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { listUsers } from "@/lib/server/users";

export async function GET() {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await listUsers();
  return NextResponse.json({ users });
}
