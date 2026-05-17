import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none ring-black/20 focus:ring-2", className)} {...props} />;
}
