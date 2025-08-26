"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function CreditsSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string>("processing");

  useEffect(() => {
    if (sessionId) {
      // Simulate payment verification
      setTimeout(() => {
        setPaymentStatus("completed");
        setLoading(false);
      }, 2000);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
              <span className="text-white text-2xl">⟳</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
            <p className="text-gray-600 mb-4">
              Please wait while we verify your payment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>

          {sessionId ? (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Your payment has been processed successfully.
              </p>
              <p className="text-sm text-gray-500">
                Your credits have been added to your account.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Session: {sessionId.substring(0, 20)}...
              </p>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">Thank you for your purchase!</p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Log In to View Credits
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-transparent text-gray-600 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              A receipt has been sent to your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreditsSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                <span className="text-white text-2xl">⟳</span>
              </div>
              <h1 className="text-2xl font-bold mb-4">Loading...</h1>
              <p className="text-gray-600 mb-4">
                Please wait while we load the page.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <CreditsSuccessContent />
    </Suspense>
  );
}
