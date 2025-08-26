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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Target,
  Building,
  BookOpen,
  Star,
  ArrowLeft,
  Save,
  Plus,
  X,
  Check,
  Sparkles,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// We'll use API routes for profile creation instead of direct client calls

const skillCategories = [
  {
    id: "programming",
    label: "Programming Languages",
    skills: [
      "JavaScript",
      "Python",
      "Java",
      "C++",
      "Go",
      "Rust",
      "TypeScript",
      "PHP",
      "Ruby",
      "Swift",
    ],
  },
  {
    id: "frameworks",
    label: "Frameworks & Libraries",
    skills: [
      "React",
      "Vue.js",
      "Angular",
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring",
      "Laravel",
      "FastAPI",
    ],
  },
  {
    id: "databases",
    label: "Databases",
    skills: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "Elasticsearch",
      "DynamoDB",
      "Cassandra",
      "SQLite",
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    skills: [
      "AWS",
      "Azure",
      "GCP",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Jenkins",
      "GitLab CI",
      "Ansible",
    ],
  },
  {
    id: "soft-skills",
    label: "Soft Skills",
    skills: [
      "Leadership",
      "Communication",
      "Problem Solving",
      "Team Collaboration",
      "Time Management",
      "Adaptability",
      "Critical Thinking",
      "Creativity",
    ],
  },
];

const learningStyles = [
  {
    value: "visual",
    label: "Visual Learner",
    description: "Learn best through diagrams, charts, and visual aids",
  },
  {
    value: "auditory",
    label: "Auditory Learner",
    description: "Learn best through listening and verbal communication",
  },
  {
    value: "kinesthetic",
    label: "Hands-on Learner",
    description:
      "Learn best through practical exercises and real-world examples",
  },
  {
    value: "reading",
    label: "Reading/Writing Learner",
    description: "Learn best through reading materials and taking notes",
  },
];

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalPlaceholder, setModalPlaceholder] = useState("");

  const [profile, setProfile] = useState({
    fullName: "",
    bio: "",
    preferredRole: "",
    experienceLevel: "",
    skills: [] as string[],
    careerGoals: [] as string[],
    targetCompanies: [] as string[],
    skillGaps: [] as string[],
    strengths: [] as string[],
    learningStyle: "",
    interviewPreferences: {
      questionStyle: "balanced",
      feedbackStyle: "detailed",
      difficulty: "adaptive",
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayFieldChange = (
    field: keyof Pick<
      typeof profile,
      "careerGoals" | "targetCompanies" | "skillGaps" | "strengths"
    >,
    value: string,
    action: "add" | "remove"
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]:
        action === "add"
          ? [...prev[field], value]
          : prev[field].filter((item) => item !== value),
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // Modal handlers
  const openModal = (type: string, title: string, placeholder: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalPlaceholder(placeholder);
    setModalValue("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalValue("");
  };

  const handleModalSubmit = () => {
    if (modalValue.trim()) {
      switch (modalType) {
        case "careerGoal":
          handleArrayFieldChange("careerGoals", modalValue.trim(), "add");
          break;
        case "targetCompany":
          handleArrayFieldChange("targetCompanies", modalValue.trim(), "add");
          break;
        case "skillGap":
          handleArrayFieldChange("skillGaps", modalValue.trim(), "add");
          break;
        case "strength":
          handleArrayFieldChange("strengths", modalValue.trim(), "add");
          break;
      }
    }
    closeModal();
  };

  const handleCareerGoalAdd = () => {
    openModal(
      "careerGoal",
      "Add Career Goal",
      "e.g., Become a Senior Software Engineer"
    );
  };

  const handleTargetCompanyAdd = () => {
    openModal(
      "targetCompany",
      "Add Target Company",
      "e.g., Google, Microsoft, Apple"
    );
  };

  const handleSkillGapAdd = () => {
    openModal(
      "skillGap",
      "Add Skill Gap",
      "e.g., Machine Learning, System Design"
    );
  };

  const handleStrengthAdd = () => {
    openModal(
      "strength",
      "Add Your Strength",
      "e.g., Problem Solving, Leadership"
    );
  };

  const saveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          userId: user.id,
          full_name: profile.fullName,
          bio: profile.bio,
          preferred_role: profile.preferredRole,
          experience_level: profile.experienceLevel,
          skills: profile.skills,
          career_goals: profile.careerGoals,
          target_companies: profile.targetCompanies,
          skill_gaps: profile.skillGaps,
          strengths: profile.strengths,
          learning_preferences: {
            style: profile.learningStyle,
            preferences: profile.interviewPreferences,
          },
          interview_preferences: profile.interviewPreferences,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      // Initialize learning paths for selected skills
      await initializeLearningPaths();

      // Initialize welcome credits for completing profile
      await initializeWelcomeCredits();

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const initializeLearningPaths = async () => {
    if (!user) return;

    const learningPaths = profile.skills.map((skill) => ({
      user_id: user.id,
      skill_name: skill,
      current_level: 1,
      target_level: 5,
      progress_percentage: 0.0,
    }));

    try {
      // For now, we'll skip learning paths initialization to avoid complexity
      // This can be implemented later with a separate API route
    } catch (error) {
      console.error("Error initializing learning paths:", error);
    }
  };

  const initializeWelcomeCredits = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/credits/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          userId: user.id,
          credits: 50,
          description: "Welcome bonus for completing profile setup",
        }),
      });

      if (!response.ok) {
        console.error("Failed to initialize welcome credits");
      } else {
        console.log("Welcome credits initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing welcome credits:", error);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return (
          profile.fullName && profile.preferredRole && profile.experienceLevel
        );
      case 2:
        return profile.skills.length > 0;
      case 3:
        return (
          profile.careerGoals.length > 0 || profile.targetCompanies.length > 0
        );
      case 4:
        return profile.learningStyle;
      default:
        return true;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-slate-600">
            Help us personalize your interview experience
          </p>
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                🎉 Complete your profile and get 50 welcome credits!
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Start practicing interviews immediately after profile completion.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: "Basic Info", icon: User },
              { step: 2, label: "Skills", icon: BookOpen },
              { step: 3, label: "Goals", icon: Target },
              { step: 4, label: "Preferences", icon: Star },
            ].map(({ step, label, icon: Icon }) => (
              <div
                key={step}
                className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-sm ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg"
                      : "border-slate-300 text-slate-400 bg-white"
                  }`}
                >
                  {currentStep > step ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`ml-3 text-sm font-semibold transition-colors duration-300 ${
                    currentStep >= step ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-slate-900 flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Tell us about yourself and your background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label
                    htmlFor="fullName"
                    className="text-lg font-medium text-slate-900"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={profile.fullName}
                    onChange={(e) =>
                      handleProfileChange("fullName", e.target.value)
                    }
                    className="h-12 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                </div>

                <div className="space-y-4">
                  <Label
                    htmlFor="bio"
                    className="text-lg font-medium text-slate-900"
                  >
                    Bio (Optional)
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    value={profile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label
                    htmlFor="preferredRole"
                    className="text-lg font-medium text-slate-900"
                  >
                    Preferred Role
                  </Label>
                  <select
                    id="preferredRole"
                    value={profile.preferredRole}
                    onChange={(e) =>
                      handleProfileChange("preferredRole", e.target.value)
                    }
                    className="w-full h-12 text-lg border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  >
                    <option value="">Select your preferred role</option>
                    <option value="software-engineer">Software Engineer</option>
                    <option value="frontend-developer">
                      Frontend Developer
                    </option>
                    <option value="backend-developer">Backend Developer</option>
                    <option value="fullstack-developer">
                      Full Stack Developer
                    </option>
                    <option value="data-scientist">Data Scientist</option>
                    <option value="devops-engineer">DevOps Engineer</option>
                    <option value="product-manager">Product Manager</option>
                    <option value="ui-ux-designer">UI/UX Designer</option>
                    <option value="qa-engineer">QA Engineer</option>
                    <option value="mobile-developer">Mobile Developer</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <Label
                    htmlFor="experienceLevel"
                    className="text-lg font-medium text-slate-900"
                  >
                    Experience Level
                  </Label>
                  <select
                    id="experienceLevel"
                    value={profile.experienceLevel}
                    onChange={(e) =>
                      handleProfileChange("experienceLevel", e.target.value)
                    }
                    className="w-full h-12 text-lg border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  >
                    <option value="">Select your experience level</option>
                    <option value="junior">Junior (0-2 years)</option>
                    <option value="mid-level">Mid-Level (3-5 years)</option>
                    <option value="senior">Senior (6-8 years)</option>
                    <option value="lead">Lead (8+ years)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedToNext()}
                    className="h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Next Step
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Skills */}
          {currentStep === 2 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-slate-900 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                  Skills & Expertise
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Select the skills you want to practice and improve
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {skillCategories.map((category) => (
                  <div key={category.id} className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {category.label}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {category.skills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                            profile.skills.includes(skill)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="h-12 px-8 text-lg border-slate-300 hover:border-slate-400 transition-all duration-200"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!canProceedToNext()}
                    className="h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Next Step
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Career Goals & Targets */}
          {currentStep === 3 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-slate-900 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-blue-600" />
                  Career Goals & Targets
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Help us understand your career aspirations and target
                  companies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium text-slate-900">
                      Career Goals
                    </Label>
                    <Button
                      onClick={handleCareerGoalAdd}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.careerGoals.map((goal) => (
                      <Badge
                        key={goal}
                        variant="secondary"
                        className="px-3 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200"
                      >
                        {goal}
                        <button
                          onClick={() =>
                            handleArrayFieldChange(
                              "careerGoals",
                              goal,
                              "remove"
                            )
                          }
                          className="ml-2 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium text-slate-900">
                      Target Companies
                    </Label>
                    <Button
                      onClick={handleTargetCompanyAdd}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Company
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.targetCompanies.map((company) => (
                      <Badge
                        key={company}
                        variant="secondary"
                        className="px-3 py-2 text-sm bg-green-100 text-green-800 border-green-200"
                      >
                        <Building className="w-3 h-3 mr-1" />
                        {company}
                        <button
                          onClick={() =>
                            handleArrayFieldChange(
                              "targetCompanies",
                              company,
                              "remove"
                            )
                          }
                          className="ml-2 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium text-slate-900">
                      Skill Gaps to Address
                    </Label>
                    <Button
                      onClick={handleSkillGapAdd}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Gap
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skillGaps.map((gap) => (
                      <Badge
                        key={gap}
                        variant="secondary"
                        className="px-3 py-2 text-sm bg-orange-100 text-orange-800 border-orange-200"
                      >
                        {gap}
                        <button
                          onClick={() =>
                            handleArrayFieldChange("skillGaps", gap, "remove")
                          }
                          className="ml-2 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium text-slate-900">
                      Your Strengths
                    </Label>
                    <Button
                      onClick={handleStrengthAdd}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Strength
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.strengths.map((strength) => (
                      <Badge
                        key={strength}
                        variant="secondary"
                        className="px-3 py-2 text-sm bg-purple-100 text-purple-800 border-purple-200"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {strength}
                        <button
                          onClick={() =>
                            handleArrayFieldChange(
                              "strengths",
                              strength,
                              "remove"
                            )
                          }
                          className="ml-2 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="h-12 px-8 text-lg border-slate-300 hover:border-slate-400 transition-all duration-200"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    disabled={!canProceedToNext()}
                    className="h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Next Step
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Learning Preferences */}
          {currentStep === 4 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-slate-900 flex items-center">
                  <Star className="w-6 h-6 mr-3 text-blue-600" />
                  Learning Preferences
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Help us customize your learning experience and interview style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-slate-900">
                    Learning Style
                  </Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {learningStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() =>
                          handleProfileChange("learningStyle", style.value)
                        }
                        className={`p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                          profile.learningStyle === style.value
                            ? "border-blue-500 bg-blue-50 shadow-lg"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="font-semibold text-slate-900 mb-2">
                          {style.label}
                        </div>
                        <div className="text-sm text-slate-600">
                          {style.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-medium text-slate-900">
                    Interview Preferences
                  </Label>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Question Style
                      </Label>
                      <select
                        value={profile.interviewPreferences.questionStyle}
                        onChange={(e) =>
                          handleProfileChange("interviewPreferences", {
                            ...profile.interviewPreferences,
                            questionStyle: e.target.value,
                          })
                        }
                        className="w-full h-12 text-lg border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="balanced">
                          Balanced (Technical + Behavioral)
                        </option>
                        <option value="technical">Technical Focus</option>
                        <option value="behavioral">Behavioral Focus</option>
                        <option value="case-study">Case Study Focus</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Feedback Style
                      </Label>
                      <select
                        value={profile.interviewPreferences.feedbackStyle}
                        onChange={(e) =>
                          handleProfileChange("interviewPreferences", {
                            ...profile.interviewPreferences,
                            feedbackStyle: e.target.value,
                          })
                        }
                        className="w-full h-12 text-lg border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="detailed">
                          Detailed & Comprehensive
                        </option>
                        <option value="concise">Concise & Actionable</option>
                        <option value="encouraging">
                          Encouraging & Supportive
                        </option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Difficulty Level
                      </Label>
                      <select
                        value={profile.interviewPreferences.difficulty}
                        onChange={(e) =>
                          handleProfileChange("interviewPreferences", {
                            ...profile.interviewPreferences,
                            difficulty: e.target.value,
                          })
                        }
                        className="w-full h-12 text-lg border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="adaptive">
                          Adaptive (Based on your level)
                        </option>
                        <option value="beginner">Beginner Friendly</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Coins className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">
                      🎉 Almost there! Complete your profile to get 50 welcome
                      credits
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    You'll be able to start practicing interviews immediately
                    after profile completion.
                  </p>
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="h-12 px-8 text-lg border-slate-300 hover:border-slate-400 transition-all duration-200"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={saveProfile}
                    disabled={isSaving || !canProceedToNext()}
                    className="h-12 px-8 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-200 scale-100 animate-in zoom-in-95 duration-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-slate-900">
                  {modalTitle}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <p className="text-slate-600 text-sm">
                Enter the details below to add to your profile.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  {modalTitle}
                </Label>
                <Input
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  placeholder={modalPlaceholder}
                  className="h-12 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleModalSubmit();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      closeModal();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={closeModal}
                className="h-10 px-6 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleModalSubmit}
                disabled={!modalValue.trim()}
                className="h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
