"use client";

import { BookOpen, PlusCircle, Download, User } from "lucide-react";

export default function LecturerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Lecturer Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Example cards */}
        <div className="p-4 bg-white rounded-xl shadow">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg mt-2 font-medium">Courses</h2>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <User className="w-6 h-6 text-green-500" />
          <h2 className="text-lg mt-2 font-medium">Students</h2>
        </div>
      </div>
    </div>
  );
}
