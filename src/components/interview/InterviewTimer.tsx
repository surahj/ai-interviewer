'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Pause } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface InterviewTimerProps {
  timeRemaining: number;
  setTimeRemaining: (time: number | ((prev: number) => number)) => void;
  onTimeUp: () => void;
  isPaused: boolean;
}

export default function InterviewTimer({ 
  timeRemaining, 
  setTimeRemaining, 
  onTimeUp, 
  isPaused 
}: InterviewTimerProps) {
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    if (timeRemaining <= 300) { // 5 minutes warning
      setIsWarning(true);
    }

    if (!isPaused) {
      const timer = setInterval(() => {
        setTimeRemaining((prev: number) => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isPaused, setTimeRemaining, onTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`w-auto ${isWarning ? 'border-warning-500 bg-warning-50' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          {isPaused ? (
            <Pause className="w-4 h-4 text-gray-500" />
          ) : (
            <Clock className={`w-4 h-4 ${isWarning ? 'text-warning-600' : 'text-gray-500'}`} />
          )}
          <span 
            className={`text-lg font-mono font-bold ${
              isWarning ? 'text-warning-600' : 'text-gray-900'
            }`}
            data-testid="timer-display"
          >
            {formatTime(timeRemaining)}
          </span>
          {isPaused && (
            <Badge variant="secondary" className="text-xs">
              Paused
            </Badge>
          )}
          {isWarning && !isPaused && (
            <Badge variant="warning" className="text-xs">
              Time Running Out
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
