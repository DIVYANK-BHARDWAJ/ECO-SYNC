"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Key, KeyRound, Loader2, ShieldAlert, CheckCircle2, X, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { checkUserExists, sendOtp, verifyOtp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setMockOtpHint(null);

    let submissionIdentifier = email;
    // Sync state so verification uses the formatted identifier
    setEmail(submissionIdentifier);

    try {
      if (isSignUp) {
        // Sign Up check
        const check = await checkUserExists(submissionIdentifier);
        if (check.exists) {
          setErrorMsg("You already have an account, so sign in.");
          setLoading(false);
          return;
        }
      } else {
        // Sign In check
        const check = await checkUserExists(submissionIdentifier);
        if (!check.exists) {
          setErrorMsg("Your account is not created. Please sign up.");
          setLoading(false);
          return;
        }
      }

      // If sign up or user exists, send OTP
      const res = await sendOtp(submissionIdentifier, isSignUp);
      if (res.success) {
        setStep("otp");
        setSuccessMsg(isSignUp ? "Sign-up OTP sent successfully!" : "Verification OTP sent!");
        if (res.mockOtp) {
          setMockOtpHint(res.mockOtp);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 4) {
      setErrorMsg("Please enter a valid 4-digit code.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyOtp(email, otpCode);
      if (res.success) {
        setSuccessMsg(isSignUp ? "Account created successfully!" : "Logged in successfully!");
        setTimeout(() => {
          onClose();
          // Reset modal state
          setStep("email");
          setEmail("");
          setOtpCode("");
          setMockOtpHint(null);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Check code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMsg("");
    setSuccessMsg("");
    setStep("email");
    setMockOtpHint(null);
  };

  const autofillDemo = () => {
    setEmail("demo@ecosync.io");
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-zinc-100"
      >
        {/* Subtle Decorative Ambience */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-zinc-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-zinc-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2 font-heading">
            ECO-SYNC <span className="text-amber-500">NEXUS</span>
          </h2>
          <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-[0.3em] mt-1 font-bold">
            Energy Security System
          </p>
        </div>

        {/* Form State messages */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-200 leading-normal">{errorMsg}</p>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-200 leading-normal">{successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Steps */}
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleEmailSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase tracking-wider mb-2 font-bold">
                  Enter Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@ecosync.io"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-700 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-[85%] mx-auto py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:via-amber-500 hover:to-orange-500 text-zinc-950 font-bold rounded-2xl transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_4px_25px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_35px_rgba(245,158,11,0.45)] active:scale-[0.98] border border-amber-400/20 hover:border-amber-300/40 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initializing Access...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    {isSignUp ? "Generate Access Key" : "Request Access Key"}
                  </>
                )}
              </button>

              {/* Mode toggles */}
              <div className="flex flex-col gap-3 pt-4 border-t border-zinc-900 text-center">
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {isSignUp ? (
                    <>Already registered? <span className="text-amber-500 font-bold hover:underline">Sign In</span></>
                  ) : (
                    <>New user? <span className="text-amber-500 font-bold hover:underline">Create Account</span></>
                  )}
                </button>

                {!isSignUp && (
                  <button
                    type="button"
                    onClick={autofillDemo}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500/80 animate-pulse" />
                    Use Demo Email (demo@ecosync.io)
                  </button>
                )}
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleOtpSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase tracking-wider mb-2 font-bold">
                  Enter 4-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-700 rounded-xl pl-12 pr-4 py-4 text-3xl font-black text-white focus:outline-none tracking-[8px] text-center transition-all placeholder:text-zinc-700"
                  />
                </div>
                
                {/* {mockOtpHint && (
                  <p className="mt-4 text-center text-xs font-mono text-amber-500/80 border border-dashed border-amber-500/30 p-2 bg-amber-500/5 rounded-lg">
                    [Dev OTP code: {mockOtpHint}]
                  </p>
                )} */}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-[85%] mx-auto py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:via-amber-500 hover:to-orange-500 text-zinc-950 font-bold rounded-2xl transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_4px_25px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_35px_rgba(245,158,11,0.45)] active:scale-[0.98] border border-amber-400/20 hover:border-amber-300/40 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Unlock Access
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center block uppercase tracking-wider font-bold"
              >
                Change Email
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
