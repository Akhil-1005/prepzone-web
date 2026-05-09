"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Download,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import ProtectedRoute from "../ProtectedRoute";
import Cookies from "js-cookie";
import api from "@/services/apiClient";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    mobileLabel: "Home",
    icon: LayoutDashboard,
    href: "/lecturer/dashboard",
    exact: true,
  },
  {
    id: "add-content",
    label: "Add Content",
    mobileLabel: "Add",
    icon: PlusCircle,
    href: "/lecturer/add-content",
  },
  {
    id: "downloads",
    label: "Downloads",
    mobileLabel: "Downloads",
    icon: Download,
    href: "/lecturer/dashboard/downloads",
  },
  {
    id: "profile",
    label: "Profile",
    mobileLabel: "Profile",
    icon: User,
    href: "/lecturer/dashboard/profile",
  },
];

export default function LecturerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setUserName(res.data.data?.userName || "Lecturer");
      } catch {
        setUserName("Lecturer");
      }
    };
    fetchProfile();
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isActive = (item) =>
    item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);

  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("userId");
    router.push("/login");
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : "L";

  // ── Shared nav link renderer ─────────────────────────────────────────────
  const NavLink = ({ item, onClick }) => {
    const active = isActive(item);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-white/15 text-white"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full" />
        )}
        <Icon size={18} className="flex-shrink-0" />
        <span>{item.label}</span>
      </Link>
    );
  };

  // ── Shared user footer ───────────────────────────────────────────────────
  const UserFooter = () => (
    <div className="px-4 py-4 border-t border-white/10 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{userName || "Loading..."}</p>
          <p className="text-xs text-blue-200">Lecturer</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-50">

        {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
        <aside
          className="hidden md:flex flex-col fixed top-0 left-0 h-full w-64 z-30 text-white"
          style={{ background: "linear-gradient(160deg, #061b58 0%, #1a3db5 60%, #184af0 100%)" }}
        >
          {/* Logo */}
          <div className="px-6 pt-6 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <div>
                <h1 className="text-xl font-bold leading-tight tracking-tight">PrepZone</h1>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest">Lecturer Portal</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </nav>

          {/* User + Logout */}
          <UserFooter />
        </aside>

        {/* ── Mobile Top Bar ─────────────────────────────────────────────── */}
        <header
          className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 text-white shadow-md"
          style={{ background: "#061b58" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="font-bold text-base tracking-tight">PrepZone</span>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </header>

        {/* ── Mobile Drawer Backdrop ──────────────────────────────────────── */}
        <div
          className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* ── Mobile Drawer ───────────────────────────────────────────────── */}
        <div
          className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 flex flex-col text-white shadow-2xl transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ background: "linear-gradient(160deg, #061b58 0%, #1a3db5 60%, #184af0 100%)" }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="font-bold">PrepZone</span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                onClick={() => setDrawerOpen(false)}
              />
            ))}
          </nav>

          {/* Drawer user + logout */}
          <UserFooter />
        </div>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <main className="flex-1 md:ml-64 mt-[52px] md:mt-0 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>

        {/* ── Mobile Bottom Tab Bar ───────────────────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg flex items-stretch">
          {menuItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                  active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{item.mobileLabel}</span>
                {active && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>

      </div>
    </ProtectedRoute>
  );
}
