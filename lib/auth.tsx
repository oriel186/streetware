"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "@/lib/types";
import { isValidBirthDate, isValidEmail, isValidPhone, normalizePhone } from "@/lib/validation";

type Result = { ok: boolean; message: string };

type AuthContextType = {
  user: User | null;
  signup: (payload: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    birthDate: string;
  }) => Promise<Result>;
  login: (email: string, password: string) => Result;
  updateProfile: (payload: { username: string; fullName: string; email: string; phone: string; address: string; birthDate: string }) => Promise<Result>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);
const USERS_KEY = "kasher_users";
const SESSION_KEY = "kasher_session";

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

function migrateUsersWithUsername(input: User[]) {
  const used = new Set<string>();
  return input.map((u) => {
    const current = (u.username || "").trim().toLowerCase();
    if (current && !used.has(current)) {
      used.add(current);
      return { ...u, username: current };
    }
    const base = usernameBase(u);
    let candidate = base;
    let n = 2;
    while (used.has(candidate)) {
      candidate = `${base}${n}`;
      n += 1;
    }
    used.add(candidate);
    return { ...u, username: candidate };
  });
}

async function syncUser(user: User) {
  const res = await fetch("/api/users/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Erreur serveur" }));
    return { ok: false, message: data.error || "Erreur serveur" };
  }
  return { ok: true, message: "OK" };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    const migratedUsers = migrateUsersWithUsername(users);
    localStorage.setItem(USERS_KEY, JSON.stringify(migratedUsers));

    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw) as User;
    const match = migratedUsers.find((u) => u.email.toLowerCase() === (session.email || "").toLowerCase());
    const migratedSession = match || migrateUsersWithUsername([session])[0];
    localStorage.setItem(SESSION_KEY, JSON.stringify(migratedSession));
    setUser(migratedSession);
  }, []);

  const value = useMemo<AuthContextType>(() => {
    const signup = async (payload: {
      username: string;
      fullName: string;
      email: string;
      password: string;
      phone: string;
      address: string;
      birthDate: string;
    }): Promise<Result> => {
      const raw = localStorage.getItem(USERS_KEY);
      const users = migrateUsersWithUsername(raw ? (JSON.parse(raw) as User[]) : []);
      const normalized = payload.email.trim().toLowerCase();
      const normalizedUsername = payload.username.trim().toLowerCase();
      const normalizedPhone = normalizePhone(payload.phone);
      const normalizedAddress = payload.address.trim();
      if (!normalizedUsername) return { ok: false, message: "Nom d'utilisateur requis." };
      if (!payload.fullName.trim()) return { ok: false, message: "Nom complet requis." };
      if (!isValidEmail(normalized)) return { ok: false, message: "Adresse e-mail invalide." };
      if (!payload.password.trim()) return { ok: false, message: "Mot de passe requis." };
      if (!normalizedPhone) return { ok: false, message: "Numéro de téléphone requis." };
      if (!isValidPhone(normalizedPhone)) return { ok: false, message: "Format du téléphone invalide." };
      if (!normalizedAddress) return { ok: false, message: "Adresse complète requise." };
      if (!payload.birthDate.trim()) return { ok: false, message: "Date de naissance requise." };
      if (!isValidBirthDate(payload.birthDate)) return { ok: false, message: "Format de date invalide." };
      if (users.some((u) => (u.username || "").trim().toLowerCase() === normalizedUsername)) {
        return { ok: false, message: "Ce nom d’utilisateur est déjà utilisé." };
      }
      if (users.some((u) => u.email.toLowerCase() === normalized)) return { ok: false, message: "E-mail déjà utilisé." };
      const newUser: User = {
        username: normalizedUsername,
        fullName: payload.fullName.trim(),
        email: normalized,
        password: payload.password,
        phone: normalizedPhone,
        address: normalizedAddress,
        birthDate: payload.birthDate
      };
      const syncResult = await syncUser(newUser);
      if (!syncResult.ok) return syncResult;
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return { ok: true, message: "Compte créé." };
    };

    const login = (email: string, password: string): Result => {
      const raw = localStorage.getItem(USERS_KEY);
      const users = migrateUsersWithUsername(raw ? (JSON.parse(raw) as User[]) : []);
      const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
      if (!found) return { ok: false, message: "Identifiants invalides." };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify(found));
      setUser(found);
      syncUser(found).catch(() => undefined);
      return { ok: true, message: "Connexion réussie." };
    };

    const updateProfile = async (payload: { username: string; fullName: string; email: string; phone: string; address: string; birthDate: string }): Promise<Result> => {
      if (!user) return { ok: false, message: "Utilisateur non connecté." };
      const raw = localStorage.getItem(USERS_KEY);
      const users = migrateUsersWithUsername(raw ? (JSON.parse(raw) as User[]) : []);
      const normalized = payload.email.trim().toLowerCase();
      const normalizedUsername = payload.username.trim().toLowerCase();
      const normalizedPhone = normalizePhone(payload.phone);
      if (!normalizedUsername) return { ok: false, message: "Nom d'utilisateur requis." };
      if (!payload.fullName.trim()) return { ok: false, message: "Nom complet requis." };
      if (!isValidEmail(normalized)) return { ok: false, message: "Adresse e-mail invalide." };
      if (!normalizedPhone) return { ok: false, message: "Numéro de téléphone requis." };
      if (!isValidPhone(normalizedPhone)) return { ok: false, message: "Format du téléphone invalide." };
      if (!payload.address.trim()) return { ok: false, message: "Adresse complète requise." };
      if (!payload.birthDate.trim()) return { ok: false, message: "Date de naissance requise." };
      if (!isValidBirthDate(payload.birthDate)) return { ok: false, message: "Format de date invalide." };

      const duplicate = users.some((u) => u.email.toLowerCase() === normalized && u.email.toLowerCase() !== user.email.toLowerCase());
      if (duplicate) return { ok: false, message: "Cet e-mail est déjà utilisé." };
      const duplicateUsername = users.some((u) => (u.username || "").trim().toLowerCase() === normalizedUsername && u.email.toLowerCase() !== user.email.toLowerCase());
      if (duplicateUsername) return { ok: false, message: "Ce nom d’utilisateur est déjà utilisé." };

      const updatedUser: User = {
        ...user,
        username: normalizedUsername,
        fullName: payload.fullName.trim(),
        email: normalized,
        phone: normalizedPhone,
        address: payload.address.trim(),
        birthDate: payload.birthDate
      };

      const syncResult = await syncUser(updatedUser);
      if (!syncResult.ok) return syncResult;

      const mapped = users.map((u) => (u.email.toLowerCase() === user.email.toLowerCase() ? updatedUser : u));
      localStorage.setItem(USERS_KEY, JSON.stringify(mapped));
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { ok: true, message: "Profil mis à jour." };
    };

    const logout = () => {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
    };

    return { user, signup, login, updateProfile, logout };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
