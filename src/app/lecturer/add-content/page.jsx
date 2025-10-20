"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import {  useRouter } from "next/navigation";

export default function AddContentPage() {
  const tabs = ["Subjects", "Chapters", "Questions"];
  const [activeTab, setActiveTab] = useState("Subjects");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const router = useRouter(); 

  // Dummy data
  const subjects = [
    { id: 1, name: "Physics", chapters: 12, questions: 120 },
    { id: 2, name: "Chemistry", chapters: 10, questions: 100 },
    { id: 3, name: "Math", chapters: 15, questions: 150 },
  ];

  const chapters = [
    { subjectId: 1, name: "Mechanics", questions: 20 },
    { subjectId: 1, name: "Thermodynamics", questions: 15 },
    { subjectId: 2, name: "Organic Chemistry", questions: 25 },
  ];

  const questions = [
    "What is Newton's second law?",
    "Define enthalpy.",
    "Solve x^2 + 5x + 6 = 0",
    "What is an ester?",
  ];

  const handleAdd = () => {
    if (activeTab === "Subjects") setShowSubjectModal(true);
    else if (activeTab === "Chapters") setShowChapterModal(true);
    else   router.push(`/lecturer/add-content/add-question`);
    };

  // Filter data
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredChapters = chapters.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredQuestions = questions.filter((q) =>
    q.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Add Content</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px font-medium flex-shrink-0 ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => {
              setActiveTab(tab);
              setSearchTerm("");
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <input
          type="text"
          placeholder={`Search ${activeTab}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-md focus:outline-blue-500 text-gray-600"
        />
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleAdd}
        >
          <PlusCircle size={20} />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "Subjects" && (
          <ul className="space-y-2">
            {filteredSubjects.map((s, idx) => (
              <li
                key={idx}
                className="px-4 py-3 bg-gray-100 rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-black">{s.name}</div>
                  <div className="text-sm text-gray-600">
                    {s.chapters} Chapters | {s.questions} Questions
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "Chapters" && (
          <ul className="space-y-2">
            {filteredChapters.map((c, idx) => (
              <li
                key={idx}
                className="px-4 py-3 bg-gray-100 rounded flex justify-between items-center"
              >
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">
                  {c.questions} Questions
                </div>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "Questions" && (
          <div className="text-gray-600">
            Questions are managed on a separate screen.
          </div>
        )}
      </div>

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">Add Subject</h2>
            <input
              type="text"
              placeholder="Subject Name"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-800 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              placeholder="Description (optional)"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-800 focus:border-blue-500 focus:outline-none"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 border border-blue-600 rounded text-blue-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Add Chapter</h2>
            {/* Dropdown for selecting subject */}
            <select
              className="w-full border bordrer-gray-300 rounded px-3 py-2 mb-3 text-gray-600 focus:border-blue-500 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Select Subject
              </option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Chapter Name"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowChapterModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowChapterModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
