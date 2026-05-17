import { ProductSkeleton } from "@/components/shared/product-skeleton";

export default function Loading() {
  return (
    <div className="container pb-20 pt-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    </div>
  );
}


