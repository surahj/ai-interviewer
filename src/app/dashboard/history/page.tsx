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
  Calendar,
  Clock,
  Eye,
  Filter,
  Search,
  Mic,
  Trophy,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InterviewData {
  id: string;
  user_id?: string;
  role: string;
  level: string;
  interview_type: string;
  duration: number;
  feedback?: {
    overallScore: number;
    communication: { score: number };
    technicalDepth: { score: number };
    confidence: { score: number };
    clarity: { score: number };
    skillBreakdown?: {
      communication?: { score: number };
      technical?: { score: number };
      confidence?: { score: number };
      clarity?: { score: number };
    };
  };
  status: string;
  created_at: string;
  completed_at?: string;
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/dashboard/history");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchInterviewHistory();
    }
  }, [user?.id]);

  const fetchInterviewHistory = async () => {
    try {
      setLoadingData(true);
      const response = await fetch("/api/interview/history", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error("Error fetching interview history:", error);
    } finally {
      setLoadingData(false);
    }
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

  // Filter and sort interviews
  const filteredAndSortedInterviews = interviews
    .filter((interview) => {
      const matchesSearch =
        interview.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.interview_type
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === "all" || interview.interview_type === filterType;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "score":
          return (
            (b.feedback?.overallScore || 0) - (a.feedback?.overallScore || 0)
          );
        case "duration":
          return (b.duration || 0) - (a.duration || 0);
        default:
          return 0;
      }
    });

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading interview history...</p>
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Interview History
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Interview History
          </h1>
          <p className="text-slate-600">
            Review all your completed interviews and track your progress
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search interviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter by Type */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="mixed">Mixed</option>
                  <option value="case-study">Case Study</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                  <option value="duration">Sort by Duration</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview List */}
        <div className="space-y-4">
          {filteredAndSortedInterviews.length > 0 ? (
            filteredAndSortedInterviews.map((interview) => (
              <Card
                key={interview.id}
                className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {formatRoleName(interview.role, interview.level)}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(
                              interview.created_at
                            ).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {interview.duration} min
                          </span>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {interview.interview_type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-lg font-bold text-slate-900">
                            {(() => {
                              const score =
                                interview.feedback?.overallScore || 0;
                              // If score is already in 0-100 range, don't multiply
                              // If score is in 0-10 range, multiply by 10
                              const displayScore =
                                score > 10 ? score : Math.round(score * 10);
                              return `${displayScore}/100`;
                            })()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">Score</p>
                      </div>

                      <Link href={`/interview/summary/${interview.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 hover:border-slate-400"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  {interview.feedback && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-slate-600">
                            Communication
                          </p>
                          <p className="font-semibold text-slate-900">
                            {(() => {
                              const score =
                                interview.feedback.skillBreakdown?.communication
                                  ?.score || 0;
                              const displayScore =
                                score > 10 ? score : Math.round(score * 10);
                              return `${displayScore}/100`;
                            })()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Technical</p>
                          <p className="font-semibold text-slate-900">
                            {(() => {
                              const score =
                                interview.feedback.skillBreakdown?.technical
                                  ?.score || 0;
                              const displayScore =
                                score > 10 ? score : Math.round(score * 10);
                              return `${displayScore}/100`;
                            })()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Confidence</p>
                          <p className="font-semibold text-slate-900">
                            {(() => {
                              const score =
                                interview.feedback.skillBreakdown?.confidence
                                  ?.score || 0;
                              const displayScore =
                                score > 10 ? score : Math.round(score * 10);
                              return `${displayScore}/100`;
                            })()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Clarity</p>
                          <p className="font-semibold text-slate-900">
                            {(() => {
                              const score =
                                interview.feedback.skillBreakdown?.clarity
                                  ?.score || 0;
                              const displayScore =
                                score > 10 ? score : Math.round(score * 10);
                              return `${displayScore}/100`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No interviews found
                </h3>
                <p className="text-slate-600 mb-4">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start your first interview to see your history here"}
                </p>
                {!searchTerm && filterType === "all" && (
                  <Link href="/setup-interview">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Start Your First Interview
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Stats */}
        {interviews.length > 0 && (
          <div className="mt-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {interviews.length}
                    </p>
                    <p className="text-sm text-slate-600">Total Interviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {(() => {
                        if (interviews.length === 0) return "0/100";
                        const avgScore =
                          interviews.reduce(
                            (sum, i) => sum + (i.feedback?.overallScore || 0),
                            0
                          ) / interviews.length;
                        const displayScore =
                          avgScore > 10
                            ? Math.round(avgScore)
                            : Math.round(avgScore * 10);
                        return `${displayScore}/100`;
                      })()}
                    </p>
                    <p className="text-sm text-slate-600">Average Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {interviews.length > 0
                        ? Math.round(
                            interviews.reduce(
                              (sum, i) => sum + (i.duration || 0),
                              0
                            ) / interviews.length
                          )
                        : 0}{" "}
                      min
                    </p>
                    <p className="text-sm text-slate-600">Average Duration</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {
                        new Set(
                          interviews.map((i) =>
                            new Date(i.created_at).toDateString()
                          )
                        ).size
                      }
                    </p>
                    <p className="text-sm text-slate-600">Days Practiced</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
