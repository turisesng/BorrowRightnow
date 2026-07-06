import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mail, Lock, User, Phone, Key, ArrowRight, ShieldCheck, 
  AlertCircle, CheckCircle2, RefreshCw, Smartphone, HelpCircle, Eye, EyeOff
} from 'lucide-react';

export function AuthScreen() {
  const {
    isSupabaseConfigured,
    signInWithSupabase,
    signUpWithSupabase,
    signInWithPhone,
    signInWithEmailOtp,
    verifyOtpToken,
    signInWithProvider,
    sendPasswordReset,
    updatePasswordWithSupabase
  } = useApp();

  // Auth Modes: 'signin' | 'signup' | 'phone_otp' | 'email_otp' | 'forgot' | 'reset_password'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'phone_otp' | 'email_otp' | 'forgot' | 'reset_password'>(() => {
    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('reset-password')) {
      return 'reset_password';
    }
    return 'signin';
  });

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP targeting (keep track of what we sent to)
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [otpType, setOtpType] = useState<'sms' | 'email'>('sms');

  // Listen to URL hash for password recovery
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.includes('type=recovery') || window.location.hash.includes('reset-password')) {
        setAuthMode('reset_password');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleClearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    handleClearMessages();

    try {
      const { error } = await signInWithSupabase(email, password);
      if (error) {
        setErrorMsg(error.message || 'Failed to sign in. Please verify your credentials.');
      } else {
        setSuccessMsg('Successfully logged in!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    setLoading(true);
    handleClearMessages();

    try {
      const { error } = await signUpWithSupabase(email, password, fullName);
      if (error) {
        setErrorMsg(error.message || 'Failed to register. Please try another email.');
      } else {
        setSuccessMsg('Registration successful! Please check your email inbox to verify your account or sign in directly.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    handleClearMessages();

    try {
      const { error } = await signInWithPhone(phone);
      if (error) {
        setErrorMsg(error.message || 'Failed to send SMS OTP. Verify your phone format (e.g. +2348123456789).');
      } else {
        setOtpSentTo(phone);
        setOtpType('sms');
        setSuccessMsg(`An activation OTP has been sent to ${phone}. Enter it below.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    handleClearMessages();

    try {
      const { error } = await signInWithEmailOtp(email);
      if (error) {
        setErrorMsg(error.message || 'Failed to send Email OTP. Check your email format.');
      } else {
        setOtpSentTo(email);
        setOtpType('email');
        setSuccessMsg(`A sign-in code has been sent to your email: ${email}. Enter it below.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSentTo || !otpToken) return;
    setLoading(true);
    handleClearMessages();

    try {
      const { error } = await verifyOtpToken(otpSentTo, otpToken, otpType);
      if (error) {
        setErrorMsg(error.message || 'Invalid token. Please check the code and try again.');
      } else {
        setSuccessMsg('OTP Verified! Welcome back.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    handleClearMessages();

    try {
      const { error } = await sendPasswordReset(email);
      if (error) {
        setErrorMsg(error.message || 'Failed to submit reset link. Verify your email.');
      } else {
        setSuccessMsg('If the email matches an active account, a password recovery link has been sent to your inbox.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    handleClearMessages();

    try {
      const { error } = await updatePasswordWithSupabase(newPassword);
      if (error) {
        setErrorMsg(error.message || 'Failed to update your password.');
      } else {
        setSuccessMsg('Your password has been successfully updated! Redirecting to login...');
        setTimeout(() => {
          window.location.hash = '';
          setAuthMode('signin');
          setNewPassword('');
          setConfirmPassword('');
          setSuccessMsg(null);
        }, 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    handleClearMessages();
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        setErrorMsg(error.message || `Failed to initialize ${provider} login.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OAuth error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="h-14 w-14 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
              !
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Supabase Cloud Required</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              BorrowRight AI operates with production-ready PostgreSQL Cloud database, schemas, triggers, and authentications. To access the suite, you must bind your own Supabase credentials.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">How to configure keys:</span>
            <ol className="text-xs text-slate-600 dark:text-slate-350 list-decimal pl-4 space-y-2 font-medium">
              <li>Open the <span className="font-bold text-slate-800 dark:text-slate-100">Settings</span> menu at the top-right of AI Studio.</li>
              <li>Go to <span className="font-bold text-slate-800 dark:text-slate-100">Secrets</span> panel.</li>
              <li>Declare the following two keys:
                <div className="mt-1 font-mono text-[10px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 rounded-lg space-y-0.5 text-slate-500">
                  <div className="flex justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">VITE_SUPABASE_URL</span>
                    <span>Your Project URL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">VITE_SUPABASE_ANON_KEY</span>
                    <span>Your Anon Public Key</span>
                  </div>
                </div>
              </li>
              <li>Save changes, and the system will automatically reload and unlock authentications.</li>
            </ol>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> SECURED SUPABASE OAUTH ENGINE
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      {/* Container Card */}
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-3xl p-8 shadow-xl space-y-6 animate-scaleUp">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-11 w-11 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20 mx-auto">
            BR
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">BorrowRight AI</h1>
            <p className="text-xs text-slate-400">Lending Compliance & Financial Advisory</p>
          </div>
        </div>

        {/* Global Error/Success Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex gap-2 items-start text-xs animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex gap-2 items-start text-xs animate-scaleUp">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Dynamic Forms */}
        {otpSentTo ? (
          /* OTP TOKEN INPUT STAGE */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Enter Verification Code</span>
              <p className="text-xs text-slate-400 leading-normal">
                Please input the activation code.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">One-Time Token</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="otp-token-input"
                  type="text"
                  required
                  placeholder="123456"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-center"
                />
              </div>
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              Confirm Verification
            </button>

            <button
              id="cancel-otp-btn"
              type="button"
              onClick={() => setOtpSentTo(null)}
              className="w-full text-slate-400 hover:text-slate-600 text-xs py-1.5 font-bold cursor-pointer block text-center"
            >
              Back to Sign-in
            </button>
          </form>
        ) : authMode === 'signin' ? (
          /* SIGN IN FORM */
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@borrowright.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Password</label>
                <button
                  id="forgot-password-link"
                  type="button"
                  onClick={() => { handleClearMessages(); setAuthMode('forgot'); }}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="signin-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              Access Account <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="phone-otp-switch"
                type="button"
                onClick={() => { handleClearMessages(); setAuthMode('phone_otp'); }}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-700 text-[10px] py-2 rounded-xl font-bold border border-slate-100 dark:border-slate-850 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" /> Phone SMS OTP
              </button>
              <button
                id="email-otp-switch"
                type="button"
                onClick={() => { handleClearMessages(); setAuthMode('email_otp'); }}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-700 text-[10px] py-2 rounded-xl font-bold border border-slate-100 dark:border-slate-850 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-600" /> Email OTP Code
              </button>
            </div>

            <div className="text-center text-[11px] text-slate-400">
              New to BorrowRight?{' '}
              <button
                id="switch-to-signup"
                type="button"
                onClick={() => { handleClearMessages(); setAuthMode('signup'); }}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </div>
          </form>
        ) : authMode === 'signup' ? (
          /* SIGN UP FORM */
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  placeholder="Debbie Ijogbonna"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="name@borrowright.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Choose Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              Register Platform Account <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="text-center text-[11px] text-slate-400">
              Already have an account?{' '}
              <button
                id="switch-to-signin"
                type="button"
                onClick={() => { handleClearMessages(); setAuthMode('signin'); }}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </form>
        ) : authMode === 'phone_otp' ? (
          /* PHONE OTP REQUEST STAGE */
          <form onSubmit={handleSendPhoneOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">SMS OTP Authentication</span>
              <p className="text-xs text-slate-400 leading-normal">
                Enter your cell number to verify or register instantly.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phone Number (with country code)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="otp-phone-input"
                  type="tel"
                  required
                  placeholder="+2348123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <button
              id="send-phone-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              Send SMS OTP Verification Code
            </button>

            <button
              id="back-from-phone-btn"
              type="button"
              onClick={() => { handleClearMessages(); setAuthMode('signin'); }}
              className="w-full text-slate-400 hover:text-slate-600 text-xs py-1.5 font-bold cursor-pointer block text-center"
            >
              Back to Email Login
            </button>
          </form>
        ) : authMode === 'email_otp' ? (
          /* EMAIL OTP REQUEST STAGE */
          <form onSubmit={handleSendEmailOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Email OTP Authentication</span>
              <p className="text-xs text-slate-400 leading-normal">
                No password required. Enter your email to receive a dynamic code.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="otp-email-input"
                  type="email"
                  required
                  placeholder="name@borrowright.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <button
              id="send-email-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              Send Email OTP Code
            </button>

            <button
              id="back-from-email-otp-btn"
              type="button"
              onClick={() => { handleClearMessages(); setAuthMode('signin'); }}
              className="w-full text-slate-400 hover:text-slate-600 text-xs py-1.5 font-bold cursor-pointer block text-center"
            >
              Back to Email Login
            </button>
          </form>
        ) : authMode === 'forgot' ? (
          /* FORGOT PASSWORD REQUEST STAGE */
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Reset Credentials</span>
              <p className="text-xs text-slate-400 leading-normal">
                We'll transmit a secure link to restore access to your workspace.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="forgot-email-input"
                  type="email"
                  required
                  placeholder="name@borrowright.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <button
              id="forgot-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              Transmit Recovery Link
            </button>

            <button
              id="back-from-forgot-btn"
              type="button"
              onClick={() => { handleClearMessages(); setAuthMode('signin'); }}
              className="w-full text-slate-400 hover:text-slate-600 text-xs py-1.5 font-bold cursor-pointer block text-center"
            >
              Back to Sign-in
            </button>
          </form>
        ) : (
          /* RESET PASSWORD FORM (RECOVERY REDIRECT) */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Update Password</span>
              <p className="text-xs text-slate-400 leading-normal">
                Set a strong, new password for your account.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="reset-confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              Modify Platform Password
            </button>
          </form>
        )}

        {/* OAuth Dividers & Providers */}
        {!otpSentTo && authMode !== 'reset_password' && (
          <div className="space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-150 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 absolute uppercase tracking-widest">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Google OAuth */}
              <button
                id="oauth-google"
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              {/* Apple OAuth */}
              <button
                id="oauth-apple"
                type="button"
                onClick={() => handleOAuth('apple')}
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08.31.11.45.11.85 0 1.71-.63 2.37-1.44" />
                </svg>
                Apple
              </button>
            </div>
          </div>
        )}

        {/* Bottom Lock Icon */}
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> SUPABASE MFA ACTIVE
          </span>
        </div>

      </div>
    </div>
  );
}
