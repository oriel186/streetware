"use client";

import { useState } from "react";

export function BrandLogo({ size = 58 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className="grid place-items-center rounded-md border border-zinc-300 bg-zinc-100 text-[10px] font-bold tracking-wider text-zinc-700"
      >
        K770
      </div>
    );
  }

  return (
    <img
      src="/kasher-logo.png"
      alt="KASHER 770"
      width={size}
      height={size}
      className="rounded-md object-contain"
      onError={() => setFailed(true)}
    />
  );
}
