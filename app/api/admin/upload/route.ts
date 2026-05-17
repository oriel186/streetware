import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdminRequest } from "@/lib/server/admin-auth";

function safeExt(filename: string) {
  const ext = path.extname(filename || "").toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return ext;
  return ".jpg";
}

export async function POST(req: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = safeExt(file.name);
  const filename = `admin-${Date.now()}${ext}`;
  const outDir = path.join(process.cwd(), "public", "products");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, filename), buffer);

  return NextResponse.json({ url: `/products/${filename}` });
}
