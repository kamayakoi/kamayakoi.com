import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, CartProvider } from "./cart/cart-context";

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
  slug: string | { current: string };
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

function ProductCardContent({ product }: { product: SanityProduct }) {
  const { addItem } = useCart();
  const slug = typeof product.slug === 'string' ? product.slug : product.slug?.current || '';
  const mainImage = product.mainImage || product.images?.[0]?.url;
  const hasValidImage = mainImage && mainImage.trim() !== '';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product);
  };

  // Format price with non-breaking space instead of comma
  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
  };


  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-sm border-border/40 bg-card p-0 mb-6">
      <div className="relative rounded-t-sm overflow-hidden">
        <Link
          href={`/merch/${slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View details for ${product.name}, price ${product.price} F CFA`}
          prefetch
        >
          {hasValidImage ? (
            <div className="aspect-square relative bg-muted overflow-hidden">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                quality={100}
                placeholder={
                  product.images?.[0]?.metadata?.lqip ? "blur" : undefined
                }
                blurDataURL={product.images?.[0]?.metadata?.lqip}
              />
            </div>
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
        </Link>

      </div>

      <CardContent className="p-4 space-y-3 px-4">
        <Link href={`/merch/${slug}`} className="block">
          <h3 className="font-medium text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description hidden - uncomment below if needed */}
        {/* {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {typeof product.description === 'string'
              ? product.description
              : product.description?.[0]?.children?.[0]?.text || ''}
          </p>
        )} */}

        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded-sm"
              >
                {category.title}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-semibold">
            {formatPrice(product.price)} F CFA
          </span>
          <Suspense
            fallback={
              <Button size="sm" disabled className="rounded-sm px-4 py-2 text-xs font-medium bg-teal-800 text-teal-200">
                ...
              </Button>
            }
          >
            <Button
              size="sm"
              className="rounded-sm px-4 py-2 text-xs font-medium bg-teal-800 hover:bg-teal-700 text-teal-200 transition-colors"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}

export const ProductCard = ({ product }: { product: SanityProduct }) => {
  return (
    <CartProvider>
      <ProductCardContent product={product} />
    </CartProvider>
  );
};
