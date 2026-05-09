"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { login as loginService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

const features = [
  { icon: "📚", text: "Subject-wise MCQ Practice" },
  { icon: "📊", text: "Performance Tracking" },
  { icon: "⚡", text: "Instant Results & Explanations" },
];

const exams = ["JEE", "NEET", "EAMCET"];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginService(form);
      if (response.data.statusCode === "200 OK") {
        const { token, refreshToken, id } = response.data.data;
        login({ token, refreshToken, userId: id });
        router.push("/lecturer/dashboard");
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Brand Panel ──────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 text-white"
        style={{ background: "linear-gradient(160deg, #061b58 0%, #1a3db5 60%, #184af0 100%)" }}
      >
        {/* Top */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <span className="text-4xl">🎯</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">PrepZone</h1>
              <p className="text-blue-200 text-[10px] uppercase tracking-widest mt-0.5">
                Exam Preparation Platform
              </p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Learn Smarter,<br />Crack Exams Faster
          </h2>
          <p className="text-blue-200 text-lg mb-12 leading-relaxed">
            Practice MCQs, track your progress, and achieve your dream score.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-blue-100 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exam tags */}
        <div className="flex gap-3">
          {exams.map((exam) => (
            <span
              key={exam}
              className="px-3 py-1 bg-white/15 rounded-full text-xs font-semibold tracking-wide"
            >
              {exam}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <span className="text-3xl">🎯</span>
            <h1 className="text-2xl font-bold text-gray-800">PrepZone</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
              <p className="text-gray-500 mt-1 text-sm">Sign in to your PrepZone account</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-11 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #1a3db5, #184af0)" }}
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
