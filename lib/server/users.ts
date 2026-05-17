import { promises as fs } from "fs";
import path from "path";
import { User } from "@/lib/types";
import { isValidBirthDate, isValidEmail, isValidPhone, normalizePhone } from "@/lib/validation";

const DB_PATH = path.join(process.cwd(), "data", "users.db.json");

type UsersDB = { users: User[] };
function normalizeUsername(username?: string) {
  return (username || "").trim().toLowerCase();
}
function slugPart(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}
function usernameBase(user: User) {
  const fromUsername = slugPart(user.username || "");
  if (fromUsername) return fromUsername;
  const fromName = slugPart(user.fullName || "");
  if (fromName) return fromName;
  const fromEmail = slugPart((user.email || "").split("@")[0] || "");
  if (fromEmail) return fromEmail;
  return "client";
}
function uniqueUsername(base: string, used: Set<string>) {
  let candidate = base || "client";
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base}${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

export type UsernameMigrationSummary = {
  updated: number;
  conflictsResolved: number;
  errors: string[];
};

function validateRequiredUserFields(user: User) {
  if (!user.fullName?.trim()) throw new Error("FULLNAME_REQUIRED");
  if (!isValidEmail(user.email || "")) throw new Error("INVALID_EMAIL");
  if (!user.password?.trim()) throw new Error("PASSWORD_REQUIRED");
  if (!user.phone?.trim()) throw new Error("PHONE_REQUIRED");
  if (!isValidPhone(user.phone)) throw new Error("INVALID_PHONE");
  if (!user.address?.trim()) throw new Error("ADDRESS_REQUIRED");
  if (!user.birthDate?.trim()) throw new Error("BIRTHDATE_REQUIRED");
  if (!isValidBirthDate(user.birthDate)) throw new Error("INVALID_BIRTHDATE");
}

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
}

async function readDb(): Promise<UsersDB> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  const db = JSON.parse(raw) as UsersDB;
  const used = new Set<string>();
  let changed = false;
  const migrated = db.users.map((u) => {
    const current = normalizeUsername(u.username);
    if (current && !used.has(current)) {
      used.add(current);
      return { ...u, username: current };
    }
    changed = true;
    const base = usernameBase(u);
    const username = uniqueUsername(base, used);
    return { ...u, username };
  });
  if (changed) {
    const next = { users: migrated };
    await writeDb(next);
    return next;
  }
  return { users: migrated };
}

async function writeDb(db: UsersDB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function listUsers() {
  const db = await readDb();
  return db.users;
}

export async function upsertUser(user: User) {
  const db = await readDb();
  validateRequiredUserFields(user);
  const username = normalizeUsername(user.username);
  if (!username) throw new Error("USERNAME_REQUIRED");
  const usernameTaken = db.users.some(
    (u) => normalizeUsername(u.username) === username && u.email.toLowerCase() !== user.email.toLowerCase()
  );
  if (usernameTaken) throw new Error("USERNAME_TAKEN");
  const idx = db.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (idx === -1) db.users.unshift({ ...user, username, phone: normalizePhone(user.phone || "") });
  else db.users[idx] = { ...user, username, phone: normalizePhone(user.phone || "") };
  await writeDb(db);
  return { ...user, username };
}

export async function updateUser(email: string, patch: Partial<User>) {
  const db = await readDb();
  const idx = db.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  if (typeof patch.username !== "undefined") {
    const username = normalizeUsername(patch.username);
    if (!username) throw new Error("USERNAME_REQUIRED");
    const usernameTaken = db.users.some(
      (u, i) => normalizeUsername(u.username) === username && i !== idx
    );
    if (usernameTaken) throw new Error("USERNAME_TAKEN");
    patch.username = username;
  }
  if (typeof patch.email !== "undefined" && !isValidEmail(patch.email)) throw new Error("INVALID_EMAIL");
  if (typeof patch.phone !== "undefined") {
    if (!patch.phone.trim()) throw new Error("PHONE_REQUIRED");
    if (!isValidPhone(patch.phone)) throw new Error("INVALID_PHONE");
    patch.phone = normalizePhone(patch.phone);
  }
  if (typeof patch.address !== "undefined" && !patch.address.trim()) throw new Error("ADDRESS_REQUIRED");
  if (typeof patch.birthDate !== "undefined") {
    if (!patch.birthDate.trim()) throw new Error("BIRTHDATE_REQUIRED");
    if (!isValidBirthDate(patch.birthDate)) throw new Error("INVALID_BIRTHDATE");
  }
  db.users[idx] = { ...db.users[idx], ...patch };
  await writeDb(db);
  return db.users[idx];
}

export async function deleteUser(email: string) {
  const db = await readDb();
  const next = db.users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
  if (next.length === db.users.length) return false;
  await writeDb({ users: next });
  return true;
}

export async function migrateUsernames(): Promise<UsernameMigrationSummary> {
  const db = await readDb();
  const summary: UsernameMigrationSummary = { updated: 0, conflictsResolved: 0, errors: [] };
  const used = new Set<string>();
  const seen = new Map<string, number>();

  const nextUsers = db.users.map((u, idx) => {
    try {
      const current = normalizeUsername(u.username);
      if (current && !used.has(current)) {
        used.add(current);
        seen.set(current, (seen.get(current) || 0) + 1);
        if (u.username !== current) {
          summary.updated += 1;
          return { ...u, username: current };
        }
        return u;
      }

      const isConflict = Boolean(current && used.has(current));
      const base = usernameBase(u);
      const username = uniqueUsername(base, used);
      seen.set(username, (seen.get(username) || 0) + 1);
      summary.updated += 1;
      if (isConflict) summary.conflictsResolved += 1;
      return { ...u, username };
    } catch {
      summary.errors.push(`Erreur migration utilisateur index ${idx}`);
      return u;
    }
  });

  const before = JSON.stringify(db.users);
  const after = JSON.stringify(nextUsers);
  if (before !== after) await writeDb({ users: nextUsers });
  return summary;
}
