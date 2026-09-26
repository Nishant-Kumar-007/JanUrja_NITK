// ==============================================================================
// JanUrja Secure Supabase Email Authentication Suite
// Implements:
// 1. Sign Up (Name, Email, Password, Confirm, Role: consumer/producer/prosumer)
// 2. Email Verification with Resend option & expired token handling
// 3. Login with verified email check & strict sanitized error reporting
// 4. Forgot Password & Secure Reset Password flow
// 5. Session Management & Protected route redirection
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Leaf,
  Clock,
  Send,
  HelpCircle,
  KeyRound
} from 'lucide-react';

// Password Strength Validator
export function evaluatePasswordStrength(password) {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let score = 0;
  if (minLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    score, // 0 to 4
    isStrong: minLength && (hasUpper || hasLower) && hasNumber && hasSpecial
  };
}

// ------------------------------------------------------------------------------
// Main Auth Container (Tabs: Login, Signup, Forgot Password, Reset Password, Verify Email)
// ------------------------------------------------------------------------------
export default function AuthPage({ initialMode = 'login' }) {
  const {
    currentView,
    setCurrentView,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    updatePassword,
    resendVerificationEmail,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    profiles,
    switchPersona,
    isLiveSupabaseAvailable
  } = useApp();

  // Mode: 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email'
  const [mode, setMode] = useState(initialMode);

  // Sync mode with currentView
  useEffect(() => {
    if (['login', 'signup', 'forgot-password', 'reset-password', 'verify-email'].includes(currentView)) {
      setMode(currentView);
    }
  }, [currentView]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setCurrentView(newMode);
    setError('');
    setSuccess('');
  };

  // Shared Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('consumer'); // 'consumer' | 'producer' | 'prosumer'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password evaluation on signup/reset
  const passStrength = evaluatePasswordStrength(password);

  // Email format validation
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ----------------------------------------------------------------------------
  // 1. SIGN IN HANDLER
  // ----------------------------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(email, password);
    setLoading(false);

    if (!result.success) {
      if (result.isUnverified) {
        setPendingVerificationEmail(email);
        switchMode('verify-email');
        return;
      }
      setError(result.error || 'Invalid email or password.');
    }
  };

  // ----------------------------------------------------------------------------
  // 2. SIGN UP HANDLER
  // ----------------------------------------------------------------------------
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name or household name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!passStrength.isStrong) {
      setError('Password must be at least 8 characters and include uppercase, numbers, and special characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail({
      name: name.trim(),
      email: email.trim(),
      password,
      role
    });
    setLoading(false);

    if (result.success) {
      setPendingVerificationEmail(email);
      setSuccess('Registration successful! Please check your inbox to verify your email address.');
      switchMode('verify-email');
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  // ----------------------------------------------------------------------------
  // 3. FORGOT PASSWORD HANDLER
  // ----------------------------------------------------------------------------
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await sendPasswordReset(email);
    setLoading(false);

    if (result.success) {
      setSuccess('Password reset link has been dispatched to your email. Please check your inbox.');
    } else {
      setError(result.error || 'Unable to process password reset request.');
    }
  };

  // ----------------------------------------------------------------------------
  // 4. RESET PASSWORD HANDLER
  // ----------------------------------------------------------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passStrength.isStrong) {
      setError('New password must be at least 8 characters with numbers, uppercase, and special symbols.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.success) {
      setSuccess('Password updated successfully! You can now log in with your new credentials.');
      setTimeout(() => switchMode('login'), 2000);
    } else {
      setError(result.error || 'Failed to update password. Your recovery link may have expired.');
    }
  };

  // ----------------------------------------------------------------------------
  // 5. RESEND VERIFICATION EMAIL
  // ----------------------------------------------------------------------------
  const handleResendVerification = async () => {
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail || !isValidEmail(targetEmail)) {
      setError('Please provide a valid email address to resend confirmation.');
      return;
    }

    setLoading(true);
    const result = await resendVerificationEmail(targetEmail);
    setLoading(false);

    if (result.success) {
      setSuccess(`Verification email re-dispatched to ${targetEmail}.`);
      setResendCooldown(60);
    } else {
      setError(result.error || 'Unable to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1512] via-[#12231E] to-[#0A110F] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      
      {/* Decorative Sustainability Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6 animate-in fade-in duration-300">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center space-x-2.5 p-2 px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="JanUrja Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              Jan<span className="text-[#2ECC71]">Urja</span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              Universal Energy Interface
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === 'login' && 'Sign in to Jan Urja'}
            {mode === 'signup' && 'Create Prosumer Account'}
            {mode === 'forgot-password' && 'Reset Your Password'}
            {mode === 'reset-password' && 'Set New Password'}
            {mode === 'verify-email' && 'Email Verification Required'}
          </h1>
          {mode !== 'login' && (
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {mode === 'signup' && 'Join your local 11kV microgrid feeder segment as a Consumer or Solar Producer.'}
              {mode === 'forgot-password' && 'Enter your registered email and we will send you a secure password recovery link.'}
              {mode === 'reset-password' && 'Choose a strong, secure password to regain access to your energy account.'}
              {mode === 'verify-email' && 'To protect your energy node & wallet, verified email authentication is mandatory.'}
            </p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800">
          
          {/* Header Pill */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isLiveSupabaseAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-xs font-bold text-slate-700">
                {isLiveSupabaseAvailable ? 'Supabase Auth Cloud' : 'Supabase Auth'}
              </span>
            </div>
          </div>

          {/* Navigation Toggle for Login & Signup */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#1B4D3E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#1B4D3E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Status Notifications */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{success}</div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW A: LOGIN FORM                                               */}
          {/* ================================================================ */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="user@janurja.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot-password')}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#1B4D3E] hover:bg-[#246B56] text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Verifying with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================================================================ */}
          {/* VIEW B: SIGN UP FORM                                              */}
          {/* ================================================================ */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name / Household Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Aditya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="aditya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* User Role Selection: Consumer, Producer, Prosumer */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Energy Network Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('consumer')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'consumer'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="text-base block">⚡</span>
                    <span className="text-[11px] block mt-0.5">Consumer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('producer')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'producer'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="text-base block">☀️</span>
                    <span className="text-[11px] block mt-0.5">Producer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('prosumer')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'prosumer'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="text-base block">🔄</span>
                    <span className="text-[11px] block mt-0.5">Prosumer</span>
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 chars, uppercase, number & symbol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 rounded-full transition-colors ${
                            passStrength.score >= step
                              ? step <= 2
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{passStrength.isStrong ? '✓ Strong Password' : 'Requires 8+ chars, upper, number, symbol'}</span>
                      <span className={passStrength.isStrong ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {passStrength.score <= 2 ? 'Weak' : passStrength.score === 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (password.length > 0 && !passStrength.isStrong)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B4D3E] to-[#246B56] hover:brightness-110 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-3 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Registering with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Create Jan Urja Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================================================================ */}
          {/* VIEW C: EMAIL VERIFICATION REQUIRED                               */}
          {/* ================================================================ */}
          {mode === 'verify-email' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                <Mail className="w-7 h-7 text-amber-600 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-base text-slate-900">
                  Verify your email address
                </h3>
                <p className="text-xs text-slate-600">
                  A Supabase verification link has been sent to:
                </p>
                <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 py-1 px-3 rounded-lg inline-block border border-emerald-200">
                  {pendingVerificationEmail || email || 'your email'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Why verify?</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Decentralized energy trading on Jan Urja involves automated micro-settlement contracts and wheeling fees. Unverified accounts cannot access the dashboard or trade energy.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading || resendCooldown > 0}
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend verification email'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Return to Log In
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW D: FORGOT PASSWORD                                           */}
          {/* ================================================================ */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                Enter your account email. If registered in Supabase Auth, you will receive a secure single-use recovery link.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="user@janurja.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#1B4D3E] hover:bg-[#246B56] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Sending Recovery Email...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Back to Log In
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* VIEW E: RESET PASSWORD                                            */}
          {/* ================================================================ */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                Enter and confirm your new password below.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 chars, numbers, uppercase, symbols"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !passStrength.isStrong || password !== confirmPassword}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B4D3E] to-[#246B56] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Set New Password & Log In</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>


      </div>
    </div>
  );
}
