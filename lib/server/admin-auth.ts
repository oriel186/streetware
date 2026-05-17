import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "vk770_admin";
const MAX_AGE = 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "change_me_admin_secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function createAdminToken() {
  const payload = `${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function setAdminCookie(token: string) {
  cookies().set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: MAX_AGE });
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 0 });
}

export function isAdminRequest() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}
