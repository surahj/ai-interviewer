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
  Star,
  MessageCircle,
  Brain,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Clock,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface InterviewFeedback {
  overallScore: number;
  skillBreakdown: {
    [skill: string]: {
      score: number;
      trend: string;
      improvement: number;
      personalizedFeedback: string;
    };
  };
  strengths: string[];
  areasForImprovement: string[];
  personalizedRecommendations: string[];
  progressInsights: string[];
  nextSteps: string[];
  confidenceLevel: number;
}

interface InterviewSummary {
  id: string;
  sessionId: string;
  role: string;
  level: string;
  candidateName?: string;
  interviewType: string;
  duration: number;
  focusArea: string;
  customRequirements?: string;
  totalQuestions: number;
  feedback: InterviewFeedback;
  status: string;
  completedAt: string;
}

function InterviewSummaryContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [interviewSummary, setInterviewSummary] =
    useState<InterviewSummary | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.push("/login?redirectTo=/interview/summary");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (interviewId && user) {
      fetchInterviewFeedback();
    }
  }, [interviewId, user]);

  const fetchInterviewFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const response = await fetch(`/api/interview/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          interviewId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInterviewSummary(data.interview);
      } else {
        console.error("Failed to fetch feedback");
        const errorData = await response.json();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error fetching interview feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRoleName = (role: string, level: string) => {
    const roleMap: { [key: string]: string } = {
      "software-engineer": "Software Engineer",
      "frontend-developer": "Frontend Developer",
      "backend-developer": "Backend Developer",
      "fullstack-developer": "Full Stack Developer",
      "data-scientist": "Data Scientist",
      "devops-engineer": "DevOps Engineer",
      "product-manager": "Product Manager",
      "ui-ux-designer": "UI/UX Designer",
      "qa-engineer": "QA Engineer",
      "mobile-developer": "Mobile Developer",
    };

    const formattedRole =
      roleMap[role] ||
      role.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return `${formattedRole} ${level}`;
  };

  // Show loading state while checking authentication
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {isRedirecting
              ? "Redirecting to login..."
              : "Loading interview summary..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loadingFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your interview feedback...</p>
        </div>
      </div>
    );
  }

  if (!interviewSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Interview Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            We couldn't find the interview you're looking for.
          </p>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">
                  Interview Summary
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:border-slate-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Interview Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {formatRoleName(interviewSummary.role, interviewSummary.level)}{" "}
                Interview
              </h1>
              <p className="text-slate-600">
                {interviewSummary.level} level •{" "}
                {interviewSummary.interviewType} •{" "}
                {formatDate(interviewSummary.completedAt)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {(() => {
                  const score = interviewSummary.feedback.overallScore || 0;
                  const displayScore =
                    score > 10 ? score : Math.round(score * 10);
                  return displayScore;
                })()}
              </div>
              <div className="text-sm text-slate-600">Overall Score</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Duration
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatDuration(interviewSummary.duration)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Questions
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {interviewSummary.totalQuestions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Focus Area
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {interviewSummary.focusArea || "General"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Confidence
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {interviewSummary.feedback.confidenceLevel}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Skill Breakdown */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 mb-8">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Skill Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed analysis of your performance across different areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(interviewSummary.feedback.skillBreakdown).map(
                    ([skill, data]) => (
                      <div
                        key={skill}
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-slate-900 capitalize">
                            {skill}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={getScoreBadgeColor(data.score)}>
                              {(() => {
                                const score = data.score || 0;
                                const displayScore =
                                  score > 10 ? score : Math.round(score * 10);
                                return `${displayScore}/100`;
                              })()}
                            </Badge>
                            {data.trend === "improving" && (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full ${getScoreColor(data.score).replace("text-", "bg-")}`}
                            style={{
                              width: `${(() => {
                                const score = data.score || 0;
                                const displayScore =
                                  score > 10 ? score : Math.round(score * 10);
                                return displayScore;
                              })()}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-slate-700 text-sm">
                          {data.personalizedFeedback}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Areas for Improvement */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewSummary.feedback.strengths.map(
                      (strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{strength}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewSummary.feedback.areasForImprovement.map(
                      (area, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{area}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recommendations & Next Steps */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewSummary.feedback.personalizedRecommendations.map(
                    (rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700 text-sm">{rec}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">
                  Progress Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewSummary.feedback.progressInsights.map(
                    (insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 text-sm">
                          {insight}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewSummary.feedback.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-700 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Link href="/setup-interview">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Practice Another Interview
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 hover:border-slate-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InterviewSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading interview summary...</p>
          </div>
        </div>
      }
    >
      <InterviewSummaryContent />
    </Suspense>
  );
}
