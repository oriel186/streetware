"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/shared/product-card";
import { Reveal } from "@/components/ui/reveal";

export function WeeklySelectionSlider({ items }: { items: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const slide = (dir: "left" | "right") => {
    const node = trackRef.current;
    if (!node) return;
    const amount = Math.round(node.clientWidth * 0.82);
    node.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <Reveal>
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Sélection de la semaine</h2>
            <p className="text-sm text-zinc-600">Tenues, paires, bonnets et accessoires premium.</p>
          </div>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => slide("left")} className="grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-white transition hover:bg-zinc-100"><ChevronLeft size={16} /></button>
            <button onClick={() => slide("right")} className="grid h-10 w-10 place-items-center rounded-full border border-zinc-300 bg-white transition hover:bg-zinc-100"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {items.map((item) => (
            <div key={item.id} className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[31%] xl:w-[24%]">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
