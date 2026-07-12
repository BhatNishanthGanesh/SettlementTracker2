"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "react-feather";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl w-full relative z-10">
      {/* Left side - Branding */}
      <div className="flex-1 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span className="text-xs text-purple-400 font-medium">Secure · Fast · Reliable</span>
        </div>
        <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">
          Welcome to
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Settlement Tracker
          </span>
        </h1>
        <p className="text-white/50 text-base md:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
          Simplifying your finances for a clear and prosperous journey. Track, split, and settle expenses effortlessly.
        </p>
        
        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start mt-6">
          {["💰 Smart Splits", "📊 Real-time", "🤖 AI Insights", "🔒 Secure"].map((feature) => (
            <span key={feature} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Right side - Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-purple-500/5">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-white/40 text-sm mt-1">
              {callbackUrl.includes('/join/') ? (
                <>Sign in to join your trip! 🎉</>
              ) : (
                <>Sign in to continue tracking your expenses</>
              )}
            </p>
          </div>

          <form  onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/30 text-xs font-medium uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                await signIn("github", { callbackUrl }); // Updated to use callbackUrl
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-all group"
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN0Uu0auB-_30X62d-vUYM-jhN4TkqPqgv6A&usqp=CAU"
                alt="GitHub"
                className="w-6 h-6 object-contain"
              />
              <span className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">GitHub</span>
            </button>
            <button
              onClick={async () => {
                await signIn("google", { callbackUrl }); // Updated to use callbackUrl
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-all group"
            >
              <img
                src="https://cdn.iconscout.com/icon/free/png-256/free-google-160-189824.png"
                alt="Google"
                className="w-6 h-6 object-contain"
              />
              <span className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">Google</span>
            </button>
          </div>

          <p className="text-center text-white/40 text-sm mt-6">
            Don't have an account?{" "}
            <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors">
              Register Here
            </Link>
          </p>
        </div>
      </div>  
    </div>
  );
};

export default Login;