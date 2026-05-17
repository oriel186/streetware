"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";

export function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("/api/admin/me").then((r) => r.json()).then((d) => { if (d.authenticated) router.replace("/admin"); });
  }, [router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) {
      toast({ title: "Acces refuse", description: "Identifiants admin invalides." });
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="container max-w-lg space-y-6 pb-20 pt-10">
      <h1 className="font-display text-6xl">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
        <input required type="email" placeholder="Email admin" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Mot de passe" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">Se connecter</button>
      </form>
    </div>
  );
}
