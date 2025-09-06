"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCart } from "./cart-context";
import { supabase } from "@/lib/supabase/client";
import PhoneNumberInput from "@/components/ui/phone-number-input";
import { cn } from "@/lib/actions/utils";

const CartContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <div className={cn("px-3 md:px-4", className)}>{children}</div>;
};

interface CartPurchaseFormProps {
    onClose: () => void;
}

export default function CartPurchaseForm({ onClose }: CartPurchaseFormProps) {
    const { cart } = useCart();
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!userName.trim()) {
            setError("Name is required");
            return;
        }
        if (!userEmail.trim()) {
            setError("Email is required");
            return;
        }
        if (!validateEmail(userEmail)) {
            setError("Please enter a valid email address");
            return;
        }
        if (!userPhone.trim()) {
            setError("Phone number is required");
            return;
        }

        if (!cart || cart.lines.length === 0) {
            setError("Your cart is empty");
            return;
        }

        setIsLoading(true);

        try {
            // Prepare cart items for the API
            const cartItems = cart.lines.map((line) => ({
                merchandiseId: line.id,
                quantity: line.quantity,
                productId: line.product.productId,
                title: line.product.name,
                price: line.product.price,
            }));

            const payload = {
                cartItems,
                userName: userName.trim(),
                userEmail: userEmail.trim(),
                userPhone: userPhone.trim(),
                currencyCode: "XOF",
                successUrlPath: "/payment/success",
                cancelUrlPath: "/payment/cancel",
                allowCouponCode: true,
                allowQuantity: false,
            };

            const { data, error: functionError } = await supabase.functions.invoke(
                "create-lomi-cart-checkout",
                { body: payload }
            );

            if (functionError) {
                console.error("Function error:", functionError);
                setError(functionError.message || "Failed to process checkout");
                return;
            }

            if (data?.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                setError("Failed to get checkout URL");
            }
        } catch (e: unknown) {
            console.error("Checkout error:", e);
            const message = e instanceof Error ? e.message : "An unexpected error occurred";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const totalAmount = cart?.cost.totalAmount.amount || "0";

    return (
        <div className="flex flex-col justify-between h-full overflow-hidden">
            <CartContainer className="flex justify-between items-center px-2 text-sm text-muted-foreground mb-4">
                <span className="font-medium">Checkout</span>
                <span className="bg-muted/50 px-2 py-1 rounded-sm text-xs">
                    {cart?.lines.length} item{cart?.lines.length !== 1 ? "s" : ""}
                </span>
            </CartContainer>

            <div className="relative flex-1 min-h-0 py-4 overflow-y-auto">
                <CartContainer>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full Name *
                            </Label>
                            <Input
                                id="name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="rounded-sm h-9"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="rounded-sm h-9"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-sm font-medium">
                                Phone Number *
                            </Label>
                            <PhoneNumberInput
                                value={userPhone}
                                onChange={(value) => setUserPhone(value || "")}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        {error && (
                            <div className="text-xs text-red-400 text-center px-2 py-2 bg-red-900/20 rounded-sm border border-red-700/50">
                                {error}
                            </div>
                        )}
                    </form>
                </CartContainer>
            </div>

            <CartContainer>
                <div className="py-3 text-sm shrink-0">
                    <CartContainer className="space-y-2">
                        <div className="flex justify-between items-center py-3">
                            <p className="font-medium text-foreground">Shipping</p>
                            <p className="text-muted-foreground">Calculated at checkout</p>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <p className="text-lg font-bold text-foreground">Total</p>
                            <p className="text-xl font-bold text-primary">
                                {Number(totalAmount).toLocaleString("fr-FR")} F CFA
                            </p>
                        </div>
                    </CartContainer>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-sm"
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading || !userName.trim() || !userEmail.trim() || !userPhone.trim()}
                        className="flex-1 bg-teal-800 hover:bg-teal-700 text-teal-200 rounded-sm font-semibold h-9"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Complete Purchase"
                        )}
                    </Button>
                </div>
            </CartContainer>
        </div>
    );
}
