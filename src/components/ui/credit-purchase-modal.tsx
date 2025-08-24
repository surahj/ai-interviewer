"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/components/providers";
import { redirectToCheckout } from "@/lib/stripe-client";

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price_cents: number;
  price_dollars: string;
  price_per_credit: string;
}

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export function CreditPurchaseModal({
  isOpen,
  onClose,
  onPurchaseSuccess,
}: CreditPurchaseModalProps) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/credits/packages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();
      setPackages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) return;

    try {
      setPurchasing(packageId);
      setError(null);

      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        credentials: "include",
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Purchase failed");
      }

      const result = await response.json();

      if (result.success && result.checkout_url) {
        // Redirect to Stripe checkout
        await redirectToCheckout(result.checkout_url);
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setPurchasing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Purchase Credits</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading packages...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <Badge variant="secondary" className="text-sm">
                        {pkg.credits} credits
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold">
                          ${pkg.price_dollars}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${pkg.price_per_credit} per credit
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={purchasing === pkg.id}
                        className="flex items-center gap-2"
                      >
                        {purchasing === pkg.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Purchasing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Purchase
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Credits are used for AI-powered interviews. Each interview costs
              credits based on duration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
