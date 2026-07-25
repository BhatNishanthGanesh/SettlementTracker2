"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, User } from "react-feather";
import { signIn } from "next-auth/react";

const Register = () => {
  const [error, setError] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [showpassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const nameValue = e.target.name.value;
    const emailValue = e.target.email.value;
    const passwordValue = e.target.password.value;

    if (!passwordValue || passwordValue.length < 2) {
      setError("Password is invalid");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/register", {
        name: nameValue,
        email: emailValue,
        password: passwordValue,
      });

      if (response.status === 201) {
        setEmail(emailValue);
        setPassword(passwordValue);
        setName(nameValue);
        setStep("verify");
        setError("");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        setError(errorData.message || "This email is already registered");
      } else {
        setError("Error, try again");
        console.error("Error during registration:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/verify-otp", {
        email,
        otp: otpString,
      });

      if (response.status === 200) {
        // Auto login after verification
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Auto-login failed. Please login manually.");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          router.push("/login");
          router.refresh();
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/send-otp", { email });
      setError(""); // Clear any previous error
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // OTP Verification Step
  if (step === "verify") {
    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl w-full relative z-10">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span className="text-xs text-purple-400 font-medium">Verify your email</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">
            Verify your
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Email Address
            </span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
            We've sent a 6-digit verification code to your email. Please enter it below to complete your registration.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-purple-500/5">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
              <p className="text-white/40 text-sm mt-1">
                Enter the 6-digit code sent to
                <br />
                <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-center text-2xl font-bold text-white bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify & Complete Registration"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("register");
                  setError("");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="w-full text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                ← Back to registration
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl w-full relative z-10">
      {/* Left side - Branding */}
      <div className="flex-1 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span className="text-xs text-purple-400 font-medium">Join us · It's free</span>
        </div>
        <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">
          Create your
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Account Today
          </span>
        </h1>
        <p className="text-white/50 text-base md:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
          Start tracking your shared expenses with friends, family, and colleagues. Join thousands of happy users.
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

      {/* Right side - Register Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-purple-500/5">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-white/40 text-sm mt-1">Start tracking your expenses today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                name="name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Full name"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="email"
                name="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Email address"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type={showpassword ? "text" : "password"}
                name="password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showpassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
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
                await signIn("github", {
                  redirect: false,
                  callbackUrl: "/dashboard",
                });
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
                await signIn("google", {
                  redirect: false,
                  callbackUrl: "/dashboard",
                });
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
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;