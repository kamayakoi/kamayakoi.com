"use client";

import { ProductCard } from "@/components/merch/product-card";
import { Card } from "@/components/ui/card";

interface PortableTextBlock {
  _key: string;
  _type: string;
  children: Array<{
    _key: string;
    _type: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: unknown[];
  style?: string;
}

interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string } | string;
  productId?: string;
  mainImage?: string;
  price: number;
  stock?: number;
  description?: string | PortableTextBlock[];
  categories?: Array<{
    title: string;
    slug: { current: string };
  }>;
  tags?: string[];
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
  return products.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  ) : (
    <Card className="flex mr-4 md:mr-6 flex-1 items-center justify-center rounded-sm">
      <p className="text text-muted-foreground font-medium">
        No products found
      </p>
    </Card>
  );
}
