// Speech Recognition and Synthesis Management for Live Interviews

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

interface SpeechRecognitionError {
  error: string;
  message: string;
}

interface SpeechSynthesisOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Check browser support for speech features
export const checkSpeechSupport = () => {
  const recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const synthesis = window.speechSynthesis;
  
  if (!recognition) {
    return {
      recognition: false,
      synthesis: synthesis !== undefined,
      message: 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
    };
  }
  
  if (!synthesis) {
    return {
      recognition: recognition !== undefined,
      synthesis: false,
      message: 'Speech synthesis is not supported in this browser.'
    };
  }
  
  return {
    recognition: true,
    synthesis: true,
    message: 'Speech features are supported.'
  };
};

// Request microphone permission
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

// Speech Recognition Manager
export class SpeechRecognitionManager {
  private recognition: any;
  private isListening: boolean = false;
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: SpeechRecognitionError) => void;
  private onEndCallback?: () => void;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition is not supported');
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition() {
    // Configure recognition settings
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript: finalTranscript || interimTranscript,
          isFinal: finalTranscript.length > 0,
          confidence: event.results[event.results.length - 1]?.[0]?.confidence
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      if (this.onErrorCallback) {
        this.onErrorCallback({
          error: event.error,
          message: event.message || 'Speech recognition error occurred'
        });
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.recognition.onnomatch = () => {
      // No speech detected
    };
  }

  onResult(callback: (result: SpeechRecognitionResult) => void) {
    this.onResultCallback = callback;
  }

  onError(callback: (error: SpeechRecognitionError) => void) {
    this.onErrorCallback = callback;
  }

  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }

  startListening() {
    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  stopListening() {
    if (!this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}

// Speech Synthesis Manager
export class SpeechSynthesisManager {
  private speaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: string) => void;
  private bestVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initializeBestVoice();
  }

  private initializeBestVoice() {
    // Wait for voices to load
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      this.selectBestVoice(voices);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  private selectBestVoice(voices: SpeechSynthesisVoice[]) {
    // Prefer female voices that sound more natural and less robotic
    const preferredVoices = [
      // 'Samantha',                    // macOS - Natural female voice
      'Victoria',                    // macOS - Soft female voice
      'Google UK English Female',    // Chrome - British female
      'Microsoft Zira - English (United States)', // Windows - Female
      'Karen',                       // macOS - Another female option
      'Tessa',                       // macOS - Australian female
      'Google US English Female',    // Chrome - US female
      'Google Australian English Female', // Chrome - Australian female
      'Microsoft David - English (United States)', // Windows - Male fallback
      'Alex'                         // macOS - Male fallback
    ];
    
    // First try to find a preferred voice
    for (const voiceName of preferredVoices) {
      const voice = voices.find(v => v.name === voiceName);
      if (voice) {
        this.bestVoice = voice;
        return;
      }
    }
    
    // If no preferred voice found, try to find any female voice
    const femaleVoice = voices.find(voice => 
      voice.name !== 'default' && 
      voice.lang.startsWith('en') &&
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('samantha') ||
       voice.name.toLowerCase().includes('victoria') ||
       voice.name.toLowerCase().includes('karen') ||
       voice.name.toLowerCase().includes('tessa'))
    );
    
    if (femaleVoice) {
      this.bestVoice = femaleVoice;
    } else {
      // Fallback to any non-default voice
      const naturalVoice = voices.find(voice => 
        voice.name !== 'default' && 
        voice.lang.startsWith('en')
      );
      
      if (naturalVoice) {
        this.bestVoice = naturalVoice;
      } else if (voices.length > 0) {
        this.bestVoice = voices[0];
      }
    }
  }



  onStart(callback: () => void) {
    this.onStartCallback = callback;
  }

  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  speak(text: string, options: SpeechSynthesisOptions = {}) {
    if (this.speaking) {
      this.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default options
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = options.volume || 0.85;
    utterance.lang = 'en-US';

    // Use the best voice we selected during initialization
    if (this.bestVoice) {
      utterance.voice = this.bestVoice;
    } else {
      // Fallback to voice selection if best voice not set
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }
    }

    // Set up event handlers
    utterance.onstart = () => {
      this.speaking = true;
      this.currentUtterance = utterance;
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };

    utterance.onend = () => {
      this.speaking = false;
      this.currentUtterance = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    utterance.onerror = (event) => {
      this.speaking = false;
      this.currentUtterance = null;
      console.error('Speech synthesis error:', event);
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    // Speak the text with error handling
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      this.speaking = false;
      this.currentUtterance = null;
      if (this.onErrorCallback) {
        this.onErrorCallback('speech-synthesis-error');
      }
    }
  }

  stop() {
    if (this.speaking) {
      window.speechSynthesis.cancel();
      this.speaking = false;
      this.currentUtterance = null;
    }
  }

  pause() {
    if (this.speaking) {
      window.speechSynthesis.pause();
    }
  }

  resume() {
    if (this.speaking) {
      window.speechSynthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.speaking;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis.getVoices();
  }
}

// Audio Level Monitoring
export class AudioLevelMonitor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isMonitoring: boolean = false;
  private levelChangeCallback?: (level: number) => void;

  async startMonitoring(stream: MediaStream) {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength) as Uint8Array;
      
      this.microphone.connect(this.analyser);
      this.isMonitoring = true;
      
      this.monitorLevel();
    } catch (error) {
      console.error('Error starting audio level monitoring:', error);
    }
  }

  private monitorLevel() {
    if (!this.isMonitoring || !this.analyser || !this.dataArray) return;

          (this.analyser as any).getByteFrequencyData(this.dataArray);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;
    
    if (this.levelChangeCallback) {
      this.levelChangeCallback(average);
    }

    requestAnimationFrame(() => this.monitorLevel());
  }

  onLevelChange(callback: (level: number) => void) {
    this.levelChangeCallback = callback;
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Interview-specific speech utilities
export const interviewSpeechUtils = {
  // Generate a natural-sounding interview question
  formatQuestionForSpeech: (question: string): string => {
    // Add natural pauses and emphasis for better speech synthesis
    let formatted = question
      .replace(/\?/g, '... ')
      .replace(/\./g, '. ')
      .replace(/,/g, ', ')
      .trim();
    
    // Add pauses after greetings and introductions
    formatted = formatted.replace(/(Hello|Hi|Good day|Welcome)/g, '$1... ');
    
    // Add pauses before important parts
    formatted = formatted.replace(/(Could you|Can you|Tell me|Please)/g, '... $1');
    
    // Add natural breaks in longer sentences
    formatted = formatted.replace(/(and|but|however|therefore)/g, '... $1');
    
    return formatted;
  },

  // Format user response for analysis
  cleanUserResponse: (response: string): string => {
    return response
      .toLowerCase()
      .replace(/um|uh|er|ah/g, '') // Remove filler words
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  },

  // Check if response is complete
  isResponseComplete: (response: string): boolean => {
    const cleanResponse = response.trim();
    
    // Check for natural speech patterns that indicate completion
    const hasCompleteThought = cleanResponse.length > 30 && (
      cleanResponse.endsWith('.') ||
      cleanResponse.endsWith('?') ||
      cleanResponse.endsWith('!') ||
      cleanResponse.length > 100 ||
      cleanResponse.includes('because') ||
      cleanResponse.includes('example') ||
      cleanResponse.includes('experience') ||
      cleanResponse.includes('project') ||
      cleanResponse.includes('worked') ||
      cleanResponse.includes('developed') ||
      cleanResponse.includes('learned') ||
      cleanResponse.includes('challenge') ||
      cleanResponse.includes('team') ||
      cleanResponse.includes('result') ||
      cleanResponse.includes('outcome')
    );
    
    // Check for interview-specific completion indicators
    const hasInterviewContent = cleanResponse.includes('i am') || 
                               cleanResponse.includes('i have') ||
                               cleanResponse.includes('i worked') ||
                               cleanResponse.includes('i developed') ||
                               cleanResponse.includes('i learned') ||
                               cleanResponse.includes('my experience') ||
                               cleanResponse.includes('my background');
    
    return hasCompleteThought && hasInterviewContent;
  },

  // Get speech synthesis options for different interview contexts
  getSpeechOptions: (context: 'question' | 'feedback' | 'instruction' = 'question') => {
    switch (context) {
      case 'question':
        return {
          rate: 0.9,   // Natural speaking pace
          pitch: 1.1,  // Slightly higher pitch for female voice
          volume: 0.85 // Softer volume for more natural sound
        };
      case 'feedback':
        return {
          rate: 0.85,  // Slightly slower for feedback
          pitch: 1.05, // Natural pitch
          volume: 0.8  // Softer for feedback
        };
      case 'instruction':
        return {
          rate: 0.9,   // Clear but natural pace
          pitch: 1.1,  // Slightly higher for clarity
          volume: 0.85
        };
      default:
        return {
          rate: 0.9,   // Default to natural speech rate
          pitch: 1.1,  // Slightly higher pitch for female voice
          volume: 0.85 // Softer volume
        };
    }
  }
};

// Audio Recording Manager for capturing user speech
export class AudioRecordingManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording: boolean = false;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.audioChunks = [];
      this.isRecording = true;
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Not recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      
      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
    });
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}
