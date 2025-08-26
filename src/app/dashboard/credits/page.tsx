"use client";

import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditDisplay } from "@/components/ui/credit-display";
import { CreditPurchaseModal } from "@/components/ui/credit-purchase-modal";

interface CreditTransaction {
  id: string;
  type: "purchase" | "usage" | "bonus" | "refund";
  credits: number;
  description: string;
  created_at: string;
  package_id?: string;
  interview_id?: string;
}

interface CreditStats {
  totalEarned: number;
  totalUsed: number;
  available: number;
  averagePerInterview: number;
}

export default function CreditsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/dashboard/credits");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchCreditData();
    }
  }, [user?.id]);

  const fetchCreditData = async () => {
    try {
      setLoadingData(true);

      // Fetch transactions
      const transactionsResponse = await fetch("/api/credits/transactions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        credentials: "include",
      });
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }

      // Fetch credit stats
      const statsResponse = await fetch("/api/credits/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        credentials: "include",
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching credit data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "usage":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "bonus":
        return <Coins className="w-4 h-4 text-yellow-600" />;
      case "refund":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "text-green-600";
      case "usage":
        return "text-red-600";
      case "bonus":
        return "text-yellow-600";
      case "refund":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading credits...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Credits & Billing
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Credits & Billing
          </h1>
          <p className="text-slate-600">
            Manage your credits and view your transaction history
          </p>
        </div>

        {/* Credit Balance and Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <CreditDisplay
              className="h-full"
              showPurchaseButton={true}
              onPurchaseClick={() => setShowPurchaseModal(true)}
            />
          </div>

          <div className="md:col-span-2">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 h-full">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Credit Statistics
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Your credit usage overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalEarned}
                      </div>
                      <div className="text-sm text-blue-800">Total Earned</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {stats.totalUsed}
                      </div>
                      <div className="text-sm text-red-800">Total Used</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.available}
                      </div>
                      <div className="text-sm text-green-800">Available</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.averagePerInterview}
                      </div>
                      <div className="text-sm text-purple-800">
                        Avg/Interview
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    No statistics available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-900">
                  Transaction History
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Your recent credit transactions
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowPurchaseModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(transaction.created_at)}</span>
                          <Badge
                            variant="secondary"
                            className={`${getTransactionColor(transaction.type)} border-current`}
                          >
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}
                      >
                        {transaction.credits > 0 ? "+" : ""}
                        {transaction.credits}
                      </p>
                      <p className="text-sm text-slate-600">credits</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-2">No transactions yet</p>
                <p className="text-sm text-slate-500">
                  Your credit transactions will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Information */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">
              How Credits Work
            </CardTitle>
            <CardDescription className="text-slate-600">
              Understanding the credit system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Credit Usage</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• 1 credit per 3 minutes of interview time</li>
                  <li>• Minimum 5 credits per interview</li>
                  <li>• Maximum 50 credits per interview</li>
                  <li>• Credits are deducted when you start an interview</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">
                  Getting Credits
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• 50 credits awarded upon registration</li>
                  <li>• Purchase additional credits as needed</li>
                  <li>• Credits never expire</li>
                  <li>
                    • Unused credits are refunded if interview is cancelled
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseSuccess={() => {
          fetchCreditData();
        }}
      />
    </div>
  );
}
