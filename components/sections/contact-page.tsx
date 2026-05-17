import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

export function ContactPage() {
  return (
    <div className="container space-y-8 pb-16 pt-6 sm:pb-20 sm:pt-8">
      <Reveal><h1 className="font-display text-5xl sm:text-6xl">Contact</h1></Reveal>
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <form className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Nous écrire</p>
            <input className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4" placeholder="Nom" />
            <input className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4" placeholder="E-mail" />
            <textarea className="min-h-32 w-full rounded-xl border border-zinc-300 bg-white p-4" placeholder="Message" />
            <button type="button" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">Envoyer</button>
          </form>
        </Reveal>

        <Reveal>
          <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">WhatsApp</p>
              <Link href="https://wa.me/33758187903" target="_blank" className="mt-2 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">Contacter maintenant</Link>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">FAQ</p>
              <p className="mt-2 text-sm text-zinc-700">Livraison 48 h à 72 h, retours 14 jours, paiement carte Stripe ou espèces à la livraison.</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Informations</p>
              <p className="mt-2 text-sm text-zinc-700">VENDEUR KASHER 770 accompagne chaque commande avec un suivi client réactif.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
