"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Loader2, ShieldAlert, CheckCircle2, Sparkles, Cpu, Globe, Key } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const { checkUserExists, sendOtp, verifyOtp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setMockOtpHint(null);

    try {
      if (!isSignUp) {
        // Sign In check
        const check = await checkUserExists(email);
        if (!check.exists) {
          setErrorMsg("Your account is not created. Please sign up.");
          setLoading(false);
          return;
        }
      }

      // Send OTP
      const res = await sendOtp(email, isSignUp);
      if (res.success) {
        setStep("otp");
        setSuccessMsg(isSignUp ? "Sign-up verification code dispatched!" : "Security access key dispatched!");
        if (res.mockOtp) {
          setMockOtpHint(res.mockOtp);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Protocol handshake failed. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 4) {
      setErrorMsg("Verification sequence requires a 4-digit token.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyOtp(email, otpCode);
      if (res.success) {
        setSuccessMsg("Security clearance granted. Initializing session...");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Signature check failed. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = (signUp: boolean) => {
    if (signUp === isSignUp) return;
    setIsSignUp(signUp);
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
    <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-6 overflow-hidden">
      {/* Immersive Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-zinc-950/60 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl relative text-zinc-100 flex flex-col justify-between"
      >
        {/* Futuristic Corner Indicators */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-zinc-700 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-zinc-700 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-zinc-700 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-zinc-700 rounded-br-3xl pointer-events-none" />

        <div>
          {/* Logo & Subtitle */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-400 uppercase mb-4">
              <Globe className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
              Security Gateway
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white font-heading">
              ECO-SYNC <span className="text-amber-500">NEXUS</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mt-1 font-bold">
              Energy Sovereignty Core
            </p>
          </div>

          {/* Form State messages */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-2xl bg-red-950/20 border border-red-900/40 flex items-start gap-3"
              >
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 leading-normal font-medium">{errorMsg}</p>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200 leading-normal font-medium">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          {step === "email" && (
            <div className="flex border-b border-zinc-900 mb-8 p-1 bg-zinc-900/30 rounded-xl">
              <button
                type="button"
                onClick={() => toggleAuthMode(false)}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-lg transition-all font-bold ${
                  !isSignUp
                    ? "bg-zinc-900 text-white border border-zinc-800 shadow"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Operator Sign In
              </button>
              <button
                type="button"
                onClick={() => toggleAuthMode(true)}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-lg transition-all font-bold ${
                  isSignUp
                    ? "bg-zinc-900 text-white border border-zinc-800 shadow"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Provision Node
              </button>
            </div>
          )}

          {/* Steps Rendering */}
          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleEmailSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="block text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                    Email Signature Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@ecosync.io"
                      className="w-full bg-zinc-900/40 border border-zinc-800/80 focus:border-zinc-700 focus:bg-zinc-900/80 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-700 font-medium"
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
                      Authenticating Node...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      {isSignUp ? "Generate Credentials Key" : "Request Credentials Key"}
                    </>
                  )}
                </button>

                {/* Autofill Demo */}
                {!isSignUp && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={autofillDemo}
                      className="text-[9px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto py-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500/80 animate-pulse" />
                      Autofill Demo Operator Address
                    </button>
                  </div>
                )}
              </motion.form>
            ) : (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleOtpSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="block text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                    System Access Token (OTP)
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
                      className="w-full bg-zinc-900/40 border border-zinc-800/80 focus:border-zinc-700 focus:bg-zinc-900/80 rounded-xl pl-12 pr-4 py-4 text-3xl font-black text-white focus:outline-none tracking-[8px] text-center transition-all placeholder:text-zinc-800 font-mono"
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
                      Granting Clearance...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-5 h-5" />
                      Confirm Security Token
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors text-center uppercase tracking-wider font-bold block"
                >
                  Back to operator credentials
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer legal/security note */}
        <div className="mt-12 text-center">
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
            ECO-SYNC NEXUS SECURE ENCRYPTED NODE HANDSHAKE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
