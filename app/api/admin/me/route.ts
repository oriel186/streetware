import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";

export async function GET() {
  return NextResponse.json({ authenticated: isAdminRequest() });
}
