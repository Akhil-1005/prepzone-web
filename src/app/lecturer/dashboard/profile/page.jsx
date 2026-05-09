"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/services/apiClient";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/auth/profile");
        setProfile(response.data.data);
      } catch (e) {
        console.error("Error fetching profile:", e);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">My Profile</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
          <p className="text-gray-800 font-medium">{profile.userName || "—"}</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
          <p className="text-gray-800 font-medium">{profile.email || "—"}</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Phone</label>
          <p className="text-gray-800 font-medium">{profile.phoneNumber || "—"}</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide">Role</label>
          <p className="text-gray-800 font-medium">{profile.role || "—"}</p>
        </div>
      </div>
    </div>
  );
}
