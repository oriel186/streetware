import { promises as fs } from "fs";
import path from "path";
import { Order, OrderStatus } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "data", "orders.db.json");

type OrdersDB = { orders: Order[] };

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ orders: [] }, null, 2), "utf8");
  }
}

async function readDb(): Promise<OrdersDB> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as OrdersDB;
}

async function writeDb(db: OrdersDB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function listOrders() {
  const db = await readDb();
  return db.orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listOrdersByEmail(email: string) {
  const db = await readDb();
  const normalized = email.trim().toLowerCase();
  return db.orders.filter((o) => o.customer.email.toLowerCase() === normalized).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addOrder(order: Order) {
  const db = await readDb();
  db.orders.unshift(order);
  await writeDb(db);
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const db = await readDb();
  const idx = db.orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  db.orders[idx].status = status;
  await writeDb(db);
  return db.orders[idx];
}

export async function orderExists(orderId: string) {
  const db = await readDb();
  return db.orders.some((o) => o.id === orderId);
}
