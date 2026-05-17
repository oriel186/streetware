import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/sections/product-page";
import { getProductById, listProducts } from "@/lib/server/products";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductById(params.id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]]
    }
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <PageContent id={params.id} />;
}

async function PageContent({ id }: { id: string }) {
  const product = await getProductById(id);
  if (!product) notFound();
  const all = await listProducts();
  const similar = all.filter((p) => p.category === product.category && p.id !== product.id);
  return <ProductPage product={product} similarProducts={similar} />;
}


