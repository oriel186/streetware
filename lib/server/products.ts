import { promises as fs } from "fs";
import path from "path";
import { Product } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "data", "products.json");

async function readProducts(): Promise<Product[]> {
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as Product[];
}

async function writeProducts(products: Product[]) {
  await fs.writeFile(DB_PATH, JSON.stringify(products, null, 2), "utf8");
}

export async function listProducts() {
  return readProducts();
}

export async function getProductById(id: string) {
  const products = await readProducts();
  return products.find((p) => p.id === id) ?? null;
}

export async function createProduct(product: Product) {
  const products = await readProducts();
  products.unshift(product);
  await writeProducts(products);
  return product;
}

export async function updateProduct(productId: string, patch: Partial<Product>) {
  const products = await readProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...patch, id: products[idx].id };
  await writeProducts(products);
  return products[idx];
}

export async function deleteProduct(productId: string) {
  const products = await readProducts();
  const next = products.filter((p) => p.id !== productId);
  if (next.length === products.length) return false;
  await writeProducts(next);
  return true;
}
