"use client";

import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Settings,
  Clock,
  Target,
  Star,
  AlertCircle,
  CheckCircle,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Brain,
  MessageCircle,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  RealtimeConversationManager,
  checkRealtimeSupport,
} from "@/lib/realtime-conversation";
import {
  SpeechRecognitionManager,
  SpeechSynthesisManager,
  AudioRecordingManager,
  checkSpeechSupport,
  requestMicrophonePermission,
  interviewSpeechUtils,
} from "@/lib/speech";
import toast from "react-hot-toast";

interface InterviewState {
  isConnected: boolean;
  isRecording: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  currentQuestion: string;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  score: number;
  feedback: string;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  userTranscript: string;
  aiResponse: string;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  connectionState: string;
  realtimeConnected: boolean;
  usingFallback: boolean;
}

export default function LiveInterviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interview state
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isConnected: false,
    isRecording: false,
    isMuted: false,
    isVideoOn: true,
    currentQuestion: "",
    questionNumber: 1,
    totalQuestions: 12,
    timeRemaining: 900, // 15 minutes in seconds
    score: 0,
    feedback: "",
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    userTranscript: "",
    aiResponse: "",
    conversationHistory: [],
    connectionState: "disconnected",
    realtimeConnected: false,
    usingFallback: false,
  });

  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionConfig, setSessionConfig] = useState<any>(null);
  const [realtimeSession, setRealtimeSession] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  // Refs to prevent duplicate API calls
  const initializationRef = useRef(false);
  const sessionCreationRef = useRef(false);
  const firstQuestionGeneratedRef = useRef(false);

  // Refs for media streams
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Realtime manager
  const realtimeManagerRef = useRef<RealtimeConversationManager | null>(null);

  // Speech managers (for fallback)
  const speechRecognitionRef = useRef<SpeechRecognitionManager | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisManager | null>(null);
  const audioRecordingRef = useRef<AudioRecordingManager | null>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to track current state for callbacks
  const currentStateRef = useRef<InterviewState | null>(null);

  // Update ref whenever state changes
  useEffect(() => {
    currentStateRef.current = interviewState;
  }, [interviewState]);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.push("/login?redirectTo=/interview/live");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized || initializationRef.current) return;

    initializationRef.current = true;

    // Initialize everything in sequence
    const initializeEverything = async () => {
      try {
        // Initialize interview session first
        await initializeInterviewSession();

        // Try to initialize realtime connection, fallback to speech if needed
        await initializeConnection();

        // Initialize media devices
        await initializeMediaDevices();

        // Mark as initialized
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing interview:", error);
        toast.error("Failed to initialize interview session");
        // Reset the ref on error so user can retry
        initializationRef.current = false;
      }
    };

    initializeEverything();
  }, [isInitialized]); // Add isInitialized as dependency

  // Separate effect for timer
  useEffect(() => {
    if (!isInitialized) return;

    const timer = setInterval(() => {
      setInterviewState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isInitialized]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup realtime connection
      if (realtimeManagerRef.current) {
        realtimeManagerRef.current.disconnect();
      }

      // Cleanup speech systems
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stopListening();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.stop();
      }
      // Cleanup timeout
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }

      // Reset refs
      initializationRef.current = false;
      sessionCreationRef.current = false;
      firstQuestionGeneratedRef.current = false;
    };
  }, []);

  const initializeInterviewSession = async () => {
    // Prevent duplicate session creation
    if (sessionCreationRef.current) {
      return;
    }

    sessionCreationRef.current = true;

    try {
      // Get interview configuration from sessionStorage
      const storedConfig = sessionStorage.getItem("interviewConfig");
      const interviewConfig = storedConfig
        ? JSON.parse(storedConfig)
        : {
            role: "software-engineer",
            level: "mid-level",
            type: "mixed",
            duration: "15",
            customRequirements: "",
          };

      // Create interview session
      const response = await fetch("/api/interview/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interviewConfig),
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSessionId(sessionData.sessionId);
        setSessionConfig(sessionData.interviewConfig);
        setRealtimeSession(sessionData.realtimeSession);
        setInterviewState((prev) => ({
          ...prev,
          totalQuestions: sessionData.interviewConfig.totalQuestions,
          timeRemaining: sessionData.interviewConfig.duration * 60,
        }));
        return sessionData;
      } else {
        const errorText = await response.text();
        console.error("Failed to create interview session:", errorText);
        toast.error("Failed to initialize interview session");
        throw new Error("Failed to create interview session");
      }
    } catch (error) {
      console.error("Error creating interview session:", error);
      toast.error("Failed to create interview session");
      // Reset the ref on error so user can retry
      sessionCreationRef.current = false;
      throw error;
    }
  };

  const initializeConnection = async () => {
    // Check if realtime session is available
    if (realtimeSession && checkRealtimeSupport()) {
      try {
        await initializeRealtimeConnection();
      } catch (error) {
        console.error(
          "Realtime connection failed, falling back to speech:",
          error
        );
        await initializeSpeechFallback();
      }
    } else {
      await initializeSpeechFallback();
    }
  };

  const initializeRealtimeConnection = async () => {
    try {
      if (!realtimeSession) {
        throw new Error("No realtime session available");
      }

      // Create realtime manager
      realtimeManagerRef.current = new RealtimeConversationManager({
        session: realtimeSession,
        onAudioReceived: (audioBlob: Blob) => {
          // Audio received from AI
        },
        onTranscriptReceived: (transcript: string, isFinal: boolean) => {
          if (isFinal && transcript.trim()) {
            setInterviewState((prev) => ({
              ...prev,
              conversationHistory: [
                ...prev.conversationHistory,
                {
                  role: "assistant",
                  content: transcript,
                  timestamp: new Date(),
                },
              ],
              aiResponse: transcript,
              isSpeaking: false,
            }));
          }
        },
        onError: (error: string) => {
          console.error("Realtime error:", error);
          // toast.error(`Connection error: ${error}`);
          setInterviewState((prev) => ({
            ...prev,
            realtimeConnected: false,
            connectionState: "failed",
          }));
        },
        onConnectionStateChange: (state: string) => {
          setInterviewState((prev) => ({
            ...prev,
            connectionState: state,
            realtimeConnected: state === "connected",
          }));
        },
      });

      // Connect to OpenAI Realtime
      if (realtimeManagerRef.current) {
        await realtimeManagerRef.current.connect();
      }

      setInterviewState((prev) => ({
        ...prev,
        realtimeConnected: true,
        connectionState: "connected",
        usingFallback: false,
      }));
    } catch (error) {
      console.error("Error initializing realtime connection:", error);
      toast.error("Failed to establish realtime connection, using fallback");
      await initializeSpeechFallback();
    }
  };

  const initializeSpeechFallback = async () => {
    try {
      // Check speech support
      const speechSupport = checkSpeechSupport();
      if (!speechSupport.recognition || !speechSupport.synthesis) {
        toast.error(speechSupport.message);
        return;
      }

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        toast.error("Microphone permission is required for voice interaction");
        return;
      }

      // Initialize speech recognition
      speechRecognitionRef.current = new SpeechRecognitionManager();
      speechRecognitionRef.current.onResult((result) => {
        setInterviewState((prev) => ({
          ...prev,
          userTranscript: result.transcript,
          isListening: !result.isFinal,
        }));

        // Clear any existing timeout
        if (listeningTimeoutRef.current) {
          clearTimeout(listeningTimeoutRef.current);
        }

        // Set a new timeout for 3 seconds of silence
        if (result.transcript.trim()) {
          listeningTimeoutRef.current = setTimeout(() => {
            if (speechRecognitionRef.current && interviewState.isListening) {
              speechRecognitionRef.current.stopListening();
              setInterviewState((prev) => ({ ...prev, isListening: false }));
              handleUserResponse(result.transcript);
            }
          }, 3000);
        }

        if (result.isFinal && result.transcript.trim()) {
          // Clear timeout since we have a final result
          if (listeningTimeoutRef.current) {
            clearTimeout(listeningTimeoutRef.current);
          }
          handleUserResponse(result.transcript);
        }
      });

      speechRecognitionRef.current.onError((error) => {
        console.error("Speech recognition error:", error);
        toast.error("Speech recognition error: " + error.error);
      });

      // Initialize speech synthesis
      speechSynthesisRef.current = new SpeechSynthesisManager();
      speechSynthesisRef.current.onStart(() => {
        setInterviewState((prev) => ({ ...prev, isSpeaking: true }));
        // Stop listening when AI starts speaking
        if (speechRecognitionRef.current && interviewState.isListening) {
          speechRecognitionRef.current.stopListening();
          setInterviewState((prev) => ({ ...prev, isListening: false }));
        }
      });

      speechSynthesisRef.current.onEnd(() => {
        setInterviewState((prev) => ({ ...prev, isSpeaking: false }));
        // Resume listening after AI finishes speaking
        if (speechRecognitionRef.current && !interviewState.isListening) {
          setTimeout(() => {
            speechRecognitionRef.current?.startListening();
            setInterviewState((prev) => ({ ...prev, isListening: true }));
          }, 1000); // Wait 1 second before resuming
        }
      });

      // Generate and speak first question
      await generateAndSpeakFirstQuestion();

      setInterviewState((prev) => ({
        ...prev,
        usingFallback: true,
        connectionState: "connected",
      }));
    } catch (error) {
      console.error("Error initializing speech fallback:", error);
      toast.error("Failed to initialize voice features");
    }
  };

  const generateAndSpeakFirstQuestion = async () => {
    if (!speechSynthesisRef.current) return;

    // Prevent duplicate question generation
    if (firstQuestionGeneratedRef.current) {
      return;
    }

    firstQuestionGeneratedRef.current = true;

    try {
      // Use session config if available, otherwise fallback
      const config = sessionConfig || {
        role: "software-engineer",
        level: "mid-level",
        type: "mixed",
        focusArea: "general",
        customRequirements: "",
      };

      // Call API to generate first question
      const response = await fetch("/api/interview/generate-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: config,
          isFirstQuestion: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(
          `Failed to generate question: ${response.status} ${errorText}`
        );
      }

      const questionResponse = await response.json();

      setInterviewState((prev) => ({
        ...prev,
        currentQuestion: questionResponse.question,
        aiResponse: questionResponse.question,
      }));

      // Format and speak the question
      const formattedQuestion = interviewSpeechUtils.formatQuestionForSpeech(
        questionResponse.question
      );
      const speechOptions = interviewSpeechUtils.getSpeechOptions("question");

      // Add error handling for speech synthesis
      try {
        speechSynthesisRef.current.speak(formattedQuestion, speechOptions);
      } catch (speechError) {
        console.error("Speech synthesis error:", speechError);
        // Continue without speech if there's an error
      }
    } catch (error) {
      console.error("Error generating first question:", error);
      toast.error("Failed to generate AI question. Using fallback.");

      // Reset the ref on error so user can retry
      firstQuestionGeneratedRef.current = false;

      // Fallback question
      const fallbackQuestion =
        "Hello! I'm your AI interviewer. Could you tell me about yourself and your experience?";
      setInterviewState((prev) => ({
        ...prev,
        currentQuestion: fallbackQuestion,
        aiResponse: fallbackQuestion,
      }));

      try {
        speechSynthesisRef.current?.speak(fallbackQuestion);
      } catch (speechError) {
        console.error("Fallback speech synthesis error:", speechError);
      }
    }
  };

  const handleUserResponse = async (userResponse: string) => {
    if (!speechSynthesisRef.current) return;

    // Prevent processing AI-generated content as user response
    const aiPhrases = [
      "thank you for sharing that",
      "that's interesting",
      "that's a great question",
      "could you tell me",
      "can you give me",
      "let me ask you",
      "excellent",
      "wonderful",
      "that's valuable",
      "good to hear",
      "i'd like to hear",
      "i'd love to hear",
    ];

    const lowerResponse = userResponse.toLowerCase();
    const isAIGenerated = aiPhrases.some((phrase) =>
      lowerResponse.includes(phrase)
    );

    if (isAIGenerated) {
      return;
    }

    try {
      // Set thinking state
      setInterviewState((prev) => ({ ...prev, isThinking: true }));

      // Get interview configuration
      const storedConfig = sessionStorage.getItem("interviewConfig");
      const interviewConfig = storedConfig
        ? JSON.parse(storedConfig)
        : {
            role: "Software Engineer",
            level: "mid-level",
            type: "technical",
            customRequirements: "React and modern JavaScript",
          };

      // Clean the user response
      const cleanResponse =
        interviewSpeechUtils.cleanUserResponse(userResponse);

      // Check if response is too short or unclear
      if (cleanResponse.length < 10) {
        setInterviewState((prev) => ({ ...prev, isThinking: false }));
        return;
      }

      // Add user response to conversation history
      setInterviewState((prev) => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          { role: "user", content: userResponse, timestamp: new Date() },
        ],
        userTranscript: "",
        isListening: false,
      }));

      // Analyze response and generate follow-up
      const analysisResponse = await fetch("/api/interview/analyze-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userResponse, context: interviewConfig }),
      });

      let aiResponse = "";

      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();

        // Update score
        setInterviewState((prev) => ({
          ...prev,
          score: prev.score + analysis.score,
          feedback: analysis.feedback,
        }));

        // Respond naturally based on the analysis (without exposing the analysis to the candidate)
        if (analysis.score < 50) {
          // For low scores, ask for more specific details
          const followUps = [
            "Thank you for sharing that. I'd like to hear more about your experience. Could you tell me about a specific project you've worked on?",
            "That's interesting. Can you give me a concrete example of a project where you applied your skills?",
            "I'd love to hear more details. Could you walk me through a specific challenge you've solved?",
            "Thank you for that. Can you tell me about a particular situation where you demonstrated your expertise?",
          ];
          aiResponse = followUps[Math.floor(Math.random() * followUps.length)];
        } else if (analysis.score < 80) {
          // For medium scores, acknowledge and explore further
          const acknowledgments = [
            "That's a good point. Let me ask you a follow-up question to explore this further.",
            "Interesting perspective. I'd like to dive deeper into that experience.",
            "That's valuable insight. Can you tell me more about how you approach such situations?",
            "Good to hear. Let me ask you another question to understand your approach better.",
          ];
          aiResponse =
            acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
        } else {
          // For high scores, acknowledge excellence and move forward
          const praises = [
            "Excellent! That's very insightful. Let me ask you another question.",
            "That's a great response. I'm impressed by your approach. Let's continue.",
            "Wonderful! You've clearly thought this through. Let me ask you another question.",
            "That's excellent work. I can see you have strong experience in this area. Let's explore further.",
          ];
          aiResponse = praises[Math.floor(Math.random() * praises.length)];
        }
      } else {
        aiResponse =
          "Thank you for that response. Let me ask you another question.";
      }

      // Generate a natural follow-up question
      const questionResponse = await fetch("/api/interview/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            ...interviewConfig,
            conversationHistory: [
              ...interviewState.conversationHistory,
              { role: "user", content: userResponse, timestamp: new Date() },
            ],
            currentQuestionNumber: interviewState.questionNumber,
            totalQuestions: interviewState.totalQuestions,
            previousQuestions: interviewState.conversationHistory
              .filter((msg) => msg.role === "assistant")
              .map((msg) => msg.content),
          },
          userResponse,
          isFirstQuestion: false,
        }),
      });

      if (questionResponse.ok) {
        const followUpQuestion = await questionResponse.json();
        aiResponse += ` ${followUpQuestion.question}`;

        // Update question state
        setInterviewState((prev) => ({
          ...prev,
          currentQuestion: followUpQuestion.question,
          questionNumber: prev.questionNumber + 1,
        }));
      }

      // Add AI response to conversation history
      setInterviewState((prev) => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          { role: "assistant", content: aiResponse, timestamp: new Date() },
        ],
        aiResponse: aiResponse,
      }));

      // Speak the response naturally
      const formattedResponse =
        interviewSpeechUtils.formatQuestionForSpeech(aiResponse);
      const speechOptions = interviewSpeechUtils.getSpeechOptions("question");
      speechSynthesisRef.current.speak(formattedResponse, speechOptions);
    } catch (error) {
      console.error("Error handling user response:", error);
      toast.error("Error processing your response");
    } finally {
      // Clear thinking state
      setInterviewState((prev) => ({ ...prev, isThinking: false }));
    }
  };

  const initializeMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setInterviewState((prev) => ({
        ...prev,
        isConnected: true,
        isRecording: true,
      }));
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const toggleMute = () => {
    if (interviewState.usingFallback) {
      // For fallback mode, toggle local stream mute
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          setInterviewState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
        }
      }
    } else {
      // For realtime mode, use realtime manager
      if (realtimeManagerRef.current) {
        const newMutedState = !interviewState.isMuted;
        realtimeManagerRef.current.setMuted(newMutedState);
        setInterviewState((prev) => ({ ...prev, isMuted: newMutedState }));
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setInterviewState((prev) => ({ ...prev, isVideoOn: !prev.isVideoOn }));
      }
    }
  };

  const toggleListening = () => {
    if (!speechRecognitionRef.current || !interviewState.usingFallback) return;

    if (interviewState.isListening) {
      speechRecognitionRef.current.stopListening();
      setInterviewState((prev) => ({ ...prev, isListening: false }));
    } else {
      speechRecognitionRef.current.startListening();
      setInterviewState((prev) => ({ ...prev, isListening: true }));
    }
  };

  const endInterview = async () => {
    try {
      // Stop all media streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        localStreamRef.current = null;
      }

      // Disconnect realtime connection
      if (realtimeManagerRef.current) {
        await realtimeManagerRef.current.disconnect();
      }

      // Stop speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stopListening();
      }

      // Stop speech synthesis
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.stop();
      }

      // Stop audio recording if active
      if (audioRecordingRef.current && interviewState.isRecording) {
        try {
          await audioRecordingRef.current.stopRecording();
        } catch (error) {
          // Audio recording already stopped
        }
      }

      // Clear all timeouts
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
        listeningTimeoutRef.current = null;
      }

      // Reset all state
      setInterviewState((prev) => ({
        ...prev,
        isConnected: false,
        isRecording: false,
        isListening: false,
        isSpeaking: false,
        isThinking: false,
        isVideoOn: false,
        isMuted: true,
        realtimeConnected: false,
        connectionState: "disconnected",
      }));

      // Generate feedback if we have a session and conversation history
      if (sessionId && interviewState.conversationHistory.length > 0) {
        const feedbackResponse = await fetch("/api/interview/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.id}`,
          },
          body: JSON.stringify({
            sessionId,
            transcript: interviewState.conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp.toISOString(),
            })),
            role: sessionConfig?.role || "software-engineer",
            level: sessionConfig?.level || "mid-level",
            type: sessionConfig?.type || "mixed",

            customRequirements: sessionConfig?.customRequirements,
          }),
        });

        if (feedbackResponse.ok) {
          // Redirect to summary page
          router.push(`/interview/summary?sessionId=${sessionId}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error ending interview:", error);
      router.push("/dashboard");
    }
  };

  const handleEndInterviewClick = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndInterview = () => {
    setShowEndConfirmation(false);
    endInterview();
  };

  const cancelEndInterview = () => {
    setShowEndConfirmation(false);
  };

  // Handle keyboard events for confirmation dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showEndConfirmation) {
        if (event.key === "Escape") {
          cancelEndInterview();
        } else if (event.key === "Enter") {
          confirmEndInterview();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showEndConfirmation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {isRedirecting
              ? "Redirecting to login..."
              : "Connecting to interview..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className={`min-h-screen bg-slate-900 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">Live Interview</span>
              </div>

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {interviewState.realtimeConnected ||
                interviewState.usingFallback ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-slate-300">
                  {interviewState.realtimeConnected
                    ? "Connected to AI"
                    : interviewState.usingFallback
                      ? "Using Speech Mode"
                      : "Connecting..."}
                </span>
                <span className="text-xs text-slate-400">
                  ({interviewState.connectionState})
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4 text-slate-300" />
                <span className="text-white font-mono">
                  {formatTime(interviewState.timeRemaining)}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-white">{interviewState.score}</span>
              </div>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-slate-300 hover:text-white"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-4rem)]">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Question Progress Indicator */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700 z-10">
            <span className="text-white text-sm font-medium">
              Question {interviewState.questionNumber} of{" "}
              {interviewState.totalQuestions}
            </span>
          </div>

          {/* Remote Video (AI Interviewer) */}
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                  interviewState.isSpeaking
                    ? "bg-gradient-to-br from-green-500 to-green-600 animate-pulse"
                    : interviewState.isThinking
                      ? "bg-gradient-to-br from-yellow-500 to-orange-600 animate-pulse"
                      : interviewState.realtimeConnected ||
                          interviewState.usingFallback
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                        : "bg-gradient-to-br from-gray-500 to-gray-600"
                }`}
              >
                {interviewState.isSpeaking ? (
                  <Volume2 className="w-16 h-16 text-white" />
                ) : interviewState.isThinking ? (
                  <div className="w-16 h-16 text-white animate-spin">
                    <svg
                      className="w-full h-full"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : interviewState.realtimeConnected ? (
                  <Brain className="w-16 h-16 text-white" />
                ) : interviewState.usingFallback ? (
                  <Mic className="w-16 h-16 text-white" />
                ) : (
                  <WifiOff className="w-16 h-16 text-white" />
                )}
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">
                AI Interviewer
              </h2>
              <p className="text-slate-400">
                {interviewState.isSpeaking
                  ? "Speaking..."
                  : interviewState.isThinking
                    ? "Thinking..."
                    : interviewState.realtimeConnected
                      ? "Ready for conversation..."
                      : interviewState.usingFallback
                        ? "Speech mode active..."
                        : "Connecting to AI..."}
              </p>

              {/* Connection Status */}
              {!interviewState.realtimeConnected &&
                !interviewState.usingFallback && (
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 text-sm">
                      Connecting...
                    </span>
                  </div>
                )}

              {/* Voice Activity Indicator for Fallback Mode */}
              {interviewState.usingFallback && interviewState.isListening && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm">Listening...</span>
                </div>
              )}
            </div>
          </div>

          {/* Local Video */}
          <div className="absolute bottom-4 right-4 w-64 h-48 bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!interviewState.isVideoOn && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>

          {/* Recording Indicator */}
          {interviewState.isRecording && (
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">REC</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* Action Buttons */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-3">
              {/* Connection Status Card */}
              <Card className="border-slate-700 bg-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {interviewState.realtimeConnected ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : interviewState.usingFallback ? (
                        <Mic className="w-4 h-4 text-blue-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-slate-300">
                        {interviewState.realtimeConnected
                          ? "Realtime Mode"
                          : interviewState.usingFallback
                            ? "Speech Mode"
                            : "Disconnected"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {interviewState.connectionState}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Speech Mode Controls (only show in fallback mode) */}
              {interviewState.usingFallback && (
                <div className="space-y-3">
                  <Button
                    onClick={toggleListening}
                    variant={
                      interviewState.isListening ? "destructive" : "default"
                    }
                    className={`w-full ${
                      interviewState.isListening
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    }`}
                    disabled={
                      interviewState.isSpeaking || interviewState.isThinking
                    }
                  >
                    {interviewState.isListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Speaking
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Speaking
                      </>
                    )}
                  </Button>

                  {interviewState.isListening &&
                    interviewState.userTranscript &&
                    interviewState.userTranscript.length > 20 && (
                      <Button
                        onClick={() => {
                          if (speechRecognitionRef.current) {
                            speechRecognitionRef.current.stopListening();
                            setInterviewState((prev) => ({
                              ...prev,
                              isListening: false,
                            }));
                            // Process the current transcript as a complete response
                            handleUserResponse(interviewState.userTranscript);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </Button>
                    )}
                </div>
              )}

              {/* Conversation History */}
              <Card className="border-slate-700 bg-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">
                    Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {interviewState.conversationHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`text-sm ${
                          msg.role === "user"
                            ? "text-blue-300"
                            : "text-green-300"
                        }`}
                      >
                        <div className="font-medium">
                          {msg.role === "user" ? "You" : "AI"}:
                        </div>
                        <div className="mt-1 text-slate-300">
                          {msg.content.length > 100
                            ? `${msg.content.substring(0, 100)}...`
                            : msg.content}
                        </div>
                      </div>
                    ))}
                    {interviewState.conversationHistory.length === 0 && (
                      <div className="text-sm text-slate-400 text-center py-4">
                        No conversation yet...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Controls</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <Button
                variant={interviewState.isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMute}
                className="border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
              >
                {interviewState.isMuted ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant={!interviewState.isVideoOn ? "destructive" : "outline"}
                size="sm"
                onClick={toggleVideo}
                className="border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
              >
                {!interviewState.isVideoOn ? (
                  <VideoOff className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant={interviewState.isSpeaking ? "destructive" : "outline"}
                size="sm"
                onClick={() => speechSynthesisRef.current?.stop()}
                className="border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
                disabled={!interviewState.isSpeaking}
              >
                {interviewState.isSpeaking ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndInterviewClick}
                className="bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* End Interview Confirmation Dialog */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <PhoneOff className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white text-lg font-semibold">
                End Interview
              </h3>
            </div>

            <p className="text-slate-300 mb-6">
              Are you sure you want to end this interview? This action will:
            </p>

            <ul className="text-slate-400 text-sm mb-6 space-y-2">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                Stop all recording and voice activities
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                Terminate the interview session
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                Generate feedback and redirect to summary
              </li>
            </ul>

            <div className="flex space-x-3">
              <Button
                onClick={cancelEndInterview}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmEndInterview}
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
