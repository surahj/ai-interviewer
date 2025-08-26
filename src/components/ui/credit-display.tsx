"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Plus } from "lucide-react";
import { useAuth } from "@/components/providers";

interface CreditBalance {
  available_credits: number;
  total_credits_earned: number;
  total_credits_used: number;
}

interface CreditDisplayProps {
  className?: string;
  showPurchaseButton?: boolean;
  onPurchaseClick?: () => void;
}

export function CreditDisplay({
  className = "",
  showPurchaseButton = false,
  onPurchaseClick,
}: CreditDisplayProps) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCredits();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/credits/balance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();
      setCredits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credits");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-red-500 text-sm">Error loading credits</div>
        </CardContent>
      </Card>
    );
  }

  if (!credits) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Coins className="h-4 w-4" />
          Available Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg font-bold">
              {credits.available_credits}
            </Badge>
            <span className="text-xs text-gray-500">credits remaining</span>
          </div>

          {showPurchaseButton && onPurchaseClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={onPurchaseClick}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Buy More
            </Button>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          <div>Total earned: {credits.total_credits_earned}</div>
          <div>Total used: {credits.total_credits_used}</div>
        </div>
      </CardContent>
    </Card>
  );
}
