"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { signUp } from "@/services/authService";

const features = [
  { icon: "📚", text: "Subject-wise MCQ Practice" },
  { icon: "📊", text: "Performance Tracking" },
  { icon: "⚡", text: "Instant Results & Explanations" },
];

const exams = ["JEE", "NEET", "EAMCET"];

const roles = [
  {
    value: "Student",
    icon: GraduationCap,
    label: "Student",
    desc: "Practice & learn",
  },
  {
    value: "Lecturer",
    icon: BookOpen,
    label: "Lecturer",
    desc: "Create content",
  },
];

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    workExperience: "",
    subjectName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.role === "Lecturer" && !form.subjectName.trim()) {
      setError("Subject expertise is required for lecturers.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await signUp(form);
      if (response.data.statusCode === "201 CREATED") {
        router.push("/login");
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
            Start Your Journey<br />to Success
          </h2>
          <p className="text-blue-200 text-lg mb-12 leading-relaxed">
            Join thousands of students already mastering their preparation.
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
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <span className="text-3xl">🎯</span>
            <h1 className="text-2xl font-bold text-gray-800">PrepZone</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Join PrepZone and start practicing today
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Role card selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {roles.map(({ value, icon: Icon, label, desc }) => {
                const active = form.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, role: value });
                      if (error) setError("");
                    }}
                    className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all text-center ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={26}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    name="userName"
                    placeholder="John Doe"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

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

              {/* Password row */}
              <div className="grid grid-cols-2 gap-3">
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
                      placeholder="Min 6 chars"
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-9 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm
                  </label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Repeat"
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-9 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lecturer extra fields */}
              {form.role === "Lecturer" && (
                <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Lecturer Details
                  </p>
                  <div className="relative">
                    <BookOpen
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      name="subjectName"
                      placeholder="Subject Expertise (e.g. Physics)"
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition bg-white"
                    />
                  </div>
                  <div className="relative">
                    <Briefcase
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      name="workExperience"
                      placeholder="Work Experience (optional)"
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #1a3db5, #184af0)" }}
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
