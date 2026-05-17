"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!user?.email) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setLoading(false);
    };
    run();
  }, [user?.email]);

  if (loading) return <div className="container space-y-8 pb-20 pt-8"><h1 className="font-display text-5xl sm:text-6xl">Commandes</h1><div className="rounded-2xl border border-zinc-200 p-10 text-center text-zinc-600">Chargement...</div></div>;

  return <div className="container space-y-8 pb-16 pt-6 sm:pb-20 sm:pt-8"><Reveal><h1 className="font-display text-5xl sm:text-6xl">Commandes</h1></Reveal>{!orders.length ? <Reveal><div className="rounded-2xl border border-zinc-200 p-10 text-center text-zinc-600">Aucune commande pour le moment.</div></Reveal> : <Stagger className="space-y-4">{orders.map((order) => <StaggerItem key={order.id}><article className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{order.id}</p><p className="text-sm text-zinc-600">{new Date(order.createdAt).toLocaleString("fr-FR")}</p></div><p className="mt-1 text-sm text-zinc-700">Statut : <span className="font-semibold">{order.status}</span></p><p className="text-sm text-zinc-700">Paiement : {order.paymentMethod === "carte" ? "Carte bancaire" : "Espèces à la livraison"}</p><p className="mt-2 text-sm">Client : {order.customer.fullName} - {order.customer.phone}</p><div className="mt-3 space-y-1 text-sm text-zinc-600">{order.items.map((i, idx) => <p key={idx}>{i.name} x{i.quantity} ({i.size}/{i.shoeSize}/{i.color})</p>)}</div><p className="mt-3 text-lg font-semibold">Total : {formatPrice(order.total)}</p></article></StaggerItem>)}</Stagger>}</div>;
}
