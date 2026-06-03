"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatarUrl: string;
  themeMode: "dark" | "light" | "system";
  costFactor: number;
  batteryCap: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  checkUserExists: (email: string) => Promise<{ exists: boolean; message?: string }>;
  sendOtp: (email: string, isSignUp: boolean) => Promise<{ success: boolean; message: string; mockOtp?: string }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; user: UserProfile }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for fetch with timeout
async function fetchWithTimeout(url: string, options: any = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { setThemeMode } = useTheme();

  // Load session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const savedEmail = localStorage.getItem("eco-sync-user-email");
        if (savedEmail) {
          try {
            const response = await fetchWithTimeout(`/api/auth/profile?email=${encodeURIComponent(savedEmail)}`, {}, 8000);

            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                setUser(data.user);
                if (data.user.themeMode) {
                  setThemeMode(data.user.themeMode);
                }
              }
            }
          } catch (fetchError) {
            console.warn("Session load fetch failed or timed out:", fetchError);
          }
        }
      } catch (e) {
        console.error("Failed to load user session", e);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkUserExists = async (email: string) => {
    const response = await fetchWithTimeout("/api/auth/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return response.json();
  };

  const sendOtp = async (email: string, isSignUp: boolean) => {
    const response = await fetchWithTimeout("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, isSignUp }),
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to send OTP");
    }
    
    return response.json();
  };

  const verifyOtp = async (email: string, code: string) => {
    const response = await fetchWithTimeout("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to verify OTP");
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem("eco-sync-user-email", data.user.email);
    
    if (data.user.themeMode) {
      setThemeMode(data.user.themeMode);
    }
    
    return { success: true, user: data.user };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("No user is logged in");

    const response = await fetchWithTimeout("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, ...updates }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to update profile");
    }

    const data = await response.json();
    setUser(data.user);
    
    if (updates.themeMode) {
      setThemeMode(updates.themeMode);
    }
    
    return data.user;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("eco-sync-user-email");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        checkUserExists,
        sendOtp,
        verifyOtp,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
