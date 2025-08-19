'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  SkipForward, 
  Clock,
  Send,
  Square,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import InterviewTimer from '@/components/interview/InterviewTimer';
import QuestionDisplay from '@/components/interview/QuestionDisplay';
import ResponseInput from '@/components/interview/ResponseInput';
import ProgressBar from '@/components/interview/ProgressBar';
import { Label } from '@/components/ui/label';

interface Interview {
  id: string;
  job_role: string;
  experience_level: string;
  duration: number;
  focus_areas: string[];
  status: 'setup' | 'active' | 'paused' | 'completed';
  created_at: string;
}

interface Question {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'problem-solving';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalQuestions] = useState(5); // Mock data

  useEffect(() => {
    loadInterview();
  }, [interviewId]);

  useEffect(() => {
    if (interview && interview.status === 'active') {
      loadCurrentQuestion();
    }
  }, [interview, currentQuestionIndex]);

  const loadInterview = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: interviewData, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .eq('user_id', user.id)
        .single();

      if (interviewError) {
        throw interviewError;
      }

      setInterview(interviewData);
      setTimeRemaining(interviewData.duration * 60); // Convert to seconds
      
      // If interview is in setup status, start it
      if (interviewData.status === 'setup') {
        await startInterview();
      }
    } catch (err) {
      console.error('Error loading interview:', err);
      setError('Failed to load interview session');
      toast.error('Failed to load interview session');
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = async () => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ status: 'active' })
        .eq('id', interviewId);

      if (error) throw error;

      setInterview(prev => prev ? { ...prev, status: 'active' } : null);
      toast.success('Interview started!');
    } catch (err) {
      console.error('Error starting interview:', err);
      toast.error('Failed to start interview');
    }
  };

  const loadCurrentQuestion = async () => {
    // Mock question loading - in real implementation, this would fetch from database
    const mockQuestions: Question[] = [
      {
        id: '1',
        text: 'Can you explain the difference between synchronous and asynchronous programming?',
        category: 'technical',
        difficulty: 'intermediate',
        tags: ['programming', 'concepts']
      },
      {
        id: '2',
        text: 'Tell me about a time when you had to work with a difficult team member.',
        category: 'behavioral',
        difficulty: 'intermediate',
        tags: ['teamwork', 'communication']
      },
      {
        id: '3',
        text: 'How would you design a URL shortening service?',
        category: 'problem-solving',
        difficulty: 'advanced',
        tags: ['system-design', 'architecture']
      }
    ];

    if (currentQuestionIndex < mockQuestions.length) {
      setCurrentQuestion(mockQuestions[currentQuestionIndex]);
    } else {
      // Interview completed
      await completeInterview();
    }
  };

  const handlePauseResume = async () => {
    try {
      const newStatus = isPaused ? 'active' : 'paused';
      const { error } = await supabase
        .from('interviews')
        .update({ status: newStatus })
        .eq('id', interviewId);

      if (error) throw error;

      setIsPaused(!isPaused);
      setInterview(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(isPaused ? 'Interview resumed' : 'Interview paused');
    } catch (err) {
      console.error('Error updating interview status:', err);
      toast.error('Failed to update interview status');
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setResponseText('');
      toast.success('Question skipped');
    } else {
      completeInterview();
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Please provide a response');
      return;
    }

    try {
      // Save response to database
      const { error } = await supabase
        .from('responses')
        .insert({
          interview_id: interviewId,
          question_id: currentQuestion?.id,
          response_text: responseText,
          response_type: 'text',
          duration: 0, // Would calculate actual time spent
        });

      if (error) throw error;

      toast.success('Response submitted!');
      
      // Move to next question
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setResponseText('');
      } else {
        await completeInterview();
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      toast.error('Failed to submit response');
    }
  };

  const completeInterview = async () => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', interviewId);

      if (error) throw error;

      toast.success('Interview completed!');
      router.push(`/interview/${interviewId}/results`);
    } catch (err) {
      console.error('Error completing interview:', err);
      toast.error('Failed to complete interview');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'Interview not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Interview
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">AI Interviewer</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <InterviewTimer 
                timeRemaining={timeRemaining} 
                setTimeRemaining={setTimeRemaining}
                onTimeUp={completeInterview}
                isPaused={isPaused}
              />
              <Badge variant={interview.status === 'active' ? 'success' : 'secondary'}>
                {interview.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            current={currentQuestionIndex + 1} 
            total={totalQuestions} 
          />
        </div>

        {/* Interview Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Question and Response Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Question */}
            {currentQuestion && (
              <QuestionDisplay 
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
              />
            )}

            {/* Response Input */}
            <ResponseInput
              value={responseText}
              onChange={setResponseText}
              onSubmit={handleSubmitResponse}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              disabled={isPaused}
            />
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Controls</CardTitle>
                <CardDescription>
                  Manage your interview session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handlePauseResume}
                  variant={isPaused ? 'default' : 'outline'}
                  className="w-full"
                  disabled={interview.status === 'completed'}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSkipQuestion}
                  variant="outline"
                  className="w-full"
                  disabled={isPaused || interview.status === 'completed'}
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Question
                </Button>

                <Button
                  onClick={completeInterview}
                  variant="outline"
                  className="w-full"
                  disabled={interview.status === 'completed'}
                >
                  <Square className="w-4 h-4 mr-2" />
                  End Interview
                </Button>
              </CardContent>
            </Card>

            {/* Interview Info */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Job Role</Label>
                  <p className="text-sm font-medium mt-1">{interview.job_role}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Experience Level</Label>
                  <p className="text-sm font-medium mt-1">{interview.experience_level}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Focus Areas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interview.focus_areas.map((area) => (
                      <Badge key={area} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
