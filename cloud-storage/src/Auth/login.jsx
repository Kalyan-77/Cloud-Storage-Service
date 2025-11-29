import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  console.log("BASE_URL : " , BASE_URL);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors('');
    setLoading(true);

    try {      
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        // credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMsg(data.message || 'Login Successful...');
        setEmail('');
        setPassword('');
        
        // Navigate to hero page
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top electric blue wave */}
        <div className="absolute top-0 left-0 right-0 h-1">
          <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 opacity-80 animate-pulse"></div>
        </div>
        
        {/* Floating animated elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-60 h-60 bg-purple-500 rounded-full opacity-20 animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-orange-500 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 mb-4">
            Animated Login/
          </h1> */}
          <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
            Login Form
          </h2>
        </div>

        {/* Main Form Container */}
        <div className="bg-black bg-opacity-40 backdrop-blur-md border-2 border-gray-600 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-0 items-stretch">
            
            {/* Login Form Section */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-l-2xl p-8 border-r border-gray-700">
              {/* Login Header */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-6">Login</h3>
                
                {/* Messages */}
                {msg && (
                  <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-medium">{msg}</p>
                  </div>
                )}

                {errors && (
                  <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                    <p className="text-red-400 font-medium">{errors}</p>
                  </div>
                )}
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-transparent border-b-2 border-gray-600 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all duration-300"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent border-b-2 border-gray-600 py-3 pl-10 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Footer link */}
                <div className="text-center mt-6">
                  <span className="text-gray-400">Don't have an account? </span>
                  <a href="/register" className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-300">
                    Sign Up
                  </a>
                </div>
              </form>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-r-2xl p-8 flex items-center justify-center relative overflow-hidden">
              <div className="text-center text-white z-10">
                <h3 className="text-4xl md:text-5xl font-bold mb-6">WELCOME BACK!</h3>
                <p className="text-orange-100 text-lg leading-relaxed max-w-sm">
                  We are excited to have you with us again. If you need any help, we are here to help.
                </p>
              </div>

              {/* Decorative curved overlay */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-0 bottom-0 w-40 bg-black bg-opacity-20 transform -skew-x-12"></div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-8 right-8 w-16 h-16 bg-white bg-opacity-20 rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-10 h-10 bg-white bg-opacity-20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              
              {/* Decorative wave pattern at bottom */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 400 80" className="w-full h-16 text-orange-400 opacity-30">
                  <path d="M0,40 Q100,10 200,40 T400,40 L400,80 L0,80 Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;