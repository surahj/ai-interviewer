"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/ui/footer";
import { Check, Star, Zap, Crown, ArrowRight, Coins } from "lucide-react";
import { useEffect, useState } from "react";

interface CreditPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price_cents: number;
  price_dollars: string;
  price_per_credit: string;
}

export default function PricingPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch("/api/credits/packages", {
          headers: {
            Authorization: "Bearer public", // Public endpoint for pricing
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPackages(data);
        } else {
          // Fallback to default packages if API fails
          setPackages([
            {
              id: "starter",
              name: "Starter Pack",
              description: "Perfect for trying out the platform",
              credits: 50,
              price_cents: 999,
              price_dollars: "9.99",
              price_per_credit: "0.20",
            },
            {
              id: "professional",
              name: "Professional Pack",
              description: "Most popular choice for regular users",
              credits: 150,
              price_cents: 2499,
              price_dollars: "24.99",
              price_per_credit: "0.17",
            },
            {
              id: "enterprise",
              name: "Enterprise Pack",
              description: "Best value for heavy users",
              credits: 500,
              price_cents: 7999,
              price_dollars: "79.99",
              price_per_credit: "0.16",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        // Fallback to default packages
        setPackages([
          {
            id: "starter",
            name: "Starter Pack",
            description: "Perfect for trying out the platform",
            credits: 50,
            price_cents: 999,
            price_dollars: "9.99",
            price_per_credit: "0.20",
          },
          {
            id: "professional",
            name: "Professional Pack",
            description: "Most popular choice for regular users",
            credits: 150,
            price_cents: 2499,
            price_dollars: "24.99",
            price_per_credit: "0.17",
          },
          {
            id: "enterprise",
            name: "Enterprise Pack",
            description: "Best value for heavy users",
            credits: 500,
            price_cents: 7999,
            price_dollars: "79.99",
            price_per_credit: "0.16",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const getPackageIcon = (index: number) => {
    switch (index) {
      case 0:
        return Star;
      case 1:
        return Zap;
      case 2:
        return Crown;
      default:
        return Coins;
    }
  };

  const getPackageColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-blue-500 to-blue-600";
      case 1:
        return "from-green-500 to-green-600";
      case 2:
        return "from-purple-500 to-purple-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const calculateInterviews = (credits: number) => {
    // Based on the credit system: 1 credit per 3 minutes, minimum 5 credits per interview
    // Average interview is 15-20 minutes = 5-7 credits
    const avgCreditsPerInterview = 6;
    return Math.floor(credits / avgCreditsPerInterview);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Coins className="w-6 h-6 text-white" />
                </div>
              </Link>
              <Link href="/">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  AI Interviewer
                </span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/#features"
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-slate-700 hover:text-slate-900 font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium mb-6">
            💰 Pay Per Use - No Subscriptions
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Simple Credit-Based Pricing
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Buy credits and use them for interviews. No monthly fees, no hidden
            costs. Pay only for what you use with our transparent credit system.
          </p>
        </div>
      </section>

      {/* Credit System Explanation */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              How Our Credit System Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Buy Credits
                </h3>
                <p className="text-slate-600 text-sm">
                  Purchase credit packages based on your needs. More credits =
                  better value.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Use for Interviews
                </h3>
                <p className="text-slate-600 text-sm">
                  Each interview uses credits based on duration. Average: 6
                  credits per interview.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Expiry
                </h3>
                <p className="text-slate-600 text-sm">
                  Credits never expire. Use them whenever you want, no rush.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Packages */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading pricing packages...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => {
                const IconComponent = getPackageIcon(index);
                const isPopular = index === 1; // Professional pack is most popular
                const interviews = calculateInterviews(pkg.credits);

                return (
                  <Card
                    key={pkg.id}
                    className={`relative group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl ${
                      isPopular
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white scale-105"
                        : "bg-white hover:scale-105"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-yellow-400 text-yellow-900 px-4 py-2 text-sm font-bold">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-8">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${
                          isPopular
                            ? "bg-white/20"
                            : `bg-gradient-to-br ${getPackageColor(index)}`
                        }`}
                      >
                        <IconComponent
                          className={`w-8 h-8 ${
                            isPopular ? "text-white" : "text-white"
                          }`}
                        />
                      </div>
                      <CardTitle
                        className={`text-2xl font-bold mb-2 ${
                          isPopular ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {pkg.name}
                      </CardTitle>
                      <div className="mb-4">
                        <span
                          className={`text-4xl font-bold ${
                            isPopular ? "text-white" : "text-slate-900"
                          }`}
                        >
                          ${pkg.price_dollars}
                        </span>
                        <span
                          className={`text-lg ${
                            isPopular ? "text-blue-100" : "text-slate-600"
                          }`}
                        >
                          /one-time
                        </span>
                      </div>
                      <CardDescription
                        className={`text-base ${
                          isPopular ? "text-blue-100" : "text-slate-600"
                        }`}
                      >
                        {pkg.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="text-center mb-6">
                        <div
                          className={`text-3xl font-bold mb-2 ${
                            isPopular ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {pkg.credits} Credits
                        </div>
                        <div
                          className={`text-sm ${
                            isPopular ? "text-blue-100" : "text-slate-600"
                          }`}
                        >
                          ≈ {interviews} interviews
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            isPopular ? "text-blue-200" : "text-slate-500"
                          }`}
                        >
                          ${pkg.price_per_credit} per credit
                        </div>
                      </div>

                      <ul className="space-y-4">
                        <li className="flex items-start space-x-3">
                          <Check
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              isPopular ? "text-green-300" : "text-green-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isPopular ? "text-blue-100" : "text-slate-600"
                            }`}
                          >
                            {pkg.credits} interview credits
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Check
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              isPopular ? "text-green-300" : "text-green-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isPopular ? "text-blue-100" : "text-slate-600"
                            }`}
                          >
                            No expiration date
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Check
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              isPopular ? "text-green-300" : "text-green-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isPopular ? "text-blue-100" : "text-slate-600"
                            }`}
                          >
                            Full AI interview features
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Check
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              isPopular ? "text-green-300" : "text-green-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isPopular ? "text-blue-100" : "text-slate-600"
                            }`}
                          >
                            Detailed feedback & analytics
                          </span>
                        </li>
                      </ul>

                      <Link href="/register" className="block mt-8">
                        <Button
                          className={`w-full py-3 text-base font-semibold ${
                            isPopular
                              ? "bg-white text-blue-600 hover:bg-slate-100"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          } shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                          Get Started
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Credit Usage Info */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Credit Usage Guide
            </h2>
            <p className="text-xl text-slate-600">
              Understand how credits are used for different interview types
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  How are credits calculated?
                </h3>
                <p className="text-slate-600">
                  Credits are based on interview duration: 1 credit per 3
                  minutes, with a minimum of 5 credits per interview.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What's included in each interview?
                </h3>
                <p className="text-slate-600">
                  Full AI conversation, speech recognition, detailed feedback,
                  performance analytics, and interview summary.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Can I get a refund?
                </h3>
                <p className="text-slate-600">
                  Yes, we offer a 30-day money-back guarantee on unused credits.
                  Contact support for assistance.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Do credits expire?
                </h3>
                <p className="text-slate-600">
                  No, credits never expire. Use them whenever you want, no rush
                  or pressure.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What payment methods do you accept?
                </h3>
                <p className="text-slate-600">
                  We accept all major credit cards, PayPal, and Apple Pay. All
                  payments are processed securely through Stripe.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Is my data secure?
                </h3>
                <p className="text-slate-600">
                  Absolutely. We use enterprise-grade encryption and security
                  measures to protect your interview data and personal
                  information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Practicing?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of professionals who have improved their interview
            performance with AI Interviewer.
          </p>
          <div className="flex justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold border-0"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer icon="coins" />
    </div>
  );
}
