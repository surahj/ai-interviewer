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
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Mic,
  Clock,
  Target,
  Save,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    experience: "",
    company: "",
  });

  const [interviewSettings, setInterviewSettings] = useState({
    defaultDuration: "15",
    defaultQuestions: "10",
    difficulty: "intermediate",
    categories: ["technical", "behavioral"],
    audioEnabled: true,
    autoSubmit: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    weeklyReports: true,
    achievementAlerts: true,
    reminderEmails: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirectTo=/dashboard/settings");
    } else if (user) {
      // Initialize form data with user data
      setProfileData({
        name: (user as any).user_metadata?.name || "",
        email: user.email || "",
        jobTitle: (user as any).user_metadata?.jobTitle || "",
        experience: (user as any).user_metadata?.experience || "",
        company: (user as any).user_metadata?.company || "",
      });
    }
  }, [user, loading, router]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Here you would update the user profile in Supabase
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
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
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {(user as any).user_metadata?.name || user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">
            Manage your account preferences and interview settings
          </p>
        </div>

        {/* Settings Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "interview"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mic className="w-4 h-4 inline mr-2" />
            Interview
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "notifications"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "security"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Security
          </button>
        </div>

        {/* Profile Settings */}
        {activeTab === "profile" && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Profile Information
              </CardTitle>
              <CardDescription className="text-slate-600">
                Update your personal information and professional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-slate-100"
                  />
                  <p className="text-xs text-slate-500">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profileData.jobTitle}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        jobTitle: e.target.value,
                      })
                    }
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select
                    value={profileData.experience}
                    onValueChange={(value) =>
                      setProfileData({ ...profileData, experience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-3">2-3 years</SelectItem>
                      <SelectItem value="4-5">4-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        company: e.target.value,
                      })
                    }
                    placeholder="e.g., Tech Corp"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Settings */}
        {activeTab === "interview" && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Interview Preferences
              </CardTitle>
              <CardDescription className="text-slate-600">
                Customize your default interview settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Default Interview Duration</Label>
                  <Select
                    value={interviewSettings.defaultDuration}
                    onValueChange={(value) =>
                      setInterviewSettings({
                        ...interviewSettings,
                        defaultDuration: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questions">Default Question Count</Label>
                  <Select
                    value={interviewSettings.defaultQuestions}
                    onValueChange={(value) =>
                      setInterviewSettings({
                        ...interviewSettings,
                        defaultQuestions: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Default Difficulty</Label>
                  <Select
                    value={interviewSettings.difficulty}
                    onValueChange={(value) =>
                      setInterviewSettings({
                        ...interviewSettings,
                        difficulty: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Categories</Label>
                  <div className="space-y-2">
                    {[
                      "technical",
                      "behavioral",
                      "problem-solving",
                      "leadership",
                    ].map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={interviewSettings.categories.includes(
                            category
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInterviewSettings({
                                ...interviewSettings,
                                categories: [
                                  ...interviewSettings.categories,
                                  category,
                                ],
                              });
                            } else {
                              setInterviewSettings({
                                ...interviewSettings,
                                categories: interviewSettings.categories.filter(
                                  (c) => c !== category
                                ),
                              });
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-700 capitalize">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-slate-600">
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    description: "Receive notifications via email",
                  },
                  {
                    key: "weeklyReports",
                    label: "Weekly Progress Reports",
                    description: "Get a summary of your weekly performance",
                  },
                  {
                    key: "achievementAlerts",
                    label: "Achievement Alerts",
                    description: "Get notified when you unlock achievements",
                  },
                  {
                    key: "reminderEmails",
                    label: "Practice Reminders",
                    description: "Receive reminders to practice regularly",
                  },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {setting.label}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {setting.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={
                        notificationSettings[
                          setting.key as keyof typeof notificationSettings
                        ]
                      }
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          [setting.key]: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Security Settings
              </CardTitle>
              <CardDescription className="text-slate-600">
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">
                    Change Password
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Update your account password for better security
                  </p>
                  <Button
                    variant="outline"
                    className="border-slate-300 hover:border-slate-400"
                  >
                    Change Password
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    Not Enabled
                  </Badge>
                  <Button
                    variant="outline"
                    className="ml-4 border-slate-300 hover:border-slate-400"
                  >
                    Enable 2FA
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">
                    Account Deletion
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:border-red-400 hover:text-red-700"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
