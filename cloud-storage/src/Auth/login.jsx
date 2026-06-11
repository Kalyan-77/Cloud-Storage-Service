import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, ShieldCheck, HardDrive, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { BASE_URL } from '../../config';
import Loading from '../Components/Loading';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, refreshUser } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors('');
    setLoading(true);

    try {      
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMsg(data.message || 'Login Successful...');
        setEmail('');
        setPassword('');

        // Refresh global auth context so navbar updates immediately
        try {
          if (refreshUser) await refreshUser();
        } catch (err) {
          // fallback: set user directly if refresh fails and user returned
          if (data && data.user) setUser(data.user);
        }

        // Navigate to dashboard
        navigate('/dashboardHome');
      } else {
        setErrors(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setErrors('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />

      <div className="relative z-10 flex h-full items-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid h-[min(720px,calc(100vh-2rem))] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative hidden items-center overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-8 py-10 text-white lg:flex lg:px-12">
            <div className="absolute inset-0 opacity-25">
              <div className="absolute -left-20 top-12 h-44 w-44 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-300 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-md">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4" />
                MyCloud secure access
              </div>
              <h1 className="text-4xl font-bold leading-tight xl:text-5xl">Welcome back to your cloud workspace.</h1>
              <p className="mt-4 text-base leading-7 text-blue-50 xl:text-lg">
                Sign in to manage files, configure your storage, and continue where you left off across the project dashboard.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <ShieldCheck className="h-6 w-6" />
                  <p className="mt-3 text-sm font-semibold">Protected sessions</p>
                  <p className="mt-1 text-sm text-blue-50/90">Secure login with the same auth flow used throughout the app.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <HardDrive className="h-6 w-6" />
                  <p className="mt-3 text-sm font-semibold">Storage tools</p>
                  <p className="mt-1 text-sm text-blue-50/90">Quick access to your dashboard, configs, and file workflows.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex h-full items-center overflow-hidden bg-white px-6 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Sign in</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Login to your account</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use your registered email and password to continue to the dashboard.
                </p>
              </div>

              {msg && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{msg}</p>
                </div>
              )}

              {errors && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                  <p className="text-sm font-medium">{errors}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Remember me
                  </label>
                  <Link to="/forgetPassword" className="font-medium text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:translate-y-[-1px] hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loading size="xs" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">or continue with</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  aria-label="Continue with Google"
                  onClick={()=>{
                  window.location.href=
                  `${BASE_URL}/auth/google`;
                }}
                >
                  <img src="/Google.png" alt="Google" className="h-5 w-5 object-contain" />
                  Continue with Google
                </button>

                <p className="pt-2 text-center text-sm text-slate-600">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                    Create one
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;