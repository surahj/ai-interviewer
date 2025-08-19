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
  Mic,
  User,
  LogOut,
  Play,
  BarChart3,
  Clock,
  Trophy,
  Settings,
  Calendar,
  Target,
  TrendingUp,
  BookOpen,
  Star,
  Award,
  Activity,
  ChevronRight,
  Plus,
  Eye,
  Download,
  Share2,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Interface for interview data
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
  };
  status: string;
  created_at: string;
  completed_at?: string;
}

interface PerformanceStats {
  totalInterviews: number;
  averageScore: number;
  thisWeek: number;
  totalTime: string;
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewData[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    totalInterviews: 0,
    averageScore: 0,
    thisWeek: 0,
    totalTime: "0 hours",
  });
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.push("/login?redirectTo=/dashboard");
    }
  }, [user, loading, router]);

  // Fetch user-specific data when user is available
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);

      // Fetch interview history for the current user
      const response = await fetch("/api/interview/history", {
        headers: {
          Authorization: `Bearer ${user?.id}`, // Send user ID for filtering
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userInterviews = data.interviews || [];

        console.log("Dashboard data:", {
          totalInterviews: data.total,
          userInterviews: userInterviews.length,
          userId: user?.id,
          interviews: userInterviews,
        });

        setInterviewHistory(userInterviews);

        // Calculate performance stats
        const totalInterviews = userInterviews.length;
        const completedInterviews = userInterviews.filter(
          (i: InterviewData) => i.status === "completed"
        );
        const averageScore =
          completedInterviews.length > 0
            ? completedInterviews.reduce(
                (sum: number, i: InterviewData) =>
                  sum + (i.feedback?.overallScore || 0),
                0
              ) / completedInterviews.length
            : 0;

        // Calculate this week's interviews
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeek = completedInterviews.filter(
          (i: InterviewData) => new Date(i.created_at) >= oneWeekAgo
        ).length;

        // Calculate total time
        const totalMinutes = completedInterviews.reduce(
          (sum: number, i: InterviewData) => sum + (i.duration || 0),
          0
        );
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

        setPerformanceStats({
          totalInterviews,
          averageScore: Math.round(averageScore * 10) / 10,
          thisWeek,
          totalTime: `${totalHours} hours`,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading state while checking authentication
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {isRedirecting ? "Redirecting to login..." : "Loading dashboard..."}
          </p>
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">
                  AI Interviewer
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-slate-300 hover:border-slate-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-slate-600">
            Ready to ace your next interview? Let's get started.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Real-time Conversation
                  </h3>
                  <p className="text-sm text-slate-600">Speech-to-speech AI</p>
                </div>
              </div>
              <Link href="/setup-interview">
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Start Conversation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Analytics</h3>
                  <p className="text-sm text-slate-600">View your progress</p>
                </div>
              </div>
              <Link href="/dashboard/analytics">
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Interviews
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {performanceStats.totalInterviews}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {performanceStats.averageScore}/10
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    This Week
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {performanceStats.thisWeek}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Time
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {performanceStats.totalTime}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-slate-900">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Your latest interview sessions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:border-slate-400"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">
                  Loading your interview history...
                </p>
              </div>
            ) : interviewHistory.length > 0 ? (
              <div className="space-y-4">
                {interviewHistory.slice(0, 5).map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {interview.role} {interview.level}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
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
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          {interview.feedback?.overallScore || "N/A"}/10
                        </p>
                        <p className="text-sm text-slate-600">Score</p>
                      </div>
                      <Link
                        href={`/interview/summary?sessionId=${interview.id}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 hover:border-slate-400"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-2">No interviews yet</p>
                <p className="text-sm text-slate-500">
                  Start your first interview to see your activity here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Quick Tips</CardTitle>
            <CardDescription className="text-slate-600">
              Improve your interview performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Practice Regularly
                    </h4>
                    <p className="text-sm text-slate-600">
                      Consistent practice helps build confidence and improve
                      your skills.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-semibold">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Review Feedback
                    </h4>
                    <p className="text-sm text-slate-600">
                      Pay attention to AI feedback to identify areas for
                      improvement.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-semibold">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Try Different Types
                    </h4>
                    <p className="text-sm text-slate-600">
                      Experiment with technical, behavioral, and mixed
                      interviews.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm font-semibold">
                      4
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">
                      Use Real-time Mode
                    </h4>
                    <p className="text-sm text-slate-600">
                      Practice with speech-to-speech for a more realistic
                      experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
