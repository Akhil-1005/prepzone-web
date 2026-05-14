"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  HelpCircle,
  PlusCircle,
  Download,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { getDashboardStats } from "@/services/lecturerService";
import api from "@/services/apiClient";

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + "18" }}
      >
        <Icon size={26} style={{ color }} />
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        )}
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, sublabel, href, color }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
          style={{ backgroundColor: color + "18" }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
      </div>
    </Link>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LecturerDashboard() {
  const [stats, setStats] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get("/api/auth/profile"),
          getDashboardStats(),
        ]);
        setUserName(profileRes.data?.data?.userName || "Lecturer");
        setStats(statsRes.data?.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { icon: BookOpen, label: "Subjects", value: stats?.subjectCount ?? 0, color: "#3b82f6" },
    { icon: Layers,   label: "Chapters", value: stats?.chapterCount ?? 0, color: "#8b5cf6" },
    { icon: HelpCircle, label: "Questions", value: stats?.questionCount ?? 0, color: "#10b981" },
  ];

  const quickActions = [
    { icon: BookOpen,   label: "Add Subject",  sublabel: "Create a new subject",       href: "/lecturer/add-content?tab=subjects",  color: "#3b82f6" },
    { icon: Layers,     label: "Add Chapter",  sublabel: "Add chapter to a subject",   href: "/lecturer/add-content?tab=chapters",  color: "#8b5cf6" },
    { icon: HelpCircle, label: "Add Question", sublabel: "Write MCQ or integer type",  href: "/lecturer/add-content?tab=questions", color: "#10b981" },
    { icon: Download,   label: "Download Paper", sublabel: "Generate question paper",  href: "/lecturer/dashboard/downloads",       color: "#f59e0b" },
  ];

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-8">

      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{formatDate()}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">
            {getGreeting()},{" "}
            <span style={{ color: "#1a3db5" }}>
              {loading ? "..." : userName}
            </span>{" "}
            👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your content.</p>
        </div>
        <div
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #1a3db5, #184af0)" }}
        >
          <TrendingUp size={16} />
          <span>Content Overview</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <QuickAction key={action.label} {...action} />
          ))}
        </div>
      </div>

      {/* Subjects list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700">My Subjects</h2>
          <Link
            href="/lecturer/add-content?tab=subjects"
            className="text-sm font-medium"
            style={{ color: "#1a3db5" }}
          >
            Manage →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : !stats?.subjects?.length ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <BookOpen size={36} className="text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No subjects yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first subject to get started.</p>
              <Link
                href="/lecturer/add-content?tab=subjects"
                className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #1a3db5, #184af0)" }}
              >
                + Add Subject
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/lecturer/add-content?tab=chapters`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #1a3db5, #184af0)" }}
                    >
                      {subject.subjectName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{subject.subjectName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400">
                      {subject.chapterCount} {subject.chapterCount === 1 ? "chapter" : "chapters"}
                    </span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
