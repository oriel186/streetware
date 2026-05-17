# VENDEUR KASHER 770 Atelier - VENDEUR KASHER 770

Site vitrine boutique premium (sans paiement en ligne), construit avec Next.js 14.

## Stack

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Framer Motion
- UI reusable type shadcn
- Donnees produits mock en JSON local

## Pages

- `/` Accueil premium (hero, collections, best sellers, histoire, promo, temoignages, newsletter)
- `/boutique` Grille produits + recherche + filtres + tri + etats vides
- `/produit/[id]` Galerie, tailles, couleurs, poids, quantite, stock, livraison/retour, similaires
- `/a-propos` Histoire + mission
- `/contact` Formulaire + WhatsApp + FAQ

## Fonctionnalites

- Responsive mobile/tablette/desktop
- Animations fluides (Framer Motion)
- Skeleton loading
- Toast notifications
- SEO metadata + Open Graph
- Architecture reutilisable et scalable
- Commande WhatsApp pre-remplie avec produit + taille + couleur + quantite

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir: `http://localhost:3000`

## Variables d'environnement

`NEXT_PUBLIC_WHATSAPP_NUMBER=33758187903`

## Build production

```bash
npm run build
npm run start
```

## Donnees mock

- 40 produits dans `data/products.json`
- Champs: `id`, `name`, `price`, `images`, `category`, `sizes`, `colors`, `weightOptions`, `shoeSizes`, `stock`, `description`



STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
