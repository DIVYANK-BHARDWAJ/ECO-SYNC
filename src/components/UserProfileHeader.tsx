"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, Key, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserProfileHeaderProps {
  onOpenAuth: () => void;
  onOpenSettings: () => void;
}

export default function UserProfileHeader({ onOpenAuth, onOpenSettings }: UserProfileHeaderProps) {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden font-mono">
              {user.avatarUrl && user.avatarUrl !== "" && user.avatarUrl !== "/avatars/nexus-default.png" ? (
                <img
                  src={user.avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading font-black text-amber-500 text-sm uppercase">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-white truncate max-w-[120px]">
                {user.name || "Explorer"}
              </p>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                Authorized
              </p>
            </div>
          </button>

          {/* Glassmorphic Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 shadow-2xl p-2 z-[210] overflow-hidden">
              {/* User Bio Preview */}
              {user.bio && (
                <div className="px-3 py-2 border-b border-zinc-900 mb-1">
                  <p className="text-[10px] font-medium text-zinc-400 italic leading-normal truncate">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 text-xs text-zinc-300 hover:text-white transition-colors font-bold text-left"
              >
                <Settings className="w-4 h-4 text-zinc-500" />
                Customize Profile
              </button>
              
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-950/30 hover:text-red-400 text-xs text-zinc-400 transition-colors font-bold text-left border-t border-zinc-900/60"
              >
                <LogOut className="w-4 h-4 text-red-500/70" />
                Disconnect System
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/10 font-heading"
        >
          <Key className="w-3.5 h-3.5" />
          Authorize Key
        </button>
      )}
    </div>
  );
}
