"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, PlusCircle, Download, User, Menu, X } from "lucide-react";

export default function LecturerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const menuItems = [
    { id: "home", label: "My Questions", icon: <BookOpen size={20} />, href: "/lecturer/dashboard" },
    { id: "add-content", label: "Add Content", icon: <PlusCircle size={20} />, href: "/lecturer/add-content" },
    { id: "download", label: "Downloads", icon: <Download size={20} />, href: "/lecturer/dashboard/downloads" },
    { id: "profile", label: "Profile", icon: <User size={20} />, href: "/lecturer/dashboard/profile" },
  ];
const gradientStyle = {
  background: 'linear-gradient(to bottom right, #061b58ff, #184af0ff)'
};

  return (
    <div className="min-h-screen flex bg-gray-50 flex-col md:flex-row">
      {/* Sidebar for Desktop */}
<aside style={gradientStyle} className="hidden md:flex flex-col w-64  text-white">
        <div className="p-5 text-2xl font-bold border-b border-blue-600">PrepZone</div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition ${
                activeTab === item.id ? "bg-blue-600" : "hover:bg-blue-600/70"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-blue-700 text-white flex justify-between items-center px-4 py-3 z-40 shadow">
        <span className="font-bold text-lg">PrepZone</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 mt-[56px] md:mt-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
