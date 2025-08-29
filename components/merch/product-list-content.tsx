"use client";

import { ProductCard } from "@/components/merch/product-card";
import ResultsControls from "@/components/merch/results-controls";
import { ProductGrid } from "@/components/merch/product-grid";
import { Card } from "@/components/ui/card";

interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string } | string;
  productId?: string;
  mainImage?: string;
  price: number;
  stock?: number;
  description?: string;
  images?: Array<{
    url: string;
    metadata?: {
      dimensions?: {
        width: number;
        height: number;
      };
      lqip?: string;
    };
  }>;
}

interface ProductListContentProps {
  products: SanityProduct[];
}

export function ProductListContent({ products }: ProductListContentProps) {
  return (
    <>
      <ResultsControls className="max-md:hidden" products={products} />

      {products.length > 0 ? (
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </ProductGrid>
      ) : (
        <Card className="flex mr-4 md:mr-6 flex-1 items-center justify-center">
          <p className="text text-muted-foreground font-medium">
            No products found
          </p>
        </Card>
      )}
    </>
  );
}
