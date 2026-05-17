"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Order, OrderStatus, Product, User } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { toast } from "@/components/ui/toaster";

const statuses: OrderStatus[] = ["en attente", "payee", "traitee", "expediee", "livree"];
const categories: Product["category"][] = ["Hoodies", "T-Shirts", "Pants", "Sneakers", "Accessories"];
const PAGE_SIZE = 10;
const MAX_PRODUCT_IMAGES = 8;
type Tab = "produits" | "commandes" | "utilisateurs";
type ConfirmState = { type: "product" | "user"; id: string; label: string } | null;
type MigrationSummary = { updated: number; conflictsResolved: number; errors: string[] } | null;

function statusClass(status: OrderStatus) {
  if (status === "payee") return "bg-emerald-100 text-emerald-800";
  if (status === "traitee") return "bg-blue-100 text-blue-800";
  if (status === "expediee") return "bg-violet-100 text-violet-800";
  if (status === "livree") return "bg-zinc-200 text-zinc-800";
  return "bg-amber-100 text-amber-800";
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (n: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-zinc-600">Page {page} / {totalPages}</p>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50">Précédent</button>
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50">Suivant</button>
      </div>
    </div>
  );
}

export function AdminPage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<Tab>("produits");

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Product>>({});
  const [uploading, setUploading] = useState(false);

  const [productQuery, setProductQuery] = useState("");
  const [orderQuery, setOrderQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");

  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [showMigrationConfirm, setShowMigrationConfirm] = useState(false);
  const [migrationConfirmText, setMigrationConfirmText] = useState("");
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationSummary, setMigrationSummary] = useState<MigrationSummary>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const loadAll = async () => {
    const auth = await fetch("/api/admin/orders");
    if (auth.status === 401) return router.replace("/admin/login");

    const [ordersRes, productsRes, usersRes] = await Promise.all([
      fetch("/api/admin/orders"),
      fetch("/api/products"),
      fetch("/api/admin/users")
    ]);

    const ordersData = await ordersRes.json();
    const productsData = await productsRes.json();
    const usersData = await usersRes.json();

    setOrders(ordersData.orders || []);
    setProducts(productsData.products || []);
    setUsers(usersData.users || []);
    setOk(true);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "en attente").length,
      paid: orders.filter((o) => o.status === "payee").length,
      revenue: orders.reduce((sum, o) => sum + (o.status === "payee" || o.status === "livree" ? o.total : 0), 0)
    }),
    [orders]
  );

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => [p.id, p.name, p.category].join(" ").toLowerCase().includes(q));
  }, [products, productQuery]);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => [o.id, o.customer.fullName, o.customer.email, o.customer.phone].join(" ").toLowerCase().includes(q));
  }, [orders, orderQuery]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.fullName, u.username || "", u.email, u.phone || ""].join(" ").toLowerCase().includes(q));
  }, [users, userQuery]);

  const pagedProducts = filteredProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
  const pagedOrders = filteredOrders.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE);
  const pagedUsers = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status })
    });
    await loadAll();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const parseCsv = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);

  const saveProduct = async () => {
    const payload: Product = {
      id: draft.id || `vk770-${Date.now()}`,
      name: draft.name || "Produit",
      price: Number(draft.price || 0),
      category: (draft.category as Product["category"]) || "Accessories",
      images: draft.images || [],
      sizes: draft.sizes || [],
      shoeSizes: draft.shoeSizes || [],
      colors: draft.colors || ["Noir"],
      weightOptions: draft.weightOptions || ["Standard"],
      stock: Number(draft.stock || 1),
      description: draft.description || "",
      featured: Boolean(draft.featured),
      bestSeller: Boolean(draft.bestSeller)
    };

    if (editingProduct) {
      await fetch(`/api/products/${editingProduct}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    setEditingProduct(null);
    setDraft({});
    await loadAll();
    toast({ title: "Succès", description: "Produit enregistré." });
  };

  const removeProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await loadAll();
    toast({ title: "Supprimé", description: "Produit supprimé." });
  };

  const saveUser = async (email: string, patch: Partial<User>) => {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Erreur serveur" }));
      toast({ title: "Erreur", description: data.error || "Erreur serveur" });
      return;
    }
    await loadAll();
  };

  const removeUser = async (email: string) => {
    await fetch(`/api/admin/users/${encodeURIComponent(email)}`, { method: "DELETE" });
    await loadAll();
    toast({ title: "Supprimé", description: "Utilisateur supprimé." });
  };

  const onUploadImage = async (file: File | null) => {
    if (!file) return;
    if ((draft.images || []).length >= MAX_PRODUCT_IMAGES) {
      toast({ title: "Limite atteinte", description: "Maximum 8 images par produit." });
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Upload impossible" }));
      toast({ title: "Erreur", description: data.error || "Upload impossible" });
      return;
    }

    const data = await res.json();
    const url = data.url as string;
    setDraft((d) => {
      const next = [...(d.images || []), url];
      return { ...d, images: next.slice(0, MAX_PRODUCT_IMAGES) };
    });
    toast({ title: "Image ajoutée", description: "Image produit importée." });
  };

  const onReplaceImage = async (index: number, file: File | null) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Remplacement impossible" }));
      toast({ title: "Erreur", description: data.error || "Remplacement impossible" });
      return;
    }
    const data = await res.json();
    const url = data.url as string;
    setDraft((d) => {
      const next = [...(d.images || [])];
      next[index] = url;
      return { ...d, images: next };
    });
    toast({ title: "Image remplacée", description: "La miniature a été remplacée." });
  };

  const removeDraftImage = (index: number) => {
    setDraft((d) => {
      const next = [...(d.images || [])];
      next.splice(index, 1);
      return { ...d, images: next };
    });
    toast({ title: "Image supprimée", description: "Image retirée avant validation." });
  };

  const setMainImage = (index: number) => {
    setDraft((d) => {
      const current = [...(d.images || [])];
      if (!current[index]) return d;
      const [selected] = current.splice(index, 1);
      return { ...d, images: [selected, ...current] };
    });
    toast({ title: "Image principale", description: "L'image principale a été mise à jour." });
  };

  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    setDraft((d) => {
      const current = [...(d.images || [])];
      const [moved] = current.splice(from, 1);
      current.splice(to, 0, moved);
      return { ...d, images: current };
    });
    toast({ title: "Ordre mis à jour", description: "L'ordre des images a été enregistré." });
  };

  const runUsernameMigration = async () => {
    setMigrationLoading(true);
    const res = await fetch("/api/admin/migrate-usernames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmText: migrationConfirmText })
    });
    setMigrationLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Erreur migration" }));
      toast({ title: "Erreur", description: data.error || "Erreur migration" });
      return;
    }
    const data = await res.json();
    setMigrationSummary(data.summary || null);
    setShowMigrationConfirm(false);
    setMigrationConfirmText("");
    await loadAll();
    toast({ title: "Migration terminée", description: "Les usernames ont été vérifiés et corrigés." });
  };

  if (!ok) return null;

  return (
    <div className="container space-y-8 pb-20 pt-8">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-5xl sm:text-6xl">Dashboard Admin</h1>
          <button onClick={logout} className="rounded-full border border-zinc-300 px-4 py-2 text-sm">Quitter</button>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Commandes</p><p className="mt-2 text-3xl font-bold">{stats.total}</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">En attente</p><p className="mt-2 text-3xl font-bold">{stats.pending}</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Payées</p><p className="mt-2 text-3xl font-bold">{stats.paid}</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">CA estimé</p><p className="mt-2 text-3xl font-bold">{formatPrice(stats.revenue)}</p></div>
        </div>
      </Reveal>

      <div className="flex flex-wrap gap-2">
        {(["produits", "commandes", "utilisateurs"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm ${tab === t ? "bg-black text-white" : "border border-zinc-300 bg-white text-zinc-800"}`}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "produits" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="mb-3 font-semibold">{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</p>
            <div className="grid gap-2 md:grid-cols-2">
              <input placeholder="Nom" className="h-10 rounded-xl border border-zinc-300 px-3" value={draft.name || ""} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              <input placeholder="Prix" type="number" className="h-10 rounded-xl border border-zinc-300 px-3" value={draft.price || ""} onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))} />
              <select className="h-10 rounded-xl border border-zinc-300 px-3" value={draft.category || "Accessories"} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as Product["category"] }))}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
              <input placeholder="Stock" type="number" className="h-10 rounded-xl border border-zinc-300 px-3" value={draft.stock || ""} onChange={(e) => setDraft((d) => ({ ...d, stock: Number(e.target.value) }))} />

              <div className="md:col-span-2 rounded-xl border border-zinc-200 p-3">
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onUploadImage(e.target.files?.[0] || null)} className="text-sm" />
                  <span className="text-xs text-zinc-600">{uploading ? "Upload en cours..." : "Upload image produit"}</span>
                </div>
              </div>

              {(draft.images || []).length ? (
                <div className="md:col-span-2 rounded-xl border border-zinc-200 p-3">
                  <p className="mb-2 text-xs text-zinc-600">Images : {(draft.images || []).length}/{MAX_PRODUCT_IMAGES}</p>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Image principale</p>
                  <div className="relative mb-3 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    <Image src={(draft.images || [])[0]} alt="Image principale produit" fill className="object-cover" />
                  </div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Miniatures (glissez-déposez pour réordonner)</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(draft.images || []).map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        draggable
                        onDragStart={() => setDragIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragIndex === null) return;
                          moveImage(dragIndex, idx);
                          setDragIndex(null);
                        }}
                        onDragEnd={() => setDragIndex(null)}
                        className="rounded-xl border border-zinc-200 p-2"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                          <Image src={img} alt={`Miniature ${idx + 1}`} fill className="object-cover" />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <button type="button" onClick={() => setMainImage(idx)} className="rounded-full border border-zinc-300 px-2 py-1 text-[11px]">
                            Principale
                          </button>
                          <label className="cursor-pointer rounded-full border border-zinc-300 px-2 py-1 text-[11px]">
                            Remplacer
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                onReplaceImage(idx, e.target.files?.[0] || null);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                          <button type="button" onClick={() => removeDraftImage(idx)} className="rounded-full border border-red-300 px-2 py-1 text-[11px] text-red-700">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <input
                placeholder="Images (/products/a.jpg, /products/b.jpg)"
                className="h-10 rounded-xl border border-zinc-300 px-3 md:col-span-2"
                value={(draft.images || []).join(", ")}
                onChange={(e) => {
                  const parsed = parseCsv(e.target.value);
                  if (parsed.length > MAX_PRODUCT_IMAGES) {
                    toast({ title: "Limite atteinte", description: "Maximum 8 images par produit." });
                  }
                  setDraft((d) => ({ ...d, images: parsed.slice(0, MAX_PRODUCT_IMAGES) }));
                }}
              />
              <input placeholder="Tailles (S, M, L)" className="h-10 rounded-xl border border-zinc-300 px-3" value={(draft.sizes || []).join(", ")} onChange={(e) => setDraft((d) => ({ ...d, sizes: parseCsv(e.target.value) }))} />
              <input placeholder="Pointures (40, 41, 42)" className="h-10 rounded-xl border border-zinc-300 px-3" value={(draft.shoeSizes || []).join(", ")} onChange={(e) => setDraft((d) => ({ ...d, shoeSizes: parseCsv(e.target.value) }))} />
              <input placeholder="Couleurs (Noir, Blanc)" className="h-10 rounded-xl border border-zinc-300 px-3" value={(draft.colors || []).join(", ")} onChange={(e) => setDraft((d) => ({ ...d, colors: parseCsv(e.target.value) }))} />
              <input placeholder="Poids (Leger, Standard)" className="h-10 rounded-xl border border-zinc-300 px-3" value={(draft.weightOptions || []).join(", ")} onChange={(e) => setDraft((d) => ({ ...d, weightOptions: parseCsv(e.target.value) }))} />
              <textarea placeholder="Description" className="min-h-[100px] rounded-xl border border-zinc-300 p-3 md:col-span-2" value={draft.description || ""} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={saveProduct} className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">Enregistrer</button>
              {editingProduct ? <button onClick={() => { setEditingProduct(null); setDraft({}); }} className="rounded-full border border-zinc-300 px-4 py-2 text-sm">Annuler</button> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <input value={productQuery} onChange={(e) => { setProductQuery(e.target.value); setProductPage(1); }} placeholder="Rechercher un produit" className="h-10 w-full rounded-xl border border-zinc-300 px-3" />
          </div>

          <div className="space-y-3">
            {pagedProducts.map((p) => (
              <div key={p.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><p className="font-semibold">{p.name}</p><p className="text-sm text-zinc-600">{p.category} - {formatPrice(p.price)} - Stock {p.stock}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingProduct(p.id); setDraft(p); }} className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm">Modifier</button>
                    <button onClick={() => setConfirmState({ type: "product", id: p.id, label: p.name })} className="rounded-full border border-red-300 px-3 py-1.5 text-sm text-red-700">Supprimer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={productPage} total={filteredProducts.length} onChange={setProductPage} />
        </div>
      ) : null}

      {tab === "commandes" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <input value={orderQuery} onChange={(e) => { setOrderQuery(e.target.value); setOrderPage(1); }} placeholder="Rechercher une commande" className="h-10 w-full rounded-xl border border-zinc-300 px-3" />
          </div>
          {!pagedOrders.length ? <div className="rounded-2xl border border-zinc-200 p-10 text-center text-zinc-600">Aucune commande.</div> : <div className="space-y-4">{pagedOrders.map((order) => <div key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{order.id} - {order.customer.fullName}</p><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>{order.status}</span><select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)} className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></div><p className="mt-2 text-sm text-zinc-600">{order.customer.phone} | {order.customer.email}</p><p className="text-sm text-zinc-600">{order.customer.address}</p>{order.customer.notes ? <p className="text-sm text-zinc-600">Notes : {order.customer.notes}</p> : null}<div className="mt-2 text-sm text-zinc-700">{order.items.map((item, idx) => <p key={idx}>{item.name} x{item.quantity} - {item.color} - {item.size}/{item.shoeSize}</p>)}</div></div>)}</div>}
          <Pagination page={orderPage} total={filteredOrders.length} onChange={setOrderPage} />
        </div>
      ) : null}

      {tab === "utilisateurs" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Migration usernames</p>
                <p className="text-sm text-zinc-600">Corrige automatiquement les anciens comptes sans username.</p>
              </div>
              <button onClick={() => setShowMigrationConfirm(true)} className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                Lancer migration usernames
              </button>
            </div>
            {migrationSummary ? (
              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
                <p>Comptes mis à jour : <span className="font-semibold">{migrationSummary.updated}</span></p>
                <p>Conflits corrigés : <span className="font-semibold">{migrationSummary.conflictsResolved}</span></p>
                <p>Erreurs : <span className="font-semibold">{migrationSummary.errors.length}</span></p>
                {migrationSummary.errors.length ? <p className="mt-1 text-red-700">{migrationSummary.errors.join(" | ")}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <input value={userQuery} onChange={(e) => { setUserQuery(e.target.value); setUserPage(1); }} placeholder="Rechercher un utilisateur" className="h-10 w-full rounded-xl border border-zinc-300 px-3" />
          </div>
          {!pagedUsers.length ? <div className="rounded-2xl border border-zinc-200 p-10 text-center text-zinc-600">Aucun utilisateur.</div> : <div className="space-y-3">{pagedUsers.map((u) => <div key={u.email} className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="font-semibold">{u.fullName}</p><p className="text-sm text-zinc-600">@{u.username || "non-defini"}</p><p className="text-sm text-zinc-600">{u.email}</p><p className="text-sm text-zinc-600">Naissance : {u.birthDate || "non-definie"}</p><div className="mt-3 grid gap-2 md:grid-cols-2"><input defaultValue={u.username || ""} placeholder="Nom d'utilisateur" onBlur={(e) => saveUser(u.email, { username: e.target.value })} className="h-10 rounded-xl border border-zinc-300 px-3" /><input defaultValue={u.fullName} onBlur={(e) => saveUser(u.email, { fullName: e.target.value })} className="h-10 rounded-xl border border-zinc-300 px-3" /><input defaultValue={u.phone || ""} placeholder="Telephone" onBlur={(e) => saveUser(u.email, { phone: e.target.value })} className="h-10 rounded-xl border border-zinc-300 px-3" /><input defaultValue={u.birthDate || ""} type="date" onBlur={(e) => saveUser(u.email, { birthDate: e.target.value })} className="h-10 rounded-xl border border-zinc-300 px-3" /><input defaultValue={u.address || ""} placeholder="Adresse" onBlur={(e) => saveUser(u.email, { address: e.target.value })} className="h-10 rounded-xl border border-zinc-300 px-3 md:col-span-2" /></div><button onClick={() => setConfirmState({ type: "user", id: u.email, label: u.fullName })} className="mt-3 rounded-full border border-red-300 px-3 py-1.5 text-sm text-red-700">Supprimer utilisateur</button></div>)}</div>}
          <Pagination page={userPage} total={filteredUsers.length} onChange={setUserPage} />
        </div>
      ) : null}

      {confirmState ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-zinc-600">Voulez-vous vraiment supprimer "{confirmState.label}" ? Cette action est irréversible.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmState(null)} className="rounded-full border border-zinc-300 px-4 py-2 text-sm">Annuler</button>
              <button
                onClick={async () => {
                  const action = confirmState;
                  setConfirmState(null);
                  if (action.type === "product") await removeProduct(action.id);
                  if (action.type === "user") await removeUser(action.id);
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showMigrationConfirm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Confirmer la migration</h3>
            <p className="mt-2 text-sm text-zinc-600">Pour éviter un déclenchement accidentel, tapez <span className="font-semibold">MIGRER</span> puis validez.</p>
            <input value={migrationConfirmText} onChange={(e) => setMigrationConfirmText(e.target.value)} className="mt-3 h-10 w-full rounded-xl border border-zinc-300 px-3" placeholder="Tapez MIGRER" />
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setShowMigrationConfirm(false); setMigrationConfirmText(""); }} className="rounded-full border border-zinc-300 px-4 py-2 text-sm">Annuler</button>
              <button disabled={migrationLoading || migrationConfirmText.trim().toUpperCase() !== "MIGRER"} onClick={runUsernameMigration} className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {migrationLoading ? "Migration..." : "Exécuter"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
