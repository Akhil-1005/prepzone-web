"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
    workExperience: "",
    proficiency: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup data:", form);
    // Add backend API call here
    router.push("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-indigo-600">Create Your PrepZone Account</h1>
    
        <div className="grid grid-cols-2 gap-3">
          <input
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-2 text-black"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-2 text-black"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2 text-black" 
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-black"
        >
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
        </select>

        {form.role === "lecturer" && (
          <>
            <input
              name="workExperience"
              placeholder="Work Experience (Optional)"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 text-black"
            />

            <input
              name="proficiency"
              placeholder="Subject Expertise"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2 text-black"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-indigo-600 cursor-pointer font-medium"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
