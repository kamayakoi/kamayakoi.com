"use client";

import { MinusIcon, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useTransition } from "react";
import { useCart, CartItem } from "./cart-context";
import { Button } from "@/components/ui/button";

interface CartItemCardProps {
  item: CartItem;
  onCloseCart?: () => void;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateItem } = useCart();
  const [isPending, startTransition] = useTransition();

  const { id, quantity, product } = item;
  const image = product.mainImage || product.images?.[0]?.url;
  // const imageWidth = product.images?.[0]?.metadata?.dimensions?.width || 400;
  // const imageHeight = product.images?.[0]?.metadata?.dimensions?.height || 600;

  const handleUpdateQuantity = (newQuantity: number) => {
    startTransition(async () => {
      await updateItem(id, id, newQuantity, "plus");
    });
  };

  const handleRemoveItem = () => {
    startTransition(async () => {
      await updateItem(id, id, 0, "delete");
    });
  };

  return (
    <div className="flex gap-4 p-4 bg-background rounded-sm border">
      {/* Product Image */}
      <div className="flex-shrink-0">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            width={80}
            height={100}
            className="object-cover rounded-sm"
          />
        ) : (
          <div className="w-20 h-24 bg-muted rounded-sm flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No Image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground">
              {product.price.toLocaleString()} F CFA
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveItem}
            disabled={isPending}
            className="flex-shrink-0 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateQuantity(Math.max(1, quantity - 1))}
              disabled={isPending || quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <MinusIcon className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium min-w-[2rem] text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateQuantity(quantity + 1)}
              disabled={isPending}
              className="h-8 w-8 p-0"
            >
              <PlusIcon className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-sm font-medium">
            {(product.price * quantity).toLocaleString()} F CFA
          </div>
        </div>
      </div>
    </div>
  );
}
