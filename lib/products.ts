import { Product } from "@/lib/types";
import productsData from "@/data/products.json";

export const products = productsData as Product[];

export const categories = Array.from(new Set(products.map((p) => p.category)));

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getSimilarProducts(product: Product, limit = 4) {
  return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

function weeklyGroup(p: Product) {
  const name = p.name.toLowerCase();
  if (name.includes("watch") || name.includes("montre")) return 5; // montres
  if (name.includes("beanie") || name.includes("bonnet")) return 3; // bonnets
  if (p.category === "Sneakers") return 2; // paires
  if (p.category === "Hoodies" || p.category === "T-Shirts" || p.category === "Pants") return 1; // tenues
  return 4; // accessoires
}

export function getWeeklySelection(limit = 20) {
  return [...products].sort((a, b) => {
    const g = weeklyGroup(a) - weeklyGroup(b);
    if (g !== 0) return g;
    return a.name.localeCompare(b.name, "fr");
  }).slice(0, limit);
}


