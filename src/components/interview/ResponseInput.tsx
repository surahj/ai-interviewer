'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Send, 
  Type, 
  Volume2,
  Square
} from 'lucide-react';

interface ResponseInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  disabled?: boolean;
}

export default function ResponseInput({
  value,
  onChange,
  onSubmit,
  isRecording,
  setIsRecording,
  disabled = false
}: ResponseInputProps) {
  const [responseType, setResponseType] = useState<'text' | 'audio'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartRecording = () => {
    // In a real implementation, this would start audio recording
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    // In a real implementation, this would stop audio recording and process the audio
    setIsRecording(false);
    // Mock: set some transcribed text
    onChange('This is a mock transcribed response from audio recording.');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Response</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={responseType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseType('text')}
              disabled={disabled}
            >
              <Type className="w-4 h-4 mr-1" />
              Text
            </Button>
            <Button
              variant={responseType === 'audio' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseType('audio')}
              disabled={disabled}
            >
              <Volume2 className="w-4 h-4 mr-1" />
              Audio
            </Button>
          </div>
        </div>
        <CardDescription>
          {responseType === 'text' 
            ? 'Type your response below' 
            : 'Record your audio response'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {responseType === 'text' ? (
          <div className="space-y-4">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[120px] resize-none"
              disabled={disabled}
              data-testid="text-response-input"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {value.length} characters
              </span>
              <Button
                onClick={handleSubmit}
                disabled={disabled || isSubmitting || !value.trim()}
                data-testid="submit-response-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Response
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              {isRecording ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-medium text-red-600">
                      Recording...
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Speak clearly into your microphone
                  </p>
                  <Button
                    onClick={handleStopRecording}
                    variant="destructive"
                    size="lg"
                    data-testid="stop-recording-button"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Mic className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-lg font-medium">
                    Ready to record your response
                  </p>
                  <p className="text-sm text-gray-600">
                    Click the button below to start recording
                  </p>
                  <Button
                    onClick={handleStartRecording}
                    size="lg"
                    disabled={disabled}
                    data-testid="start-recording-button"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                </div>
              )}
            </div>
            
            {value && (
              <div className="space-y-2">
                <h4 className="font-medium">Transcribed Response:</h4>
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-sm">{value}</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={disabled || isSubmitting}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Response
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {disabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Interview is paused. Resume to continue responding.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
