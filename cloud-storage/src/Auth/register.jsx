import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, ShieldCheck, HardDrive, Sparkles, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';
import Loading from '../Components/Loading';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors) setErrors('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors('');

    if (formData.password !== formData.confirmPassword) {
      setErrors('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMsg('Successfully Registered...');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });

        navigate('/login');
      } else {
        setErrors(data.message || 'Email Already Exists!!');
      }
    } catch (err) {
      console.error(err);
      setErrors('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.14),_transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />

      <div className="relative z-10 min-h-screen flex items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative order-2 flex items-center overflow-hidden bg-white px-6 py-10 sm:px-10 lg:order-1 lg:px-12">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(59,130,246,0.04),rgba(14,165,233,0.08))]" />
            <div className="absolute -right-24 top-8 h-56 w-56 rounded-full bg-blue-100 blur-3xl" />

            <div className="relative z-10 mx-auto w-full max-w-md">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Create account</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Join the cloud workspace</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Register once and start using the same dashboard, drive tools, and configuration panels as the rest of the app.
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
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-name">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-confirm-password">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">What you get</p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600" />
                      Dashboard access
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600" />
                      File management tools
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600" />
                      Cloud configuration
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-600" />
                      Profile settings
                    </div>
                  </div>
                </div> */}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:translate-y-[-1px] hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loading size="xs" />
                      Creating account...
                    </span>
                  ) : (
                    <>
                      Register
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
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </section>

          <section className="relative order-1 flex items-center overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-8 py-12 text-white sm:px-12 lg:order-2 lg:px-14">
            <div className="absolute inset-0 opacity-25">
              <div className="absolute -left-20 top-12 h-44 w-44 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-300 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-md">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Start with one account
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Create your MyCloud profile in a minute.</h1>
              <p className="mt-5 text-base leading-7 text-blue-50 sm:text-lg">
                Register to sync your storage settings, manage files, and keep the app experience consistent across all pages.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <ShieldCheck className="h-6 w-6" />
                  <p className="mt-3 text-sm font-semibold">Secure onboarding</p>
                  <p className="mt-1 text-sm text-blue-50/90">Registration uses the same backend flow as the login screen.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <HardDrive className="h-6 w-6" />
                  <p className="mt-3 text-sm font-semibold">Ready for storage</p>
                  <p className="mt-1 text-sm text-blue-50/90">Jump straight into the dashboard once your account is created.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Register;