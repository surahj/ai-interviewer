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
  
  // Conversation history tracking
  private conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }> = [];
  
  // Raw messages for debugging and fallback conversation building
  private rawMessages: Array<{
    type: string;
    data: any;
    timestamp: Date;
  }> = [];
  
  // WebRTC components
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  
  // OpenAI Realtime specific components
  
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
        this.remoteStream = event.streams[0];
        this.playAIAudio();
      };

      // Handle connection state changes with more detailed logging
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || 'unknown';
        
        if (state === 'connected') {
          this.isConnected = true;
          this.onConnectionStateChange?.(state);
        } else if (state === 'failed') {
          console.error('WebRTC connection failed');
          this.onError?.('WebRTC connection failed');
        } else if (state === 'disconnected') {
          this.isConnected = false;
          this.onConnectionStateChange?.(state);
        }
      };

      // Set up data channel for sending and receiving events
      const dataChannel = this.peerConnection.createDataChannel("oai-events");
      
      dataChannel.onopen = () => {
        // Test sending a message to verify data channel is working
        try {
          const testMessage = { type: 'test', message: 'Data channel test' };
          dataChannel.send(JSON.stringify(testMessage));
        } catch (error) {
          console.error('Failed to send test message:', error);
        }
      };
        
        dataChannel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
          // Store all messages for debugging and conversation building
          this.addToRawMessages(data);
          
          // Handle different types of messages from OpenAI Realtime API
          // Based on OpenAI Realtime documentation
            if (data.type === 'transcript') {
              this.onTranscriptReceived?.(data.text, data.is_final);
            if (data.is_final && data.text && data.text.trim()) {
              this.addToConversationHistory('assistant', data.text);
            }
          } else if (data.type === 'user_speech') {
            this.onUserSpeech?.(data.text, data.is_final);
            if (data.is_final && data.text && data.text.trim()) {
              this.addToConversationHistory('user', data.text);
            }
          } else if (data.type === 'user_speech_started') {
            // User speech started
          } else if (data.type === 'user_speech_ended') {
            // User speech ended
          } else if (data.type === 'response_started') {
            // AI response started
          } else if (data.type === 'response_ended') {
            // AI response ended
          } else if (data.type === 'response_completed') {
            // AI response completed
          } else if (data.type === 'response.audio.done') {
            // AI audio response completed
          } else if (data.type === 'response.audio_transcript.done') {
            if (data.transcript && data.transcript.trim()) {
              this.onTranscriptReceived?.(data.transcript, true);
              this.addToConversationHistory('assistant', data.transcript);
            }
          } else if (data.type === 'error') {
            console.error('OpenAI Realtime error:', data.message);
            this.onError?.(data.message);
          } else if (data.type === 'turn_started') {
            // Turn started
          } else if (data.type === 'turn_ended') {
            // Turn ended
          } else {
            // Unhandled OpenAI Realtime event type
            }
          } catch (error) {
            console.error('Error parsing data channel message:', error);
          }
        };
      
      dataChannel.onerror = (error) => {
        console.error('Data channel error:', error);
      };
      
      dataChannel.onclose = () => {
        // Data channel closed
      };

      // Connection state changes are handled above with more detailed logging

      // Handle ICE candidates (not used in current implementation)
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
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
      const sessionId = this.session.id;
      const clientSecret = this.session.client_secret.value;
      
      // Use the correct OpenAI Realtime WebRTC connection pattern
      // Based on the official demo: https://github.com/openai/openai-realtime-solar-system
      
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

      // Set the remote description (answer) from OpenAI
      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: answerSdp,
      };
      
      await this.peerConnection?.setRemoteDescription(answer);
      
      // Trigger the AI to start the conversation
      this.triggerAIStart();
      
    } catch (error) {
      console.error('OpenAI connection error:', error);
      throw error;
    }
  }

  private triggerAIStart(): void {
    try {
      // The AI should start speaking automatically once the WebRTC connection is established
      // based on the session instructions. Let's wait a moment for the connection to stabilize.
      setTimeout(() => {
        // If the AI doesn't start speaking, we can trigger it manually
        // by sending a message through the data channel
        if (this.peerConnection && this.peerConnection.connectionState === 'connected') {
          // WebRTC connection is stable, AI should be speaking
        }
      }, 2000);

    } catch (error) {
      console.error('Error triggering AI start:', error);
    }
  }

  // OpenAI Realtime handles speech recognition automatically



  // OpenAI Realtime handles all speech processing automatically

  // OpenAI Realtime handles AI speech automatically through WebRTC audio stream

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
        this.isSpeaking = true;
      };

      this.audioElement.onended = () => {
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
    try {
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

      // Remove audio element
      if (this.audioElement) {
        this.audioElement.remove();
        this.audioElement = null;
      }

      this.isConnected = false;
      this.isSpeaking = false;
      this.isListening = false;
      this.onConnectionStateChange?.('disconnected');

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

  // Get the conversation history
  getConversationHistory() {
    return [...this.conversationHistory];
  }

  // Build conversation from raw messages (fallback method)
  buildConversationFromRawMessages() {
    const conversation: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: Date;
    }> = [];

    for (const msg of this.rawMessages) {
      
      if (msg.type === 'transcript' && msg.data.text && msg.data.is_final) {
        conversation.push({
          role: 'assistant',
          content: msg.data.text,
          timestamp: msg.timestamp
        });
      } else if (msg.type === 'response.audio_transcript.done' && msg.data.transcript) {
        conversation.push({
          role: 'assistant',
          content: msg.data.transcript,
          timestamp: msg.timestamp
        });
      } else if (msg.type === 'user_speech' && msg.data.text && msg.data.is_final) {
        conversation.push({
          role: 'user',
          content: msg.data.text,
          timestamp: msg.timestamp
        });
      } else if (msg.type === 'transcript' && msg.data && msg.data.is_final) {
        // Handle case where text might be directly in data
        const text = msg.data.text || msg.data.content || msg.data.transcript;
        if (text && text.trim()) {
          conversation.push({
            role: 'assistant',
            content: text,
            timestamp: msg.timestamp
          });
        }
      } else if (msg.type === 'user_speech' && msg.data && msg.data.is_final) {
        // Handle case where text might be directly in data
        const text = msg.data.text || msg.data.content || msg.data.transcript;
        if (text && text.trim()) {
          conversation.push({
            role: 'user',
            content: text,
            timestamp: msg.timestamp
          });
        }
      } else if (msg.type === 'response_completed' && msg.data.transcript) {
        // Handle completed response transcripts
        conversation.push({
          role: 'assistant',
          content: msg.data.transcript,
          timestamp: msg.timestamp
        });
      } else if (msg.type === 'turn_ended' && msg.data.speaker === 'assistant' && msg.data.transcript) {
        // Handle turn-based transcripts
        conversation.push({
          role: 'assistant',
          content: msg.data.transcript,
          timestamp: msg.timestamp
        });
      } else if (msg.type === 'turn_ended' && msg.data.speaker === 'user' && msg.data.transcript) {
        // Handle user turn transcripts
        conversation.push({
          role: 'user',
          content: msg.data.transcript,
          timestamp: msg.timestamp
        });
      }
    }

    return conversation;
  }

  // Add a message to conversation history
  private addToConversationHistory(role: 'user' | 'assistant', content: string) {
    if (content.trim()) {
      this.conversationHistory.push({
        role,
        content: content.trim(),
        timestamp: new Date()
      });
    }
  }

  // Public method to manually add user speech (for testing)
  addUserSpeech(content: string) {
    this.addToConversationHistory('user', content);
  }

  // Public method to manually add AI speech (for testing)
  addAISpeech(content: string) {
    this.addToConversationHistory('assistant', content);
  }

  // Add raw message for debugging
  private addToRawMessages(data: any) {
    this.rawMessages.push({
      type: data.type || 'unknown',
      data,
      timestamp: new Date()
    });
  }

  // Get raw messages for debugging
  getRawMessages() {
    return [...this.rawMessages];
  }

  // Method to mute/unmute local audio
  setMuted(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  // OpenAI Realtime handles echo cancellation automatically
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
