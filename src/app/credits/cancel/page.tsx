"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function CreditsCancelPage() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.push("/dashboard/credits");
  };

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-2">Your payment was cancelled.</p>
            <p className="text-sm text-gray-600">
              No charges were made to your account. You can try again anytime.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleTryAgain} className="w-full">
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>
              If you're having trouble with payments, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
