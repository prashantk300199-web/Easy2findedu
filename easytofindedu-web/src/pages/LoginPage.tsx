import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, type RegisterData, type UserRole } from '../contexts/AuthContext';
import { IMG } from '../lib/images';

/* ─── types ──────────────────────────────────────────────── */

type Tab = 'student' | 'partner';
type PartnerKind = 'owner' | 'institute_owner';
type Step = 'auth' | 'otp';
type AuthMode = 'login' | 'register';

/* ─── helpers ────────────────────────────────────────────── */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

async function loadGsi(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById('gsi-script')) { resolve(); return; }
    const s = document.createElement('script');
    s.id = 'gsi-script';
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          prompt: (cb?: (n: { isNotDisplayed: () => boolean }) => void) => void;
        };
      };
    };
  }
}

/* ─── sub-components ─────────────────────────────────────── */

function Field({
  label, type = 'text', name, value, onChange, placeholder, required = true,
}: {
  label: string; type?: string; name: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-overline text-gold-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={type === 'password' ? 'current-password' : 'on'}
        className="w-full border-0 border-b border-cream-300 bg-transparent py-3 text-[15px] text-night-800 placeholder:text-ink-300 focus:border-gold-500 focus:outline-none transition-colors duration-300"
      />
    </div>
  );
}

function GoogleBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center justify-center gap-3 border border-cream-300 bg-cream-50 py-3.5 text-[13px] text-night-800 transition-all duration-300 hover:border-gold-500 hover:bg-cream-100 disabled:opacity-50"
    >
      {/* Google G mark */}
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Continue with Google
    </button>
  );
}

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.4, ease: "easeOut" as const },
} as const;

/* ─── page ───────────────────────────────────────────────── */

export function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [tab, setTab] = useState<Tab>('student');
  const [partnerKind, setPartnerKind] = useState<PartnerKind>('owner');
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<Step>('auth');
  const [pendingEmail, setPendingEmail] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    gender: '', lastQualification: '', otp: '',
  });

  const role: UserRole = tab === 'student' ? 'student' : partnerKind;

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const afterAuth = () => {
    if (role === 'institute_owner') navigate('/institute-dashboard');
    else if (role === 'owner') navigate('/dashboard');
    else navigate('/');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    auth.clearError();
    try {
      if (step === 'otp') {
        await auth.verifyOtp(pendingEmail, form.otp, role);
        afterAuth();
        return;
      }
      if (mode === 'login') {
        await auth.login(form.email, form.password, role);
        afterAuth();
      } else {
        const data: RegisterData = {
          name: form.name, email: form.email,
          phone: form.phone, password: form.password,
          ...(role === 'student' && { gender: form.gender, lastQualification: form.lastQualification }),
        };
        await auth.register(data, role);
        setPendingEmail(form.email);
        setStep('otp');
      }
    } catch { /* error shown from context */ }
  }

  async function handleGoogle() {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com') {
      alert('Google Sign-In is not configured yet.\n\nAdd your VITE_GOOGLE_CLIENT_ID to the .env file and restart the dev server.');
      return;
    }
    await loadGsi();
    if (!window.google) {
      alert('Google Sign-In script failed to load. Check your internet connection.');
      return;
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        try {
          await auth.googleLogin(response.credential, role);
          afterAuth();
        } catch { /* error shown via auth.error */ }
      },
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        alert('Google Sign-In popup was blocked or could not open. Try allowing popups for this site.');
      }
    });
  }

  const partnerLabel = partnerKind === 'owner' ? 'Hostel Owner' : 'Institute Owner';

  return (
    <div className="relative flex min-h-screen bg-cream">
      {/* Left — cinematic image panel, hidden on mobile */}
      <div className="relative hidden w-[45%] overflow-hidden lg:block">
        <img src={IMG.hero} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-night-900/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <Link to="/" className="mb-auto inline-block">
            <span className="font-display text-[22px] text-cream-100">
              EasyToFind<span className="text-gold-500">Edu</span>
            </span>
          </Link>
          <blockquote className="max-w-sm">
            <p className="font-display text-[28px] italic leading-snug text-cream-100">
              "The right institution changes everything that comes after."
            </p>
            <footer className="mt-6 text-[11px] uppercase tracking-overline text-gold-400">
              — Verified by 1,000+ students
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 lg:px-20">
        {/* Mobile logo */}
        <Link to="/" className="mb-10 lg:hidden">
          <span className="font-display text-[22px] text-night-800">
            EasyToFind<span className="text-gold-500">Edu</span>
          </span>
        </Link>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex gap-0 border-b border-cream-300 mb-10">
            {(['student', 'partner'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setStep('auth'); auth.clearError(); }}
                className="relative flex-1 pb-4 text-[12px] uppercase tracking-wide2 transition-colors duration-300"
              >
                <span className={tab === t ? 'text-gold-700' : 'text-ink-400'}>
                  {t === 'student' ? 'Student' : 'Business Partner'}
                </span>
                {tab === t && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab + partnerKind + mode + step} {...slide}>

              {/* Partner kind toggle */}
              {tab === 'partner' && step === 'auth' && (
                <div className="mb-8 flex gap-3">
                  {(['owner', 'institute_owner'] as PartnerKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setPartnerKind(k)}
                      className={`flex-1 py-3 text-[12px] uppercase tracking-wide2 border transition-colors duration-300 ${
                        partnerKind === k
                          ? 'border-gold-500 bg-gold-500 text-night-800'
                          : 'border-cream-300 text-ink-500 hover:border-gold-500/50'
                      }`}
                    >
                      {k === 'owner' ? 'Hostel Owner' : 'Institute Owner'}
                    </button>
                  ))}
                </div>
              )}

              {/* Heading */}
              <div className="mb-8">
                <h1 className="font-display text-[32px] text-night-800">
                  {step === 'otp'
                    ? 'Verify your email'
                    : mode === 'login'
                      ? `Welcome back`
                      : `Create account`}
                </h1>
                <p className="mt-2 text-sm text-ink-500">
                  {step === 'otp'
                    ? `Enter the 6-digit code sent to ${pendingEmail}`
                    : mode === 'login'
                      ? tab === 'student' ? 'Sign in to your student account' : `Sign in as ${partnerLabel}`
                      : tab === 'student' ? 'Join thousands of students finding their path' : `Register as ${partnerLabel}`}
                </p>
              </div>

              {/* Error */}
              {auth.error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 border-l-2 border-wine bg-cream-200 px-5 py-3 text-sm text-wine"
                >
                  {auth.error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {step === 'otp' ? (
                  <>
                    <Field label="One-time password" name="otp" value={form.otp} onChange={set('otp')}
                      placeholder="6-digit code" />
                    <button type="button" onClick={() => auth.resendOtp(pendingEmail, role)}
                      className="text-xs text-gold-600 hover:underline">
                      Resend code
                    </button>
                  </>
                ) : (
                  <>
                    {mode === 'register' && (
                      <>
                        <Field label="Full name" name="name" value={form.name} onChange={set('name')} />
                        <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={set('phone')} />
                        {tab === 'student' && (
                          <>
                            <div className="space-y-1.5">
                              <label className="block text-[11px] uppercase tracking-overline text-gold-600">Gender</label>
                              <select value={form.gender} onChange={(e) => set('gender')(e.target.value)}
                                className="w-full border-0 border-b border-cream-300 bg-transparent py-3 text-[15px] text-night-800 focus:border-gold-500 focus:outline-none">
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[11px] uppercase tracking-overline text-gold-600">Last qualification</label>
                              <select value={form.lastQualification} onChange={(e) => set('lastQualification')(e.target.value)}
                                className="w-full border-0 border-b border-cream-300 bg-transparent py-3 text-[15px] text-night-800 focus:border-gold-500 focus:outline-none">
                                <option value="">Select qualification</option>
                                <option value="10th">Class 10th</option>
                                <option value="12th">Class 12th</option>
                                <option value="Graduation">Graduation</option>
                                <option value="Post Graduation">Post Graduation</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </>
                        )}
                      </>
                    )}
                    <Field label="Email address" name="email" type="email" value={form.email} onChange={set('email')} />
                    <Field label="Password" name="password" type="password" value={form.password} onChange={set('password')} />
                  </>
                )}

                <motion.button
                  type="submit"
                  disabled={auth.loading}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="mt-2 w-full bg-night-800 py-4 text-[12px] uppercase tracking-wide2 text-cream-100 transition-colors duration-300 hover:bg-gold-600 disabled:opacity-60"
                >
                  {auth.loading
                    ? 'Please wait…'
                    : step === 'otp'
                      ? 'Verify & continue'
                      : mode === 'login' ? 'Sign in' : 'Create account'}
                </motion.button>
              </form>

              {step !== 'otp' && (
                <>
                  <div className="my-7 flex items-center gap-4">
                    <span className="h-px flex-1 bg-cream-300" />
                    <span className="text-[11px] uppercase tracking-overline text-ink-400">or</span>
                    <span className="h-px flex-1 bg-cream-300" />
                  </div>
                  <GoogleBtn onClick={handleGoogle} disabled={auth.loading} />
                </>
              )}

              {/* Toggle login / register */}
              {step !== 'otp' && (
                <p className="mt-8 text-center text-sm text-ink-500">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); auth.clearError(); }}
                    className="text-gold-600 hover:underline"
                  >
                    {mode === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
