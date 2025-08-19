// OpenAI Realtime Conversation Manager
// Based on OpenAI's official Realtime API documentation

interface RealtimeSession {
  id: string;
  client_secret: {
    value: string;
    expires_at: number;
  };
  expires_at: number;
  modalities: string[];
  voice: string;
  output_audio_format: string;
  input_audio_format: string;
}

interface ConversationConfig {
  session: RealtimeSession;
  onTranscriptReceived?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onConnectionStateChange?: (state: string) => void;
  onAudioReceived?: (audioBlob: Blob) => void;
  onUserSpeech?: (transcript: string, isFinal: boolean) => void;
}

export class RealtimeConversationManager {
  private session: RealtimeSession | null = null;
  private isConnected: boolean = false;
  private isSpeaking: boolean = false;
  private isListening: boolean = false;
  
  // WebRTC components
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  
  // Speech recognition
  private recognition: any = null;
  
  // Callbacks
  private onTranscriptReceived?: (transcript: string, isFinal: boolean) => void;
  private onError?: (error: string) => void;
  private onConnectionStateChange?: (state: string) => void;
  private onAudioReceived?: (audioBlob: Blob) => void;
  private onUserSpeech?: (transcript: string, isFinal: boolean) => void;

  constructor(config: ConversationConfig) {
    this.session = config.session;
    this.onTranscriptReceived = config.onTranscriptReceived;
    this.onError = config.onError;
    this.onConnectionStateChange = config.onConnectionStateChange;
    this.onAudioReceived = config.onAudioReceived;
    this.onUserSpeech = config.onUserSpeech;
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to OpenAI Realtime API...');
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('This application must run in a browser environment');
      }
      
      // Check if required APIs are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API is not supported in this browser');
      }
      
      if (!window.RTCPeerConnection) {
        throw new Error('WebRTC is not supported in this browser');
      }
      
      if (!this.session) {
        throw new Error('No session available');
      }

      // Check if session is expired
      if (this.session.expires_at && this.session.expires_at < Date.now() / 1000) {
        throw new Error('Session has expired');
      }

      // Get user media for audio input with proper error handling
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1
          },
          video: false
        });
        console.log('Audio stream obtained successfully with echo cancellation');
      } catch (mediaError) {
        console.error('Microphone access error:', mediaError);
        
        // Try with simpler audio constraints
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          });
          console.log('Audio stream obtained with fallback constraints');
        } catch (fallbackError) {
          console.error('Fallback microphone access failed:', fallbackError);
          
          // Check if it's a permission issue
          if (mediaError instanceof DOMException) {
            if (mediaError.name === 'NotAllowedError') {
              throw new Error('Microphone permission denied. Please allow microphone access and try again.');
            } else if (mediaError.name === 'NotFoundError') {
              throw new Error('No microphone found. Please connect a microphone and try again.');
            } else if (mediaError.name === 'NotReadableError') {
              throw new Error('Microphone is already in use by another application. Please close other applications using the microphone.');
            }
          }
          
          throw new Error(`Microphone access failed: ${mediaError instanceof Error ? mediaError.message : 'Unknown error'}`);
        }
      }

      // Create peer connection with OpenAI's STUN servers
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local audio track
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });

      // Handle incoming audio from OpenAI Realtime API
      this.peerConnection.ontrack = (event) => {
        console.log('Received OpenAI Realtime audio stream');
        this.remoteStream = event.streams[0];
        this.playAIAudio();
      };

      // Handle connection state changes with more detailed logging
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || 'unknown';
        console.log('WebRTC connection state changed:', state);
        
        if (state === 'connected') {
          console.log('WebRTC connection is now connected - AI should start speaking');
          this.isConnected = true;
          this.onConnectionStateChange?.(state);
        } else if (state === 'failed') {
          console.error('WebRTC connection failed');
          this.onError?.('WebRTC connection failed');
        } else if (state === 'disconnected') {
          console.log('WebRTC connection disconnected');
          this.isConnected = false;
          this.onConnectionStateChange?.(state);
        }
      };

      // Set up data channel for sending and receiving events
      const dataChannel = this.peerConnection.createDataChannel("oai-events");
      console.log('Data channel created:', dataChannel.label);
      
      dataChannel.onopen = () => {
        console.log('Data channel opened');
      };
      
      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('OpenAI Realtime data:', data);
          
          // Handle different types of messages from OpenAI
          if (data.type === 'transcript') {
            this.onTranscriptReceived?.(data.text, data.is_final);
          } else if (data.type === 'error') {
            this.onError?.(data.message);
          } else if (data.type === 'response_completed') {
            console.log('AI response completed');
          } else if (data.type === 'response_started') {
            console.log('AI response started');
          }
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      };
      
      dataChannel.onerror = (error) => {
        console.error('Data channel error:', error);
      };
      
      dataChannel.onclose = () => {
        console.log('Data channel closed');
      };

      // Connection state changes are handled above with more detailed logging

      // Handle ICE candidates (not used in current implementation)
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate generated:', event.candidate);
          // ICE candidates are not sent in current implementation
        }
      };

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });

      await this.peerConnection.setLocalDescription(offer);

      // Connect to OpenAI Realtime API using the session
      await this.connectToOpenAI(offer);
      
      // Mark as connected after successful WebRTC connection
      this.isConnected = true;
      this.onConnectionStateChange?.('connected');
      console.log('OpenAI Realtime connection fully established');

    } catch (error) {
      console.error('Connection error:', error);
      this.onError?.(`Connection failed: ${error}`);
      throw error;
    }
  }



  private async connectToOpenAI(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.session) {
      throw new Error('No session available');
    }

    try {
      console.log('Connecting to OpenAI Realtime API with session:', this.session.id);
      
      const sessionId = this.session.id;
      const clientSecret = this.session.client_secret.value;
      
      console.log('WebRTC offer created:', offer);
      console.log('Session ID:', sessionId);
      console.log('Client secret available:', !!clientSecret);
      
      // Use the correct OpenAI Realtime WebRTC connection pattern
      // Based on the official demo: https://github.com/openai/openai-realtime-solar-system
      
      console.log('Establishing WebRTC connection with OpenAI Realtime...');
      
      // Send the SDP offer directly to OpenAI's realtime endpoint
      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${clientSecret}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('OpenAI Realtime SDP exchange failed:', errorText);
        throw new Error(`OpenAI Realtime SDP exchange failed: ${errorText}`);
      }

      // Get the SDP answer from OpenAI
      const answerSdp = await sdpResponse.text();
      console.log('Received SDP answer from OpenAI');

      // Set the remote description (answer) from OpenAI
      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: answerSdp,
      };
      
      await this.peerConnection?.setRemoteDescription(answer);
      console.log('Remote description set successfully');

      console.log('OpenAI Realtime WebRTC connection established successfully');
      
      // Trigger the AI to start the conversation
      this.triggerAIStart();

    } catch (error) {
      console.error('OpenAI connection error:', error);
      throw error;
    }
  }

  private triggerAIStart(): void {
    try {
      console.log('Triggering AI to start conversation...');
      
      // The AI should start speaking automatically once the WebRTC connection is established
      // based on the session instructions. Let's wait a moment for the connection to stabilize.
      setTimeout(() => {
        console.log('Connection established, AI should start speaking automatically...');
        
        // If the AI doesn't start speaking, we can trigger it manually
        // by sending a message through the data channel
        if (this.peerConnection && this.peerConnection.connectionState === 'connected') {
          console.log('WebRTC connection is stable, AI should be speaking...');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error triggering AI start:', error);
    }
  }

  private initializeSpeechRecognition(): void {
    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Store recognition instance for cleanup
      this.recognition = recognition;

      recognition.onresult = (event: any) => {
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

        if (finalTranscript) {
          console.log('User speech (final):', finalTranscript);
          
          // Check if this is likely an echo (AI repeating user's speech)
          if (this.isLikelyEcho(finalTranscript)) {
            console.log('Detected echo, ignoring:', finalTranscript);
            return;
          }
          
          this.onUserSpeech?.(finalTranscript, true);
        } else if (interimTranscript) {
          console.log('User speech (interim):', interimTranscript);
          this.onUserSpeech?.(interimTranscript, false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific error types
        switch (event.error) {
          case 'no-speech':
            // This is normal, don't show error
            break;
          case 'audio-capture':
            this.onError?.('Microphone access denied. Please allow microphone access.');
            break;
          case 'not-allowed':
            this.onError?.('Microphone access denied. Please allow microphone access.');
            break;
          case 'network':
            this.onError?.('Network error in speech recognition.');
            break;
          default:
            this.onError?.(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, restarting...');
        // Restart recognition if still connected
        if (this.isConnected) {
          setTimeout(() => {
            try {
              recognition.start();
              console.log('Speech recognition restarted');
            } catch (error) {
              console.log('Speech recognition restart failed, will retry:', error);
              // Try again after a longer delay
              setTimeout(() => {
                try {
                  recognition.start();
                  console.log('Speech recognition restarted after delay');
                } catch (retryError) {
                  console.error('Speech recognition restart failed permanently:', retryError);
                  this.onError?.('Speech recognition failed to restart');
                }
              }, 1000);
            }
          }, 100);
        }
      };

      recognition.onstart = () => {
        console.log('Speech recognition started');
        this.isListening = true;
      };

      // Start recognition
      recognition.start();
      console.log('Speech recognition initialized and started');

    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      this.onError?.(`Speech recognition failed: ${error}`);
    }
  }



  private fallbackToBrowserSpeech(): void {
    try {
      console.log('Initializing browser-based speech-to-speech fallback');
      
      // Initialize speech recognition for user input
      this.initializeSpeechRecognition();
      
      // Initialize speech synthesis for AI responses
      this.initializeSpeechSynthesis();
      
      // Mark as connected
      this.isConnected = true;
      this.onConnectionStateChange?.('connected');
      console.log('Connected to browser-based speech-to-speech system');
      
      // Start the conversation with AI greeting
      this.speakAIResponse('Hello! I\'m your AI interviewer. Let\'s begin the interview. Please tell me about your experience.');
      
    } catch (error) {
      console.error('Fallback initialization error:', error);
      this.onError?.(`Fallback initialization failed: ${error}`);
    }
  }

  private initializeSpeechSynthesis(): void {
    try {
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported');
      }

      console.log('Speech synthesis initialized');
    } catch (error) {
      console.error('Error initializing speech synthesis:', error);
      this.onError?.(`Speech synthesis failed: ${error}`);
    }
  }

  public speakAIResponse(text: string): void {
    try {
      if (!window.speechSynthesis) {
        console.error('Speech synthesis not available');
        return;
      }

      // Stop any current speech
      window.speechSynthesis.cancel();

      // Pause speech recognition while AI is speaking to prevent echo
      if (this.recognition) {
        console.log('Pausing speech recognition while AI speaks');
        this.recognition.stop();
      }

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Function to set voice and start speaking
      const startSpeaking = () => {
        // Set voice (prefer a natural-sounding voice)
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => v.name));
        
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Natural') || 
          voice.name.includes('Premium') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Alex')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('Using voice:', preferredVoice.name);
        } else if (voices.length > 0) {
          utterance.voice = voices[0];
          console.log('Using default voice:', voices[0].name);
        }

        // Handle speech events
        utterance.onstart = () => {
          console.log('AI speaking:', text);
          this.isSpeaking = true;
          this.onTranscriptReceived?.(text, true);
        };

        utterance.onend = () => {
          console.log('AI finished speaking');
          this.isSpeaking = false;
          
          // Resume speech recognition after AI finishes speaking
          if (this.recognition && this.isConnected) {
            setTimeout(() => {
              try {
                console.log('Resuming speech recognition after AI finished speaking');
                this.recognition.start();
              } catch (error) {
                console.error('Failed to resume speech recognition:', error);
              }
            }, 500); // Small delay to prevent immediate pickup
          }
        };

        utterance.onerror = (event) => {
          console.error('AI speech error:', event);
          this.isSpeaking = false;
          
          // Resume speech recognition on error
          if (this.recognition && this.isConnected) {
            setTimeout(() => {
              try {
                this.recognition.start();
              } catch (error) {
                console.error('Failed to resume speech recognition after error:', error);
              }
            }, 500);
          }
          
          this.onError?.('AI speech synthesis error');
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
      };

      // Check if voices are loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        startSpeaking();
      } else {
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          console.log('Voices loaded, starting speech');
          startSpeaking();
        };
      }

    } catch (error) {
      console.error('Speech synthesis error:', error);
      this.onError?.(`Speech synthesis failed: ${error}`);
    }
  }

  private playAIAudio(): void {
    if (!this.remoteStream) return;

    try {
      // Create audio element for AI audio
      this.audioElement = document.createElement('audio');
      this.audioElement.srcObject = this.remoteStream;
      this.audioElement.autoplay = true;
      this.audioElement.volume = 0.8;
      
      // Handle audio events
      this.audioElement.onplay = () => {
        console.log('AI audio started');
        this.isSpeaking = true;
      };

      this.audioElement.onended = () => {
        console.log('AI audio ended');
        this.isSpeaking = false;
      };

      this.audioElement.onerror = (error) => {
        console.error('AI audio error:', error);
        this.isSpeaking = false;
        this.onError?.('AI audio playback error');
      };

      // Add to document (hidden)
      this.audioElement.style.display = 'none';
      document.body.appendChild(this.audioElement);

    } catch (error) {
      console.error('Audio setup error:', error);
      this.onError?.(`Audio setup failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting from speech-to-speech system...');
    
    try {
      // Stop speech recognition
      if (this.recognition) {
        this.recognition.stop();
        this.recognition = null;
      }

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Stop speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Remove audio element
      if (this.audioElement) {
        this.audioElement.remove();
        this.audioElement = null;
      }

      this.isConnected = false;
      this.isSpeaking = false;
      this.isListening = false;
      this.onConnectionStateChange?.('disconnected');
      
      console.log('Disconnected from speech-to-speech system');

    } catch (error) {
      console.error('Disconnect error:', error);
      this.onError?.(`Disconnect failed: ${error}`);
    }
  }

  isConnectedToOpenAI(): boolean {
    return this.isConnected;
  }

  getConnectionState(): string {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  // Method to mute/unmute local audio
  setMuted(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  // Check if speech is likely an echo (AI repeating user's speech)
  private isLikelyEcho(transcript: string): boolean {
    const lowerTranscript = transcript.toLowerCase();
    
    // Common echo patterns
    const echoPatterns = [
      'hello i\'m your ai interviewer',
      'let\'s begin the interview',
      'please tell me about your experience',
      'it\'s great to meet you',
      'as a mid-level software engineer',
      'could you please share',
      'that\'s great',
      'could you please elaborate',
      'specifically i\'m interested',
      'what were the technical difficulties',
      'how did your role',
      'contributed to the solution',
      'that\'s a great question',
      'could you please share a specific instance',
      'problem-solving skills',
      'technical challenge',
      'how did you approach it',
      'what technologies or methods',
      'contribute to your growth',
      'that\'s a great starting point',
      'could you elaborate more',
      'what was the project about',
      'what role did you play',
      'walk me through the steps',
      'how did you decide',
      'how did overcoming this challenge',
      'that\'s a great overview',
      'thank you',
      'could you dive a bit deeper',
      'why did you choose these',
      'how did this decision impact'
    ];
    
    // Check if transcript contains echo patterns
    for (const pattern of echoPatterns) {
      if (lowerTranscript.includes(pattern)) {
        return true;
      }
    }
    
    // Check for repeated phrases (common in echoes)
    const words = lowerTranscript.split(' ');
    const wordCount = words.length;
    const uniqueWords = new Set(words);
    const uniqueWordCount = uniqueWords.size;
    
    // If there are many repeated words, it might be an echo
    if (wordCount > 5 && uniqueWordCount / wordCount < 0.6) {
      return true;
    }
    
    return false;
  }
}

// Utility function to check if OpenAI Realtime API is supported
export const checkRealtimeSupport = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!(
    window.RTCPeerConnection &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
};

// Utility function to test microphone
export const testMicrophone = async (): Promise<{ success: boolean; error?: string }> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { success: false, error: 'Not in browser environment' };
  }
  
  // Check if media devices API is available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { success: false, error: 'Media devices API not supported' };
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return { success: true };
  } catch (error) {
    console.error('Microphone test failed:', error);
    
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Microphone permission denied' };
      } else if (error.name === 'NotFoundError') {
        return { success: false, error: 'No microphone found' };
      } else if (error.name === 'NotReadableError') {
        return { success: false, error: 'Microphone is already in use' };
      }
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
