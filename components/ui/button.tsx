import { cn } from "@/lib/utils";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("inline-flex items-center justify-center rounded-full border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}
