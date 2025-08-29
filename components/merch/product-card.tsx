import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart, CartProvider } from "./cart/cart-context";

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

function ProductCardContent({ product }: { product: SanityProduct }) {
  const { addItem } = useCart();
  const slug =
    typeof product.slug === "string" ? product.slug : product.slug?.current;
  const mainImage = product.mainImage || product.images?.[0]?.url;
  const imageWidth = product.images?.[0]?.metadata?.dimensions?.width || 400;
  const imageHeight = product.images?.[0]?.metadata?.dimensions?.height || 600;

  const handleAddToCart = async () => {
    await addItem(product);
  };

  return (
    <div className="relative w-full aspect-[3/4] md:aspect-square bg-muted group overflow-hidden">
      <Link
        href={`/merch/${slug}`}
        className="block size-full focus-visible:outline-none"
        aria-label={`View details for ${product.name}, price ${product.price} F CFA`}
        prefetch
      >
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            width={imageWidth}
            height={imageHeight}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover size-full"
            quality={100}
            placeholder={
              product.images?.[0]?.metadata?.lqip ? "blur" : undefined
            }
            blurDataURL={product.images?.[0]?.metadata?.lqip}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </Link>

      {/* Interactive Overlay */}
      <div className="absolute inset-0 p-2 w-full pointer-events-none">
        <div className="flex gap-6 justify-between items-baseline px-3 py-1 w-full font-semibold transition-all duration-300 translate-y-0 max-md:hidden group-hover:opacity-0 group-focus-visible:opacity-0 group-hover:-translate-y-full group-focus-visible:-translate-y-full">
          <p className="text-sm uppercase 2xl:text-base text-balance">
            {product.name}
          </p>
          <div className="flex gap-2 items-center text-sm uppercase 2xl:text-base">
            <span>{product.price} F CFA</span>
          </div>
        </div>

        <div className="flex absolute inset-x-3 bottom-3 flex-col gap-8 px-2 py-3 rounded-sm transition-all duration-300 pointer-events-none bg-popover md:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 md:translate-y-1/3 group-hover:translate-y-0 group-focus-visible:translate-y-0 group-hover:pointer-events-auto group-focus-visible:pointer-events-auto max-md:pointer-events-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 items-end">
            <p className="text-lg font-semibold text-pretty">{product.name}</p>
            <div className="flex gap-2 items-center place-self-end text-lg font-semibold">
              <span>{product.price} F CFA</span>
            </div>

            <Suspense
              fallback={
                <Button
                  className="col-start-2"
                  size="sm"
                  variant="default"
                  disabled
                >
                  Loading...
                </Button>
              }
            >
              <Button
                className="col-start-2"
                size="sm"
                variant="default"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProductCard = ({ product }: { product: SanityProduct }) => {
  return (
    <CartProvider>
      <ProductCardContent product={product} />
    </CartProvider>
  );
};
