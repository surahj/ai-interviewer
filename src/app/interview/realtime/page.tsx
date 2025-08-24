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
  PhoneOff,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Brain,
  Volume2,
  Mic,
  MicOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  RealtimeConversationManager,
  checkRealtimeSupport,
  testMicrophone,
} from "@/lib/realtime-conversation";
import toast from "react-hot-toast";

interface InterviewState {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  connectionState: string;
  timeRemaining: number;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  interviewConfig?: {
    role: string;
    level: string;
    type: string;
    customRequirements?: string;
  };
}

export default function RealtimeInterviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Interview state
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isConnected: false,
    isMuted: false,
    isSpeaking: false,
    isListening: false,
    connectionState: "disconnected",
    timeRemaining: 900, // 15 minutes
    conversationHistory: [],
    interviewConfig: undefined,
  });

  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionConfig, setSessionConfig] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [microphoneStatus, setMicrophoneStatus] = useState<
    "checking" | "available" | "unavailable" | "error"
  >("checking");
  const [microphoneError, setMicrophoneError] = useState<string>("");

  // Refs to prevent duplicate API calls
  const initializationRef = useRef(false);
  const sessionCreationRef = useRef(false);

  // Realtime manager
  const realtimeManagerRef = useRef<RealtimeConversationManager | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.push("/login?redirectTo=/interview/realtime");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (isInitialized || initializationRef.current) return;

    // Ensure we're in a browser environment
    if (typeof window === "undefined") {
      return;
    }

    initializationRef.current = true;

    const initializeInterview = async () => {
      try {
        // Check realtime support
        if (!checkRealtimeSupport()) {
          toast.error(
            "Real-time conversation is not supported in this browser. Please use Chrome, Edge, or Safari."
          );
          router.push("/dashboard");
          return;
        }

        // Test microphone access
        setMicrophoneStatus("checking");
        const microphoneTest = await testMicrophone();
        if (!microphoneTest.success) {
          setMicrophoneStatus("unavailable");
          setMicrophoneError(microphoneTest.error || "Unknown error");

          toast.error(
            `Real-time conversation requires microphone access. ${microphoneTest.error}`
          );

          // Redirect to dashboard if microphone unavailable
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
          return;
        }

        setMicrophoneStatus("available");

        // Create realtime session
        const sessionData = await createRealtimeSession();

        // Initialize realtime connection with session data
        await initializeRealtimeConnection(
          sessionData.sessionId,
          sessionData.session
        );

        // Add initial AI greeting to start the conversation
        const initialGreeting = {
          role: "assistant" as const,
          content: `Hello! Welcome to your ${sessionData.interviewConfig.type} interview for a ${sessionData.interviewConfig.level} ${sessionData.interviewConfig.role} position. I'm excited to learn more about you and your experience. Could you tell me a bit about yourself and your background?`,
          timestamp: new Date(),
        };

        setInterviewState((prev) => ({
          ...prev,
          conversationHistory: [initialGreeting],
        }));

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing interview:", error);

        // Check if it's an API key or configuration error
        if (error instanceof Error && error.message.includes("API key")) {
          toast.error(
            "OpenAI API key not configured. Please check your environment variables."
          );
        } else if (
          error instanceof Error &&
          error.message.includes("Failed to create realtime session")
        ) {
          toast.error(
            "Failed to create real-time session. Please check your OpenAI API access."
          );
        } else {
          // Error initializing interview
        }

        // Reset the ref on error so user can retry
        initializationRef.current = false;
      }
    };

    initializeInterview();
  }, [isInitialized]);

  // Timer effect
  useEffect(() => {
    if (!isInitialized) return;

    const timer = setInterval(() => {
      setInterviewState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [isInitialized]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (realtimeManagerRef.current) {
        realtimeManagerRef.current.disconnect();
      }

      // Reset refs
      initializationRef.current = false;
      sessionCreationRef.current = false;
    };
  }, []);

  const createRealtimeSession = async () => {
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
            customRequirements: "",
          };

      // Create realtime session
      const response = await fetch("/api/interview/realtime-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify(interviewConfig),
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSessionId(sessionData.sessionId);
        setSessionConfig(sessionData.session);
        setInterviewState((prev) => ({
          ...prev,
          interviewConfig: sessionData.interviewConfig,
        }));
        return sessionData;
      } else {
        const errorText = await response.text();
        console.error("Failed to create realtime session:", errorText);

        // Parse error response for better error messages
        let errorMessage = "Failed to create realtime session";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If we can't parse the error, use the raw text
          errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating realtime session:", error);
      toast.error("Failed to create realtime session");
      // Reset the ref on error so user can retry
      sessionCreationRef.current = false;
      throw error;
    }
  };

  const initializeRealtimeConnection = async (
    sessionId: string,
    session: any
  ) => {
    try {
      if (!sessionId || !session) {
        throw new Error("No session ID or session data available");
      }

      // Create realtime manager
      realtimeManagerRef.current = new RealtimeConversationManager({
        session: session,
        onTranscriptReceived: (transcript, isFinal) => {
          if (isFinal && transcript.trim()) {
            // Update UI with the conversation history from the manager
            const history =
              realtimeManagerRef.current?.getConversationHistory() || [];
            setInterviewState((prev) => ({
              ...prev,
              conversationHistory: history,
              isSpeaking: false,
            }));
          }
        },
        onUserSpeech: (transcript, isFinal) => {
          if (isFinal && transcript.trim()) {
            // Update UI with the conversation history from the manager
            const history =
              realtimeManagerRef.current?.getConversationHistory() || [];
            setInterviewState((prev) => ({
              ...prev,
              conversationHistory: history,
            }));
          }
        },
        onError: (error) => {
          console.error("Realtime error:", error);
          // toast.error(`Connection error: ${error}`);
          setInterviewState((prev) => ({
            ...prev,
            connectionState: "failed",
          }));
        },
        onConnectionStateChange: (state) => {
          setInterviewState((prev) => ({
            ...prev,
            connectionState: state,
            isConnected: state === "connected",
          }));
        },
      });

      // Connect to OpenAI Realtime
      await realtimeManagerRef.current.connect();

      setInterviewState((prev) => ({
        ...prev,
        isConnected: true,
        connectionState: "connected",
      }));
    } catch (error) {
      console.error("Error initializing realtime connection:", error);
      toast.error("Failed to establish realtime connection");
      throw error;
    }
  };

  const toggleMute = () => {
    if (realtimeManagerRef.current) {
      const newMutedState = !interviewState.isMuted;
      realtimeManagerRef.current.setMuted(newMutedState);
      setInterviewState((prev) => ({ ...prev, isMuted: newMutedState }));
    }
  };

  // OpenAI Realtime handles AI responses automatically through the WebRTC connection

  const endInterview = async () => {
    try {
      // Disconnect realtime connection
      if (realtimeManagerRef.current) {
        await realtimeManagerRef.current.disconnect();
      }

      // Reset state
      setInterviewState((prev) => ({
        ...prev,
        isConnected: false,
        connectionState: "disconnected",
      }));

      // Get conversation history from the manager
      let conversationHistory =
        realtimeManagerRef.current?.getConversationHistory() || [];

      // If no conversation history, try building from raw messages
      if (conversationHistory.length === 0) {
        conversationHistory =
          realtimeManagerRef.current?.buildConversationFromRawMessages() || [];
      }

      // If still no conversation history, use UI state as final fallback
      if (conversationHistory.length === 0) {
        conversationHistory = interviewState.conversationHistory;
      }

      // Generate feedback if we have conversation history
      if (sessionId && conversationHistory.length > 0) {
        // Get the actual interview configuration from sessionStorage
        const storedConfig = sessionStorage.getItem("interviewConfig");
        const actualConfig = storedConfig
          ? JSON.parse(storedConfig)
          : {
              role: "software-engineer",
              level: "mid-level",
              type: "mixed",
              customRequirements: "",
            };

        const requestBody = {
          sessionId,
          transcript: conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
          })),
          role: actualConfig.role,
          level: actualConfig.level,
          type: actualConfig.type,
          customRequirements: actualConfig.customRequirements,
          userId: user?.id,
          duration: 900 - interviewState.timeRemaining, // Calculate actual duration
        };

        const completionResponse = await fetch(
          "/api/interview/complete-realtime",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.id}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (completionResponse.ok) {
          const completionData = await completionResponse.json();
          // Use the database ID returned from the completion API
          const interviewId = completionData.interviewId;
          router.push(`/interview/summary/${interviewId}`);
        } else {
          const errorData = await completionResponse.json();
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
              : "Connecting to real-time interview..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">
                  Real-time Interview
                </span>
              </div>

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {microphoneStatus === "unavailable" ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-slate-300">
                      Microphone unavailable
                    </span>
                  </>
                ) : interviewState.isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-slate-300">
                      Connected to AI
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-slate-300">
                      Connecting...
                    </span>
                  </>
                )}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-4rem)]">
        {/* Conversation Area */}
        <div className="flex-1 relative">
          {/* AI Interviewer Display */}
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                  interviewState.isSpeaking
                    ? "bg-gradient-to-br from-green-500 to-green-600 animate-pulse"
                    : interviewState.isConnected
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                      : "bg-gradient-to-br from-gray-500 to-gray-600"
                }`}
              >
                {interviewState.isSpeaking ? (
                  <Volume2 className="w-16 h-16 text-white" />
                ) : interviewState.isConnected ? (
                  <Brain className="w-16 h-16 text-white" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-white" />
                )}
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">
                AI Interviewer
              </h2>
              <p className="text-slate-400">
                {microphoneStatus === "unavailable"
                  ? "Microphone not available"
                  : interviewState.isSpeaking
                    ? "Speaking..."
                    : interviewState.isConnected
                      ? "Ready for conversation..."
                      : "Connecting to AI..."}
              </p>

              {/* Microphone Status */}
              {microphoneStatus === "checking" && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 text-sm">
                    Checking microphone...
                  </span>
                </div>
              )}

              {microphoneStatus === "unavailable" && (
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-400 text-sm">
                      Microphone unavailable
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-2">
                    {microphoneError}
                  </p>
                  <p className="text-slate-500 text-xs">
                    Redirecting to standard interview mode...
                  </p>
                </div>
              )}

              {/* Connection Status */}
              {!interviewState.isConnected && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 text-sm">Connecting...</span>
                </div>
              )}

              {/* Controls */}
              {interviewState.isConnected && (
                <div className="mt-8 flex items-center justify-center space-x-4">
                  <Button
                    variant={interviewState.isMuted ? "destructive" : "outline"}
                    size="lg"
                    onClick={toggleMute}
                    className={`border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white ${
                      interviewState.isMuted
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                    }`}
                    disabled={!interviewState.isConnected}
                  >
                    {interviewState.isMuted ? (
                      <MicOff className="w-5 h-5 mr-2" />
                    ) : (
                      <Mic className="w-5 h-5 mr-2" />
                    )}
                    {interviewState.isMuted ? "Unmute" : "Mute"}
                  </Button>

                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleEndInterviewClick}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Interview
                  </Button>
                </div>
              )}
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
              Are you sure you want to end this real-time interview?
            </p>

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
