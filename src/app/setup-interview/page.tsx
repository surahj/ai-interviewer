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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditDisplay } from "@/components/ui/credit-display";
import { CreditPurchaseModal } from "@/components/ui/credit-purchase-modal";
import {
  Mic,
  User,
  Settings,
  Clock,
  Target,
  Star,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Video,
  Headphones,
  Wifi,
  Zap,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  testMicrophone as testMicrophoneUtil,
  testCamera as testCameraUtil,
  requestMediaPermissions,
  getPermissionInstructions,
  isSecureContext,
} from "@/lib/media-utils";

// Interview configuration options
const jobRoles = [
  { value: "software-engineer", label: "Software Engineer", icon: "💻" },
  { value: "frontend-developer", label: "Frontend Developer", icon: "🎨" },
  { value: "backend-developer", label: "Backend Developer", icon: "⚙️" },
  { value: "fullstack-developer", label: "Full Stack Developer", icon: "🔄" },
  { value: "data-scientist", label: "Data Scientist", icon: "📊" },
  { value: "devops-engineer", label: "DevOps Engineer", icon: "🐳" },
  { value: "product-manager", label: "Product Manager", icon: "📋" },
  { value: "ui-ux-designer", label: "UI/UX Designer", icon: "🎯" },
  { value: "qa-engineer", label: "QA Engineer", icon: "🔍" },
  { value: "mobile-developer", label: "Mobile Developer", icon: "📱" },
];

const experienceLevels = [
  {
    value: "junior",
    label: "Junior (0-2 years)",
    description: "Entry level positions",
  },
  {
    value: "mid-level",
    label: "Mid-Level (3-5 years)",
    description: "Intermediate positions",
  },
  {
    value: "senior",
    label: "Senior (6-8 years)",
    description: "Advanced positions",
  },
  {
    value: "lead",
    label: "Lead (8+ years)",
    description: "Leadership positions",
  },
];

const interviewTypes = [
  {
    value: "technical",
    label: "Technical Interview",
    description: "Focus on technical skills and problem solving",
  },
  {
    value: "behavioral",
    label: "Behavioral Interview",
    description: "Focus on soft skills and past experiences",
  },
  {
    value: "mixed",
    label: "Mixed Interview",
    description: "Combination of technical and behavioral questions",
  },
  {
    value: "case-study",
    label: "Case Study",
    description: "Real-world problem solving scenarios",
  },
];

const interviewDurations = [
  { value: "15", label: "15 minutes", description: "Quick assessment" },
  { value: "30", label: "30 minutes", description: "Standard interview" },
  { value: "45", label: "45 minutes", description: "Comprehensive interview" },
  { value: "60", label: "60 minutes", description: "Full interview session" },
];

export default function SetupInterviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [equipmentStatus, setEquipmentStatus] = useState({
    microphone: false,
    camera: false,
    internet: false,
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState<number | null>(null);
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState(true);

  // Interview configuration state
  const [interviewConfig, setInterviewConfig] = useState({
    role: "",
    level: "",
    type: "",
    duration: "15",
    customRequirements: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      router.push("/login?redirectTo=/setup-interview");
    }
  }, [user, loading, router]);

  // Fetch user credits
  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchUserCredits = async () => {
    try {
      setCreditsLoading(true);
      const response = await fetch("/api/credits/balance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCredits(data.available_credits);
      } else {
        console.error("Failed to fetch credits");
        setAvailableCredits(0);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      setAvailableCredits(0);
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleConfigChange = (field: string, value: string) => {
    setInterviewConfig((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Calculate required credits when duration changes
    if (field === "duration") {
      const duration = parseInt(value);
      const credits = Math.max(5, Math.min(50, Math.ceil(duration / 3)));
      setRequiredCredits(credits);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return interviewConfig.role && interviewConfig.level;
      case 2:
        return interviewConfig.type && interviewConfig.duration;
      case 3:
        return true; // Equipment test step
      case 4:
        return (
          equipmentStatus.microphone &&
          equipmentStatus.camera &&
          equipmentStatus.internet
        );
      default:
        return false;
    }
  };

  const canStartInterview = () => {
    // Check if user has enough credits for the interview
    if (requiredCredits && availableCredits < requiredCredits) {
      return false;
    }
    return canProceedToNext();
  };

  // Only realtime interview is supported now

  const handleStartRealtimeInterview = () => {
    // Store interview configuration in sessionStorage for the realtime interview
    sessionStorage.setItem(
      "interviewConfig",
      JSON.stringify({
        ...interviewConfig,
        duration: parseInt(interviewConfig.duration),
      })
    );
    router.push("/interview/realtime");
  };

  const testMicrophone = async () => {
    try {
      const result = await testMicrophoneUtil();
      if (result.success) {
        setEquipmentStatus((prev) => ({ ...prev, microphone: true }));
        toast.success("Microphone test successful!");
      } else {
        setEquipmentStatus((prev) => ({ ...prev, microphone: false }));
        toast.error(`Microphone test failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Microphone test failed:", error);
      setEquipmentStatus((prev) => ({ ...prev, microphone: false }));
      toast.error(
        "Microphone test failed. Please check your microphone connection."
      );
    }
  };

  const testCamera = async () => {
    try {
      const result = await testCameraUtil();
      if (result.success) {
        setEquipmentStatus((prev) => ({ ...prev, camera: true }));
        toast.success("Camera test successful!");
      } else {
        setEquipmentStatus((prev) => ({ ...prev, camera: false }));
        toast.error(`Camera test failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Camera test failed:", error);
      setEquipmentStatus((prev) => ({ ...prev, camera: false }));
      toast.error("Camera test failed. Please check your camera connection.");
    }
  };

  const testInternet = async () => {
    try {
      // Test basic connectivity
      const response = await fetch("/api/ping", {
        method: "GET",
        cache: "no-cache", // Prevent caching
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status !== "ok") {
        throw new Error("Server response indicates connection issue");
      }

      setEquipmentStatus((prev) => ({ ...prev, internet: true }));
      toast.success("Internet connection test successful!");
    } catch (error) {
      console.error("Internet test failed:", error);
      setEquipmentStatus((prev) => ({ ...prev, internet: false }));

      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error(
          "No internet connection. Please check your network connection."
        );
      } else {
        toast.error(
          "Internet connection test failed. Please check your network connection."
        );
      }
    }
  };

  // Auto-test equipment when reaching step 3
  useEffect(() => {
    if (currentStep === 3) {
      // Auto-test all equipment
      testMicrophone();
      testCamera();
      testInternet();
    }
  }, [currentStep]);

  // Helper function to request permissions
  const requestPermissions = async () => {
    try {
      toast.loading("Requesting permissions...");

      const result = await requestMediaPermissions();

      // Update status based on what we got
      setEquipmentStatus((prev) => ({
        ...prev,
        microphone: result.microphone,
        camera: result.camera,
      }));

      toast.dismiss();

      if (result.error) {
        toast.error(`Permission request failed: ${result.error}`);

        // Show browser-specific instructions
        const instructions = getPermissionInstructions();
        toast.error(instructions, { duration: 8000 });
      } else {
        toast.success("Permissions granted! Equipment tested successfully.");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Permission request failed:", error);
      toast.error(
        "Failed to request permissions. Please check your browser settings."
      );
    }
  };

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {isRedirecting
              ? "Redirecting to login..."
              : "Loading interview setup..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Interview Setup
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-slate-600">
            <span>Role & Level</span>
            <span>Interview Type</span>
            <span>Equipment Test</span>
          </div>
        </div>

        {/* Step 1: Role and Level Selection */}
        {currentStep === 1 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">
                Select Your Role & Experience Level
              </CardTitle>
              <CardDescription className="text-slate-600">
                Choose your job role and experience level to customize your
                interview experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium text-slate-900">
                  Job Role
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {jobRoles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleConfigChange("role", role.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        interviewConfig.role === role.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{role.icon}</div>
                      <div className="font-medium text-slate-900">
                        {role.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium text-slate-900">
                  Experience Level
                </Label>
                <div className="space-y-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleConfigChange("level", level.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        interviewConfig.level === level.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">
                            {level.label}
                          </div>
                          <div className="text-sm text-slate-600">
                            {level.description}
                          </div>
                        </div>
                        {interviewConfig.level === level.value && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToNext()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Interview Type and Duration */}
        {currentStep === 2 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">
                Choose Interview Type & Duration
              </CardTitle>
              <CardDescription className="text-slate-600">
                Select the type of interview and how long you'd like it to last
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium text-slate-900">
                  Interview Type
                </Label>
                <div className="grid md:grid-cols-2 gap-4">
                  {interviewTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleConfigChange("type", type.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        interviewConfig.type === type.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-medium text-slate-900 mb-1">
                        {type.label}
                      </div>
                      <div className="text-sm text-slate-600">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium text-slate-900">
                  Interview Duration
                </Label>
                <div className="grid md:grid-cols-2 gap-4">
                  {interviewDurations.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() =>
                        handleConfigChange("duration", duration.value)
                      }
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        interviewConfig.duration === duration.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-slate-600" />
                        <div>
                          <div className="font-medium text-slate-900">
                            {duration.label}
                          </div>
                          <div className="text-sm text-slate-600">
                            {duration.description}
                          </div>
                        </div>
                      </div>
                      {interviewConfig.duration === duration.value &&
                        requiredCredits && (
                          <div className="mt-2 text-xs text-blue-600">
                            Requires {requiredCredits} credits
                          </div>
                        )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label
                  htmlFor="customRequirements"
                  className="text-lg font-medium text-slate-900"
                >
                  Custom Requirements (Optional)
                </Label>
                <Input
                  id="customRequirements"
                  placeholder="Any specific topics or skills you'd like to focus on..."
                  value={interviewConfig.customRequirements}
                  onChange={(e) =>
                    handleConfigChange("customRequirements", e.target.value)
                  }
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="border-slate-300 hover:border-slate-400"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToNext()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Equipment Test */}
        {currentStep === 3 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">
                Test Your Equipment
              </CardTitle>
              <CardDescription className="text-slate-600">
                Ensure your microphone, camera, and internet connection are
                working properly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Permission Request Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Browser Permissions
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  This application needs access to your microphone and camera
                  for the interview. Click the button below to grant
                  permissions.
                </p>
                {!isSecureContext() && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Media devices require a secure
                      connection (HTTPS). If you're testing locally, this should
                      work fine.
                    </p>
                  </div>
                )}
                <Button
                  onClick={requestPermissions}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Grant Permissions
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Microphone Test */}
                  <div className="p-4 border-2 border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Headphones className="w-6 h-6 text-slate-600" />
                      <span className="font-medium text-slate-900">
                        Microphone
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {equipmentStatus.microphone ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm text-slate-600">
                        {equipmentStatus.microphone
                          ? "Working"
                          : "Not detected"}
                      </span>
                    </div>
                    <Button
                      onClick={testMicrophone}
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-300 hover:border-slate-400"
                    >
                      Test Microphone
                    </Button>
                  </div>

                  {/* Camera Test */}
                  <div className="p-4 border-2 border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Video className="w-6 h-6 text-slate-600" />
                      <span className="font-medium text-slate-900">Camera</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {equipmentStatus.camera ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm text-slate-600">
                        {equipmentStatus.camera ? "Working" : "Not detected"}
                      </span>
                    </div>
                    <Button
                      onClick={testCamera}
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-300 hover:border-slate-400"
                    >
                      Test Camera
                    </Button>
                  </div>

                  {/* Internet Test */}
                  <div className="p-4 border-2 border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Wifi className="w-6 h-6 text-slate-600" />
                      <span className="font-medium text-slate-900">
                        Internet
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {equipmentStatus.internet ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm text-slate-600">
                        {equipmentStatus.internet
                          ? "Connected"
                          : "No connection"}
                      </span>
                    </div>
                    <Button
                      onClick={testInternet}
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-300 hover:border-slate-400"
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Interview Tips
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Find a quiet environment with good lighting</li>
                      <li>• Test your equipment before starting</li>
                      <li>• Have a stable internet connection</li>
                      <li>• Prepare your workspace and materials</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">
                    Troubleshooting
                  </span>
                </div>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p>
                    <strong>If microphone/camera shows "Not detected":</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      Make sure your browser supports media devices (Chrome,
                      Firefox, Safari, Edge)
                    </li>
                    <li>
                      Check that your microphone and camera are properly
                      connected
                    </li>
                    <li>
                      Ensure no other applications are using your microphone or
                      camera
                    </li>
                    <li>
                      Try refreshing the page and granting permissions again
                    </li>
                    <li>
                      Check your browser's site settings for microphone and
                      camera permissions
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                {/* Credit Information */}
                <div className="flex justify-center mb-4">
                  <CreditDisplay
                    className="max-w-md"
                    showPurchaseButton={true}
                    onPurchaseClick={() => setShowPurchaseModal(true)}
                  />
                </div>

                <div className="flex justify-center">
                  <Card className="border-2 border-slate-200 hover:border-green-300 transition-colors max-w-md">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">
                          Real-time Conversation
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Advanced AI-powered real-time speech-to-speech
                          conversation
                        </p>
                        {requiredCredits && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              This interview will cost{" "}
                              <strong>{requiredCredits} credits</strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              You have{" "}
                              <strong>{availableCredits} credits</strong>{" "}
                              available
                            </p>
                          </div>
                        )}

                        {requiredCredits &&
                          availableCredits < requiredCredits && (
                            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-sm text-red-800">
                                ❌ Insufficient credits. You need{" "}
                                <strong>
                                  {requiredCredits - availableCredits} more
                                  credits
                                </strong>{" "}
                                to start this interview.
                              </p>
                              <Button
                                onClick={() => setShowPurchaseModal(true)}
                                className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white"
                              >
                                Buy Credits to Continue
                              </Button>
                            </div>
                          )}

                        <Button
                          onClick={handleStartRealtimeInterview}
                          disabled={!canStartInterview()}
                          className={`w-full ${
                            canStartInterview()
                              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {!canStartInterview() &&
                          requiredCredits &&
                          availableCredits < requiredCredits
                            ? "Insufficient Credits"
                            : "Start Real-time Interview"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="border-slate-300 hover:border-slate-400"
                  >
                    Previous
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseSuccess={() => {
          // Refresh the page to update credit display
          window.location.reload();
        }}
      />
    </div>
  );
}
