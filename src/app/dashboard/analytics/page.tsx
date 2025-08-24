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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  Star,
  ArrowLeft,
  Download,
  Share2,
  Filter,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AnalyticsData {
  overallScore: number;
  totalInterviews: number;
  averageTime: string;
  improvement: string;
  streak: number;
  skillBreakdown: {
    [key: string]: {
      score: number;
      trend: string;
      questions: number;
    };
  };
  categoryPerformance: Array<{
    category: string;
    score: number;
    count: number;
    trend: string;
  }>;
  recentTrends: Array<{
    date: string;
    score: number;
    type: string;
  }>;
  weeklyProgress: Array<{
    week: string;
    score: number;
    interviews: number;
  }>;
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("4w");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/dashboard/analytics");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user?.id, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(
        `/api/interview/analytics?timeRange=${timeRange}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.id}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error("Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 mb-2">No analytics data available</p>
          <p className="text-sm text-slate-500">
            Complete some interviews to see your analytics
          </p>
        </div>
      </div>
    );
  }

  const skillBreakdownArray = Object.entries(analyticsData.skillBreakdown).map(
    ([skill, data]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      ...data,
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
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
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Analytics
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Performance Analytics
              </h1>
              <p className="text-slate-600">
                Track your interview performance and identify areas for
                improvement
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:border-slate-400"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:border-slate-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:border-slate-400"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm w-fit">
          {[
            { value: "1w", label: "1 Week" },
            { value: "2w", label: "2 Weeks" },
            { value: "4w", label: "4 Weeks" },
            { value: "3m", label: "3 Months" },
            { value: "6m", label: "6 Months" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Overall Score
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {(() => {
                      const score = analyticsData.overallScore;
                      const displayScore =
                        score > 10 ? score : Math.round(score * 10);
                      return `${displayScore}/100`;
                    })()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      {analyticsData.improvement}
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Interviews
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {analyticsData.totalInterviews}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Completed sessions
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Average Time
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {analyticsData.averageTime}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">Per interview</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Practice Streak
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {analyticsData.streak}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">Days in a row</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Breakdown */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">
              Skills Breakdown
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your performance across different interview skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {skillBreakdownArray.map((skill, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-slate-900">
                        {skill.skill}
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {skill.questions} questions
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-slate-900">
                        {(() => {
                          const score = skill.score;
                          const displayScore =
                            score > 10 ? score : Math.round(score * 10);
                          return `${displayScore}/100`;
                        })()}
                      </span>
                      <div className="flex items-center">
                        {skill.trend.startsWith("+") ? (
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span
                          className={`text-sm ${skill.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                        >
                          {skill.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${(() => {
                          const score = skill.score;
                          const displayScore =
                            score > 10 ? score : Math.round(score * 10);
                          return displayScore;
                        })()}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Category Performance
              </CardTitle>
              <CardDescription className="text-slate-600">
                How you perform across different interview categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.categoryPerformance.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {category.category}
                        </p>
                        <p className="text-sm text-slate-600">
                          {category.count} interviews
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {(() => {
                          const score = category.score;
                          const displayScore =
                            score > 10 ? score : Math.round(score * 10);
                          return `${displayScore}/100`;
                        })()}
                      </p>
                      <div className="flex items-center justify-end">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">
                          {category.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Recent Performance
              </CardTitle>
              <CardDescription className="text-slate-600">
                Your latest interview scores and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {trend.type}
                        </p>
                        <p className="text-sm text-slate-600">{trend.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {(() => {
                          const score = trend.score;
                          const displayScore =
                            score > 10 ? score : Math.round(score * 10);
                          return `${displayScore}/100`;
                        })()}
                      </p>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {trend.score >= 8.5
                          ? "Excellent"
                          : trend.score >= 7.5
                            ? "Good"
                            : "Fair"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">
              Weekly Progress
            </CardTitle>
            <CardDescription className="text-slate-600">
              Track your improvement over the past 4 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {analyticsData.weeklyProgress.map((week, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-slate-50 rounded-lg"
                >
                  <h4 className="font-medium text-slate-900 mb-2">
                    {week.week}
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {(() => {
                          const score = week.score;
                          const displayScore =
                            score > 10 ? score : Math.round(score * 10);
                          return `${displayScore}/100`;
                        })()}
                      </p>
                      <p className="text-sm text-slate-600">Average Score</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {week.interviews}
                      </p>
                      <p className="text-sm text-slate-600">Interviews</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
