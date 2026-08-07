import { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, ShieldCheck, AlertCircle, Loader2, Copy, Check, ExternalLink, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signInWithGoogle, signInAsDemo, isAuthenticating, error, unauthorizedDomain, clearError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLocalLoading(true);
      await signInWithGoogle();
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCopyDomain = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLoading = isAuthenticating || localLoading;

  return (
    <div className="min-h-screen flex bg-[var(--bg-navy)] overflow-hidden font-sans text-[var(--text-primary)]">
      {/* Left Side: 60% with animated visualization */}
      <div className="hidden lg:flex flex-[3] relative items-center justify-center bg-[radial-gradient(ellipse_at_center,_#1a1f3a_0%,_#0b0f1a_70%)]">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Animated network lines */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute w-96 h-96 border border-[var(--border-glass)] rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
            className="absolute w-[500px] h-[500px] border border-[var(--border-glass)]/40 rounded-full border-dashed"
          />

          <div className="text-center font-['Clash_Display'] z-10 px-8">
            <Brain className="w-28 h-28 mx-auto text-[var(--accent-cyan)] mb-6 animate-pulse" />
            <h2 className="text-4xl font-bold tracking-tight">MedGuard AI</h2>
            <p className="text-[var(--text-secondary)] mt-2 text-lg">
              Enterprise Clinical Command & Equipment Management
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 text-xs text-[var(--text-secondary)] bg-[var(--card-bg)]/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-[var(--border-glass)] w-fit mx-auto">
              <ShieldCheck className="w-4 h-4 text-[var(--healthy-green)]" />
              <span>HIPAA Compliant & Real-time Equipment Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: 40% with glass login form */}
      <div className="flex-[2] flex flex-col justify-center items-center p-8 sm:p-12 relative w-full">
        <div className="absolute top-8 right-8 flex items-center gap-2 text-xs bg-[var(--card-bg)] px-4 py-2 rounded-full border border-[var(--border-glass)] text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-[var(--healthy-green)] animate-pulse" />
          All Systems Operational
        </div>

        <div className="w-full max-w-md glass p-8 sm:p-10 rounded-3xl border border-[var(--border-glass)] shadow-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 font-['Clash_Display'] text-[var(--text-primary)]">
              Welcome Back
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Sign in with your Google Workspace credentials to access the clinical command portal
            </p>
          </div>

          {unauthorizedDomain ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3"
            >
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                Firebase Domain Authorization Needed
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                Firebase OAuth requires adding your current origin domain to authorized domains in Firebase Console:
              </p>
              <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-amber-500/20 font-mono text-[11px] text-amber-100">
                <span className="truncate flex-1">{unauthorizedDomain}</span>
                <button
                  onClick={handleCopyDomain}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg flex items-center gap-1 font-sans transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-300/80">
                Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains and paste this domain.
              </p>
              <div className="pt-2 border-t border-amber-500/20 flex gap-2">
                <button
                  onClick={signInAsDemo}
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                >
                  <UserCheck size={16} /> Continue in Demo Mode
                </button>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-[var(--critical-red)]/10 border border-[var(--critical-red)]/30 text-red-300 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-[var(--critical-red)] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-200">Authentication Alert</p>
                <p className="text-xs text-red-300/80 mt-1">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-xs text-red-300 hover:text-white underline ml-2 cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          ) : null}

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-white hover:bg-gray-100 text-slate-900 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 shadow-lg disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                  <span className="text-slate-700">Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </motion.button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[var(--border-glass)] w-full" />
              <span className="bg-[var(--bg-navy)] px-3 text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                OR
              </span>
            </div>

            <button
              onClick={signInAsDemo}
              className="w-full py-3 px-4 glass hover:bg-[var(--card-bg)] text-[var(--text-primary)] rounded-xl font-medium text-xs flex items-center justify-center gap-2 border border-[var(--border-glass)] transition-all cursor-pointer"
            >
              <UserCheck size={16} className="text-[var(--accent-cyan)]" />
              <span>Enter as Demo Staff (Instant Preview)</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border-glass)] text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Restricted to authorized clinical staff and biomedical engineers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

