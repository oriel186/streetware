"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import { Reveal } from "@/components/ui/reveal";

export function AuthPage() {
  const router = useRouter();
  const { user, signup, login, updateProfile, logout } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profileUsername, setProfileUsername] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileBirthDate, setProfileBirthDate] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileUsername(user.username || "");
    setProfileName(user.fullName || "");
    setProfileEmail(user.email || "");
    setProfilePhone(user.phone || "");
    setProfileAddress(user.address || "");
    setProfileBirthDate(user.birthDate || "");

    const loadOrders = async () => {
      setLoadingOrders(true);
      const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setLoadingOrders(false);
    };
    loadOrders();
  }, [user]);

  const submitAuth = async (e: FormEvent) => {
    e.preventDefault();
    const res = mode === "signup"
      ? await signup({ username, fullName, email, password, phone: profilePhone, address: profileAddress, birthDate: profileBirthDate })
      : login(email, password);
    toast({ title: res.ok ? "Succès" : "Erreur", description: res.message });
    if (res.ok) router.push("/auth");
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({ username: profileUsername, fullName: profileName, email: profileEmail, phone: profilePhone, address: profileAddress, birthDate: profileBirthDate });
    toast({ title: res.ok ? "Succès" : "Erreur", description: res.message });
  };

  if (!user) {
    return (
      <div className="container max-w-xl space-y-6 pb-20 pt-10">
        <Reveal><h1 className="font-display text-5xl sm:text-6xl">Compte</h1></Reveal>
        <div className="flex gap-2 rounded-full border border-zinc-300 p-1">
          <button onClick={() => setMode("signup")} className={`rounded-full px-4 py-2 text-sm ${mode === "signup" ? "bg-black text-white" : "text-zinc-600"}`}>S'inscrire</button>
          <button onClick={() => setMode("login")} className={`rounded-full px-4 py-2 text-sm ${mode === "login" ? "bg-black text-white" : "text-zinc-600"}`}>Se connecter</button>
        </div>
        <form onSubmit={submitAuth} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
          {mode === "signup" && <input required placeholder="Nom d'utilisateur" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={username} onChange={(e) => setUsername(e.target.value)} />}
          {mode === "signup" && <input required placeholder="Nom complet" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={fullName} onChange={(e) => setFullName(e.target.value)} />}
          <input required type="email" placeholder="E-mail" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Mot de passe" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === "signup" && <input required type="tel" placeholder="Téléphone" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />}
          {mode === "signup" && <input required placeholder="Adresse complète" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} />}
          {mode === "signup" && <input required type="date" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profileBirthDate} onChange={(e) => setProfileBirthDate(e.target.value)} />}
          <button className="w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">{mode === "signup" ? "Créer le compte" : "Se connecter"}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container space-y-8 pb-20 pt-8">
      <Reveal><h1 className="font-display text-5xl sm:text-6xl">Mon compte</h1></Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={saveProfile} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Informations client</p>
          <input required className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} placeholder="Nom d'utilisateur" />
          <input required className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nom" />
          <input required type="email" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} placeholder="E-mail" />
          <input required type="tel" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="Téléphone" />
          <input required className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} placeholder="Adresse complète" />
          <input required type="date" className="h-11 w-full rounded-xl border border-zinc-300 px-4" value={profileBirthDate} onChange={(e) => setProfileBirthDate(e.target.value)} />
          <button className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">Enregistrer les modifications</button>
        </form>

        <aside className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Session</p>
          <p className="text-sm text-zinc-700">Connecté en tant que <span className="font-semibold">@{user.username || user.email}</span></p>
          <button
            onClick={() => {
              logout();
              toast({ title: "Déconnecté", description: "Votre session a été fermée." });
              router.push("/auth");
            }}
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm"
          >
            Se déconnecter
          </button>
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">Mes commandes</h2>
        {loadingOrders ? (
          <div className="rounded-2xl border border-zinc-200 p-8 text-zinc-600">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 p-8 text-zinc-600">Aucune commande pour le moment.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{order.id}</p>
                  <p className="text-sm text-zinc-600">{new Date(order.createdAt).toLocaleString("fr-FR")}</p>
                </div>
                <p className="mt-1 text-sm text-zinc-700">Statut : <span className="font-semibold">{order.status}</span></p>
                <p className="text-sm text-zinc-700">Paiement : {order.paymentMethod === "carte" ? "Carte bancaire" : "Espèces à la livraison"}</p>
                <p className="mt-2 text-lg font-semibold">Total : {formatPrice(order.total)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
