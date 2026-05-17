export default function Loading() {
  return (
    <div className="container pb-20 pt-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse rounded-2xl border border-zinc-200 bg-white" />
        <div className="h-[540px] animate-pulse rounded-2xl border border-zinc-200 bg-white" />
      </div>
    </div>
  );
}


