"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, Heart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "./cart/cart-context";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { useWishlist } from "./wishlist/wishlist-context";
import { SanityProduct } from "./types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState } from "react";

interface ProductImageCarouselProps {
  images: Array<{ url: string }>;
  productName: string;
}

function ProductImageCarousel({
  images,
  productName,
}: ProductImageCarouselProps) {
  const [, setApi] = useState<CarouselApi>();

  return (
    <>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="flex-1 min-h-[650px] relative overflow-hidden rounded-sm bg-muted shadow-2xl">
                <Image
                  src={image.url}
                  alt={
                    typeof productName === "string" ? productName : "Product"
                  }
                  fill
                  className="object-cover"
                  quality={100}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 rounded-sm" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 rounded-sm" />
      </Carousel>
    </>
  );
}

interface ProductDetailContentProps {
  product: SanityProduct;
}

function ProductDetail({ product }: ProductDetailContentProps) {
  const { currentLanguage } = useTranslation();
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const allImages = product.images || [];
  const carouselImages = allImages
    .map((image) => image.asset?.url)
    .filter((url): url is string => !!url)
    .map((url) => ({ url }));

  const mainImage = product.mainImage || carouselImages[0]?.url;

  const handleAddToCart = () => {
    addItem(product);
    // Could add toast notification here
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: typeof product.name === "string" ? product.name : "Product",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-stretch">
          {/* Product Images */}
          <motion.div
            className="space-y-4 flex flex-col h-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {carouselImages.length > 0 ? (
              <ProductImageCarousel
                images={carouselImages}
                productName={product.name}
              />
            ) : mainImage ? (
              <div className="flex-1 min-h-[650px] relative overflow-hidden rounded-sm bg-muted shadow-2xl">
                <Image
                  src={mainImage}
                  alt={
                    typeof product.name === "string" ? product.name : "Product"
                  }
                  fill
                  className="object-cover"
                  quality={100}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
              </div>
            ) : (
              <div className="flex-1 min-h-[650px] relative overflow-hidden rounded-sm bg-muted flex items-center justify-center shadow-2xl">
                <span className="text-muted-foreground">
                  {t(currentLanguage, "merchPage.productDetail.noImage")}
                </span>
              </div>
            )}
          </motion.div>

          {/* Product Information */}
          <motion.div
            className="space-y-8 min-h-[650px] flex flex-col mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Title and Price Section */}
            <div className="space-y-4">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {typeof product.name === "string" ? product.name : "Product"}
              </motion.h1>

              <div className="flex justify-start">
                <motion.p
                  className="text-3xl md:text-4xl font-bold text-primary"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {typeof product.price === "number"
                    ? product.price
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                    : "0"}{" "}
                  F CFA
                </motion.p>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <motion.div
                className="bg-card/30 backdrop-blur-sm rounded-sm p-6 border border-border/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {t(currentLanguage, "merchPage.productDetail.description")}
                  </h3>
                  {product.stock !== undefined && (
                    <div
                      className={`px-4 py-2 rounded-sm text-sm font-medium ${
                        typeof product.stock === "number" && product.stock > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {typeof product.stock === "number" && product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of Stock"}
                    </div>
                  )}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  <p>
                    {typeof product.description === "string"
                      ? product.description
                      : Array.isArray(product.description) &&
                          product.description[0]?.children?.[0]?.text
                        ? product.description[0].children[0].text
                        : "No description available"}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Quantity and Actions */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {/* In Stock Actions */}
              {product.stock !== 0 && (
                <>
                  {/* Quantity Selector */}
                  <div className="bg-card/30 backdrop-blur-sm rounded-sm p-6 border border-border/20">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-foreground">
                        {t(currentLanguage, "merchPage.productDetail.quantity")}
                      </span>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                          className="h-10 w-10 rounded-sm"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <motion.span
                          key={quantity}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-12 text-center text-lg font-semibold"
                        >
                          {quantity}
                        </motion.span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={incrementQuantity}
                          className="h-10 w-10 rounded-sm"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Total Price Display */}
                    <div className="mt-4 pt-4 border-t border-border/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {t(currentLanguage, "merchPage.productDetail.total")}
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {(
                            (typeof product.price === "number"
                              ? product.price
                              : 0) * quantity
                          )
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
                          F CFA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    className="w-full bg-teal-800 hover:bg-teal-700 text-teal-200 border-teal-700 h-14 text-lg font-semibold rounded-sm"
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    {t(currentLanguage, "merchPage.productDetail.addToCart")}
                  </Button>
                </>
              )}

              {/* Secondary Actions - Always Visible */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-sm border-border/40 hover:bg-card/50 hover:border-border"
                  onClick={() => {
                    if (isInWishlist(product._id)) {
                      removeFromWishlist(product._id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      isInWishlist(product._id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  {isInWishlist(product._id)
                    ? t(
                        currentLanguage,
                        "merchPage.productDetail.removeFromWishlist",
                      ) || "Remove from Wishlist"
                    : t(
                        currentLanguage,
                        "merchPage.productDetail.addToWishlist",
                      )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-sm border-border/40 hover:bg-card/50 hover:border-border"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {t(currentLanguage, "merchPage.productDetail.share")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  return <ProductDetail product={product} />;
}
