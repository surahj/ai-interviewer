'use client';

import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock data for analytics
const mockAnalyticsData = {
  overallScore: 8.5,
  totalInterviews: 12,
  averageTime: '32 min',
  improvement: '+15%',
  streak: 5,
  weeklyProgress: [
    { week: 'Week 1', score: 7.2, interviews: 3 },
    { week: 'Week 2', score: 7.8, interviews: 4 },
    { week: 'Week 3', score: 8.1, interviews: 2 },
    { week: 'Week 4', score: 8.5, interviews: 3 }
  ],
  skillBreakdown: [
    { skill: 'Technical Knowledge', score: 85, trend: '+5%', questions: 45 },
    { skill: 'Communication', score: 78, trend: '+12%', questions: 38 },
    { skill: 'Problem Solving', score: 82, trend: '+8%', questions: 42 },
    { skill: 'Leadership', score: 75, trend: '+15%', questions: 28 },
    { skill: 'Teamwork', score: 80, trend: '+3%', questions: 35 }
  ],
  categoryPerformance: [
    { category: 'Technical', score: 8.7, count: 6, trend: '+8%' },
    { category: 'Behavioral', score: 8.2, count: 4, trend: '+12%' },
    { category: 'Problem Solving', score: 8.9, count: 2, trend: '+5%' }
  ],
  recentTrends: [
    { date: '2024-01-15', score: 8.7, type: 'Technical' },
    { date: '2024-01-12', score: 7.9, type: 'Behavioral' },
    { date: '2024-01-10', score: 9.2, type: 'Problem Solving' },
    { date: '2024-01-08', score: 8.1, type: 'Technical' },
    { date: '2024-01-05', score: 7.8, type: 'Behavioral' }
  ]
};

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('4w');
  const [selectedSkill, setSelectedSkill] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/dashboard/analytics');
    }
  }, [user, loading, router]);

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">Analytics</span>
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
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Analytics</h1>
              <p className="text-slate-600">
                Track your interview performance and identify areas for improvement
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="border-slate-300 hover:border-slate-400">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-slate-300 hover:border-slate-400">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-slate-300 hover:border-slate-400">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm w-fit">
          {[
            { value: '1w', label: '1 Week' },
            { value: '2w', label: '2 Weeks' },
            { value: '4w', label: '4 Weeks' },
            { value: '3m', label: '3 Months' },
            { value: '6m', label: '6 Months' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
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
                  <p className="text-sm font-medium text-slate-600">Overall Score</p>
                  <p className="text-3xl font-bold text-slate-900">{mockAnalyticsData.overallScore}/10</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">{mockAnalyticsData.improvement}</span>
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
                  <p className="text-sm font-medium text-slate-600">Total Interviews</p>
                  <p className="text-3xl font-bold text-slate-900">{mockAnalyticsData.totalInterviews}</p>
                  <p className="text-sm text-slate-600 mt-2">Completed sessions</p>
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
                  <p className="text-sm font-medium text-slate-600">Average Time</p>
                  <p className="text-3xl font-bold text-slate-900">{mockAnalyticsData.averageTime}</p>
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
                  <p className="text-sm font-medium text-slate-600">Practice Streak</p>
                  <p className="text-3xl font-bold text-slate-900">{mockAnalyticsData.streak}</p>
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
            <CardTitle className="text-xl text-slate-900">Skills Breakdown</CardTitle>
            <CardDescription className="text-slate-600">
              Your performance across different interview skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockAnalyticsData.skillBreakdown.map((skill, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-slate-900">{skill.skill}</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {skill.questions} questions
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-slate-900">{skill.score}%</span>
                      <div className="flex items-center">
                        {skill.trend.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm ${skill.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {skill.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${skill.score}%` }}
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
              <CardTitle className="text-xl text-slate-900">Category Performance</CardTitle>
              <CardDescription className="text-slate-600">
                How you perform across different interview categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.categoryPerformance.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{category.category}</p>
                        <p className="text-sm text-slate-600">{category.count} interviews</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{category.score}/10</p>
                      <div className="flex items-center justify-end">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">{category.trend}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Recent Performance</CardTitle>
              <CardDescription className="text-slate-600">
                Your latest interview scores and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.recentTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{trend.type}</p>
                        <p className="text-sm text-slate-600">{trend.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{trend.score}/10</p>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {trend.score >= 8.5 ? 'Excellent' : trend.score >= 7.5 ? 'Good' : 'Fair'}
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
            <CardTitle className="text-xl text-slate-900">Weekly Progress</CardTitle>
            <CardDescription className="text-slate-600">
              Track your improvement over the past 4 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {mockAnalyticsData.weeklyProgress.map((week, index) => (
                <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">{week.week}</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{week.score}/10</p>
                      <p className="text-sm text-slate-600">Average Score</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{week.interviews}</p>
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
