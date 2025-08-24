"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useAuth } from "./providers";
import {
  UserProfile,
  getUserProfile,
  hasCompletedProfile,
  getProfileCompletionPercentage,
} from "@/lib/user-profile";

interface UserProfileContextType {
  profile: UserProfile | null;
  hasCompletedProfile: boolean;
  profileCompletionPercentage: number;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastLoadedUserId = useRef<string | null>(null);

  const loadProfile = React.useCallback(async () => {
    if (!user || !user.id) {
      setProfile(null);
      setHasCompleted(false);
      setCompletionPercentage(0);
      setLoading(false);
      lastLoadedUserId.current = null;
      return;
    }

    // Prevent duplicate requests for the same user
    if (lastLoadedUserId.current === user.id) {
      return;
    }

    try {
      setLoading(true);
      lastLoadedUserId.current = user.id;

      // Use the API endpoint with user ID authentication
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error(
          "UserProfileProvider: Failed to fetch profile:",
          response.status
        );
        setProfile(null);
        setHasCompleted(false);
        setCompletionPercentage(0);
        return;
      }

      const { profile: userProfile } = await response.json();

      if (userProfile) {
        // Calculate completion status locally instead of making additional API calls
        const hasBasicInfo =
          userProfile.full_name &&
          userProfile.preferred_role &&
          userProfile.experience_level;
        const hasSkills = userProfile.skills && userProfile.skills.length > 0;
        const hasLearningPreferences =
          userProfile.learning_preferences &&
          (typeof userProfile.learning_preferences === "object"
            ? userProfile.learning_preferences.style
            : userProfile.learning_preferences);
        const completed = hasBasicInfo && hasSkills && hasLearningPreferences;

        // Calculate completion percentage
        const requiredFields = [
          "full_name",
          "preferred_role",
          "experience_level",
          "skills",
          "learning_preferences",
        ];

        const optionalFields = [
          "career_goals",
          "target_companies",
          "skill_gaps",
          "strengths",
          "weaknesses",
          "learning_goals",
          "preferred_interview_types",
          "availability",
          "timezone",
          "communication_preferences",
        ];

        const completedRequired = requiredFields.filter((field) => {
          const value = userProfile[field as keyof UserProfile];
          if (field === "learning_preferences") {
            return value && (typeof value === "object" ? value.style : value);
          }
          return value && (Array.isArray(value) ? value.length > 0 : true);
        }).length;

        const completedOptional = optionalFields.filter(
          (field) =>
            userProfile[field as keyof UserProfile] &&
            (Array.isArray(userProfile[field as keyof UserProfile])
              ? (userProfile[field as keyof UserProfile] as any[]).length > 0
              : true)
        ).length;

        const totalFields = requiredFields.length + optionalFields.length;
        const percentage = Math.round(
          ((completedRequired + completedOptional) / totalFields) * 100
        );

        setProfile(userProfile);
        setHasCompleted(completed);
        setCompletionPercentage(percentage);
      } else {
        setProfile(null);
        setHasCompleted(false);
        setCompletionPercentage(0);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setProfile(null);
      setHasCompleted(false);
      setCompletionPercentage(0);
      lastLoadedUserId.current = null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshProfile = React.useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (user?.id !== lastLoadedUserId.current) {
      loadProfile();
    }
  }, [user?.id, loadProfile]);

  const value: UserProfileContextType = {
    profile,
    hasCompletedProfile: hasCompleted,
    profileCompletionPercentage: completionPercentage,
    loading,
    refreshProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
