"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CreditCard, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { CustomerInfo, PaymentMethod } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/auth";
import { Reveal } from "@/components/ui/reveal";

export function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<CustomerInfo>({ fullName: "", phone: "", address: "", email: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("especes");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const orderRef = `VK770-${Date.now().toString().slice(-8)}`;

    if (paymentMethod === "especes") {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer, items: cart, paymentMethod: "especes" }) });
      const data = await res.json();
      if (!res.ok) return toast({ title: "Erreur", description: data.error || "Impossible de créer la commande" });
      clearCart();
      toast({ title: "Commande créée", description: `Référence ${data.order.id}` });
      router.push("/commandes");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef, customerEmail: customer.email, customer: JSON.stringify(customer), items: cart.map((item) => ({ name: `${item.name} (${item.size}/${item.shoeSize}/${item.color})`, price: item.price, quantity: item.quantity })) })
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error();
      window.location.href = data.url as string;
    } catch {
      toast({ title: "Paiement indisponible", description: "Vérifiez la configuration Stripe." });
      setLoading(false);
    }
  };

  if (!user) return <div className="container space-y-6 pb-20 pt-8"><h1 className="font-display text-5xl sm:text-6xl">Checkout</h1><div className="rounded-2xl border border-zinc-200 bg-white p-8 text-zinc-700">Vous devez être connecté pour finaliser un achat.<div className="mt-4"><button onClick={() => router.push("/auth")} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">S'inscrire / Se connecter</button></div></div></div>;

  return (
    <div className="container space-y-8 pb-16 pt-6 sm:pb-20 sm:pt-8">
      <Reveal><h1 className="font-display text-5xl sm:text-6xl">Checkout</h1></Reveal>
      {!cart.length ? <div className="rounded-2xl border border-zinc-200 p-10 text-center text-zinc-600">Panier vide.</div> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <input required placeholder="Nom complet" className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4" value={customer.fullName} onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })} />
                <input required placeholder="Téléphone" className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
              </div>
              <input required placeholder="Adresse" className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              <input required type="email" placeholder="E-mail" className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              <textarea placeholder="Notes de commande" className="min-h-24 w-full rounded-xl border border-zinc-300 bg-white p-4" value={customer.notes || ""} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} />
              <div className="space-y-2 rounded-xl border border-zinc-200 p-3">
                <label className="flex gap-2 text-sm"><input type="radio" checked={paymentMethod === "especes"} onChange={() => setPaymentMethod("especes")} /> Espèces à la livraison</label>
                <label className="flex gap-2 text-sm"><input type="radio" checked={paymentMethod === "carte"} onChange={() => setPaymentMethod("carte")} /> Carte bancaire (Stripe)</label>
              </div>
              <button disabled={loading} className="w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Redirection Stripe..." : "Valider la commande"}</button>
            </form>
          </Reveal>

          <Reveal>
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Récapitulatif commande</p>
              <div className="space-y-2">{cart.map((item, idx) => <div key={idx} className="flex items-center justify-between text-sm"><span>{item.name} x{item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></div>)}</div>
              <div className="border-t border-zinc-200 pt-3 text-xl font-semibold">Total : {formatPrice(cartTotal)}</div>
              <div className="grid gap-2 text-sm text-zinc-600">
                <p className="flex items-center gap-2"><ShieldCheck size={16} /> Paiement sécurisé</p>
                <p className="flex items-center gap-2"><CreditCard size={16} /> Carte bancaire via Stripe</p>
                <p className="flex items-center gap-2"><Truck size={16} /> Livraison rapide 48 h / 72 h</p>
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}
