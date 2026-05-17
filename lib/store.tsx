"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, CustomerInfo, Order, OrderStatus, PaymentMethod } from "@/lib/types";

type Store = {
  cart: CartItem[];
  orders: Order[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  updateQty: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  createOrder: (customer: CustomerInfo, paymentMethod: PaymentMethod) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
};

const StoreContext = createContext<Store | null>(null);
const CART_KEY = "vk770_cart";
const ORDERS_KEY = "vk770_orders";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const c = localStorage.getItem(CART_KEY);
    const o = localStorage.getItem(ORDERS_KEY);
    if (c) setCart(JSON.parse(c));
    if (o) setOrders(JSON.parse(o));
  }, []);

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)), [orders]);

  const value = useMemo<Store>(() => {
    const addToCart = (item: CartItem) => {
      setCart((prev) => {
        const idx = prev.findIndex((p) => p.productId === item.productId && p.size === item.size && p.shoeSize === item.shoeSize && p.color === item.color);
        if (idx === -1) return [...prev, item];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + item.quantity };
        return copy;
      });
    };

    const updateQty = (index: number, quantity: number) => setCart((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item)));
    const removeItem = (index: number) => setCart((prev) => prev.filter((_, i) => i !== index));
    const clearCart = () => setCart([]);

    const createOrder = (customer: CustomerInfo, paymentMethod: PaymentMethod) => {
      if (!cart.length) return null;
      const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const order: Order = {
        id: `VK770-${Date.now().toString().slice(-8)}`,
        items: cart,
        customer,
        paymentMethod,
        status: paymentMethod === "carte" ? "payee" : "en attente",
        total,
        createdAt: new Date().toISOString()
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    };

    const updateOrderStatus = (orderId: string, status: OrderStatus) => setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    return { cart, orders, cartCount: cart.reduce((sum, i) => sum + i.quantity, 0), cartTotal: cart.reduce((sum, i) => sum + i.price * i.quantity, 0), addToCart, updateQty, removeItem, clearCart, createOrder, updateOrderStatus };
  }, [cart, orders]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
