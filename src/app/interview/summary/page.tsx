'use client';

import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface InterviewFeedback {
  overallScore: number;
  communication: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  technicalDepth: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  confidence: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  clarity: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

interface InterviewSummary {
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
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.push('/login?redirectTo=/interview/summary');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (sessionId && user) {
      fetchInterviewFeedback();
    }
  }, [sessionId, user]);

  const fetchInterviewFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const response = await fetch(`/api/interview/feedback?sessionId=${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setInterviewSummary(data);
      } else {
        console.error('Failed to fetch feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadReport = () => {
    if (!interviewSummary || !interviewSummary.role || !interviewSummary.feedback) return;
    
    const report = `
Interview Summary Report
=======================

Session ID: ${interviewSummary.sessionId}
Role: ${interviewSummary.role}
Level: ${interviewSummary.level}
Candidate: ${interviewSummary.candidateName || 'Not specified'}
Interview Type: ${interviewSummary.interviewType}
Duration: ${interviewSummary.duration} minutes
Focus Area: ${interviewSummary.focusArea}
Completed: ${formatDate(interviewSummary.completedAt)}

Overall Score: ${interviewSummary.feedback.overallScore}/100

SCORE BREAKDOWN:
===============

Communication: ${interviewSummary.feedback.communication.score}/100
${interviewSummary.feedback.communication.feedback}

Technical Depth: ${interviewSummary.feedback.technicalDepth.score}/100
${interviewSummary.feedback.technicalDepth.feedback}

Confidence: ${interviewSummary.feedback.confidence.score}/100
${interviewSummary.feedback.confidence.feedback}

Clarity: ${interviewSummary.feedback.clarity.score}/100
${interviewSummary.feedback.clarity.feedback}

STRENGTHS:
==========
${interviewSummary.feedback.strengths.map(strength => `• ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT:
======================
${interviewSummary.feedback.areasForImprovement.map(area => `• ${area}`).join('\n')}

RECOMMENDATIONS:
===============
${interviewSummary.feedback.recommendations.map(rec => `• ${rec}`).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${interviewSummary.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || isRedirecting || loadingFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {isRedirecting ? 'Redirecting to login...' : 'Loading interview summary...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!interviewSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Interview Summary Not Found</h2>
              <p className="text-slate-600 mb-6">
                The interview summary you're looking for could not be found or hasn't been generated yet.
              </p>
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Add null checks for required properties
  if (!interviewSummary.role || !interviewSummary.level || !interviewSummary.feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Interview Data</h2>
              <p className="text-slate-600 mb-6">
                The interview data is incomplete or corrupted. Please try again.
              </p>
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">Interview Summary</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Interview Overview */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-slate-900">Interview Summary</CardTitle>
                <CardDescription className="text-slate-600">
                  Complete feedback and analysis of your interview performance
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={downloadReport}
                  className="border-slate-300 hover:border-slate-400"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-300 hover:border-slate-400"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">Role</h3>
                <p className="text-slate-600">{interviewSummary.role?.replace('-', ' ') || interviewSummary.role}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">Level</h3>
                <p className="text-slate-600">{interviewSummary.level}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">Type</h3>
                <p className="text-slate-600">{interviewSummary.interviewType}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">Duration</h3>
                <p className="text-slate-600">{interviewSummary.duration} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Score */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold text-white ${getScoreColor(interviewSummary.feedback.overallScore)}`}>
                    {interviewSummary.feedback.overallScore}
                  </div>
                  <div className="text-white text-sm">/ 100</div>
                </div>
              </div>
              <Badge className={`text-lg px-4 py-2 ${getScoreBadgeColor(interviewSummary.feedback.overallScore)}`}>
                {interviewSummary.feedback.overallScore >= 80 ? 'Excellent' : 
                 interviewSummary.feedback.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Communication */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-900">Communication</CardTitle>
                <Badge className={getScoreBadgeColor(interviewSummary.feedback.communication.score)}>
                  {interviewSummary.feedback.communication.score}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{interviewSummary.feedback.communication.feedback}</p>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Suggestions:</h4>
                <ul className="space-y-1">
                  {interviewSummary.feedback.communication.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Technical Depth */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-900">Technical Depth</CardTitle>
                <Badge className={getScoreBadgeColor(interviewSummary.feedback.technicalDepth.score)}>
                  {interviewSummary.feedback.technicalDepth.score}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{interviewSummary.feedback.technicalDepth.feedback}</p>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Suggestions:</h4>
                <ul className="space-y-1">
                  {interviewSummary.feedback.technicalDepth.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Confidence */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-900">Confidence</CardTitle>
                <Badge className={getScoreBadgeColor(interviewSummary.feedback.confidence.score)}>
                  {interviewSummary.feedback.confidence.score}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{interviewSummary.feedback.confidence.feedback}</p>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Suggestions:</h4>
                <ul className="space-y-1">
                  {interviewSummary.feedback.confidence.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Clarity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-900">Clarity</CardTitle>
                <Badge className={getScoreBadgeColor(interviewSummary.feedback.clarity.score)}>
                  {interviewSummary.feedback.clarity.score}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{interviewSummary.feedback.clarity.feedback}</p>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Suggestions:</h4>
                <ul className="space-y-1">
                  {interviewSummary.feedback.clarity.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strengths and Areas for Improvement */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {interviewSummary.feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-green-800 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-900 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {interviewSummary.feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="text-orange-800 flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {interviewSummary.feedback.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <p className="text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Link href="/setup-interview">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Target className="w-4 h-4 mr-2" />
              Practice Another Interview
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-300 hover:border-slate-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function InterviewSummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading interview summary...</p>
        </div>
      </div>
    }>
      <InterviewSummaryContent />
    </Suspense>
  );
}
