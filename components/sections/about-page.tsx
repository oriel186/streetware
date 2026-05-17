import { Reveal } from "@/components/ui/reveal";

export function AboutPage() {
  return (
    <div className="container space-y-8 pb-16 pt-6 sm:pb-20 sm:pt-8">
      <Reveal>
        <h1 className="font-display text-5xl sm:text-6xl">À propos</h1>
      </Reveal>
      <Reveal>
        <article className="grid gap-8 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">VENDEUR KASHER 770</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Référence streetwear luxe</h2>
          </div>
          <div className="space-y-4 text-zinc-700">
            <p>VENDEUR KASHER 770 propose une sélection exigeante de pièces streetwear et sneakers premium.</p>
            <p>Notre priorité : des produits forts, un service rapide et une expérience d’achat fluide.</p>
            <p>Chaque commande est suivie avec attention, du panier jusqu’à la livraison.</p>
          </div>
        </article>
      </Reveal>
    </div>
  );
}
