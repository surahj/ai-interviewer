'use client';

import { Card, CardContent } from '@/components/ui/card';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Interview Progress
            </span>
            <span className="text-sm text-gray-500">
              {current} of {total} questions
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${percentage}%` }}
              data-testid="progress-bar"
            ></div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            {Math.round(percentage)}% complete
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
