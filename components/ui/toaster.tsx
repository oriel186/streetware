"use client";

import { useEffect, useState } from "react";

type ToastItem = { id: number; title: string; description?: string };

let pushToast: ((item: Omit<ToastItem, "id">) => void) | null = null;

export function toast(item: Omit<ToastItem, "id">) {
  pushToast?.(item);
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    pushToast = (item) => {
      const id = Date.now();
      setItems((prev) => [...prev, { id, ...item }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2600);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {items.map((item) => (
        <div key={item.id} className="luxe-card w-72 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold">{item.title}</p>
          {item.description && <p className="mt-1 text-sm text-zinc-300">{item.description}</p>}
        </div>
      ))}
    </div>
  );
}


