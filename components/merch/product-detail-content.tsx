"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeftIcon, PlusIcon, MinusIcon } from "lucide-react";
import { motion } from "framer-motion";
import { CartProvider, useCart } from "./cart/cart-context";
import { VariantSelector } from "./variant-selector";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string } | string;
  productId?: string;
  description?: string;
  price: number;
  stock?: number;
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
  mainImage?: string;
}

interface ProductDetailContentProps {
  product: SanityProduct;
}

function ProductDetail({ product }: ProductDetailContentProps) {
  const { currentLanguage } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();

  const allImages = product.images || [];
  const mainImage = product.mainImage || allImages[0]?.url;
  const selectedImage = allImages[selectedImageIndex] || mainImage;

  const handleAddToCart = async () => {
    await addItem(product);
    // Could add toast notification here
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="min-h-screen bg-background">
      {/* Back to Merch */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/merch">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            {t(currentLanguage, "merchPage.productDetail.backToMerch")}
          </Link>
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {selectedImage ? (
              <div className="aspect-square relative overflow-hidden rounded-sm bg-muted">
                <Image
                  src={
                    typeof selectedImage === "string"
                      ? selectedImage
                      : selectedImage.url
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  quality={100}
                  placeholder={
                    typeof selectedImage === "string"
                      ? undefined
                      : selectedImage.metadata?.lqip
                        ? "blur"
                        : undefined
                  }
                  blurDataURL={
                    typeof selectedImage === "string"
                      ? undefined
                      : selectedImage.metadata?.lqip
                  }
                />
              </div>
            ) : (
              <div className="aspect-square relative overflow-hidden rounded-sm bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">
                  {t(currentLanguage, "merchPage.productDetail.noImage")}
                </span>
              </div>
            )}

            {/* Additional Images Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative overflow-hidden rounded-sm bg-muted transition-all ${selectedImageIndex === index
                      ? "ring-2 ring-primary"
                      : "hover:ring-2 hover:ring-muted-foreground/50"
                      }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={80}
                      placeholder={image.metadata?.lqip ? "blur" : undefined}
                      blurDataURL={image.metadata?.lqip}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Information */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <motion.h1
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {product.name}
              </motion.h1>
              <motion.p
                className="text-2xl font-semibold text-primary"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {product.price.toLocaleString()} F CFA
              </motion.p>
              {product.stock !== undefined && (
                <motion.p
                  className="text-sm text-muted-foreground mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {product.stock > 0
                    ? `${product.stock} ${t(currentLanguage, "merchPage.productDetail.inStock")}`
                    : t(currentLanguage, "merchPage.productDetail.outOfStock")}
                </motion.p>
              )}
            </div>

            {/* Product Description */}
            {product.description && (
              <motion.div
                className="prose prose-sm max-w-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <p>{product.description}</p>
              </motion.div>
            )}

            {/* Variant Selector (placeholder for now) */}
            <VariantSelector />

            {/* Add to Cart Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t(currentLanguage, "merchPage.productDetail.quantity")}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={incrementQuantity}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? t(currentLanguage, "merchPage.productDetail.outOfStock") : t(currentLanguage, "merchPage.productDetail.addToCart")}
                  </Button>

                  {/* Additional Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      {t(currentLanguage, "merchPage.productDetail.addToWishlist")}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      {t(currentLanguage, "merchPage.productDetail.share")}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Product Details */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h3 className="font-semibold">{t(currentLanguage, "merchPage.productDetail.productDetails")}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{t(currentLanguage, "merchPage.productDetail.productId")} {product.productId || product._id}</p>
                <p>{t(currentLanguage, "merchPage.productDetail.category")}</p>
                <p>{t(currentLanguage, "merchPage.productDetail.shipping")}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  return (
    <CartProvider>
      <ProductDetail product={product} />
    </CartProvider>
  );
}
