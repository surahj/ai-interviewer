'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Target, Zap } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'problem-solving';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionDisplay({ 
  question, 
  questionNumber, 
  totalQuestions 
}: QuestionDisplayProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <Zap className="w-4 h-4" />;
      case 'behavioral':
        return <HelpCircle className="w-4 h-4" />;
      case 'problem-solving':
        return <Target className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'behavioral':
        return 'bg-green-100 text-green-800';
      case 'problem-solving':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full" data-testid="current-question">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">
              Question {questionNumber} of {totalQuestions}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className={`${getCategoryColor(question.category)}`}
            >
              <span className="mr-1">
                {getCategoryIcon(question.category)}
              </span>
              {question.category}
            </Badge>
            <Badge 
              variant="secondary" 
              className={`${getDifficultyColor(question.difficulty)}`}
            >
              {question.difficulty}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Read the question carefully and provide a comprehensive response
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-lg text-gray-900 leading-relaxed" data-testid="question-text">
              {question.text}
            </p>
          </div>
          
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Tags:</span>
              {question.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
