"use client";

import { useState, useEffect, useRef } from "react";

export default function AddQuestionPage() {
  const [subjects, setSubjects] = useState(["Physics", "Chemistry", "Math"]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const optionRefs = useRef([]);

  const subjectChaptersMap = {
    Physics: ["Mechanics", "Optics"],
    Chemistry: ["Organic", "Inorganic"],
    Math: ["Algebra", "Calculus"],
  };

  useEffect(() => {
    if (selectedSubject) {
      setChapters(subjectChaptersMap[selectedSubject] || []);
      setSelectedChapter("");
    }
  }, [selectedSubject]);

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleSave = () => {
    const payload = {
      subject: selectedSubject,
      chapter: selectedChapter,
      question,
      options,
      correctOption,
      difficulty,
    };
    console.log("Saving question:", payload);
    // Call API to save
  };

  return (
    <div className=" mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">Add Question</h1>
  <div className="flex space-x-4">
        <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500"
      >
        <option value="">Select Subject</option>
        {subjects.map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>

      {/* Chapter Dropdown */}
      <select
        value={selectedChapter}
        onChange={(e) => setSelectedChapter(e.target.value)}
        className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        disabled={!selectedSubject}
      >
        <option value="">Select Chapter</option>
        {chapters.map((chap) => (
          <option key={chap} value={chap}>
            {chap}
          </option>
        ))}
      </select>
  </div>
    

      {/* Question Field */}
     <textarea
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  placeholder="Paste your question here"
  className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 placeholder-gray-500 resize-none overflow-hidden focus:outline-none focus:border-blue-500 whitespace-pre-wrap"
  rows={3}
  onInput={(e) =>
    (e.target.style.height = "auto") ||
    (e.target.style.height = e.target.scrollHeight + "px")
  }
/>

      {/* Options */}
      {["A", "B", "C", "D"].map((label, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          <span className="w-4 font-semibold">{label}.</span>
          <textarea
            ref={(el) => (optionRefs.current[idx] = el)}
            value={options[idx]}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            placeholder={`Option ${label}`}
            className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 placeholder-gray-500 resize-none overflow-hidden focus:outline-none focus:border-blue-500"
            rows={1}
            onInput={(e) =>
              (e.target.style.height = "auto") ||
              (e.target.style.height = e.target.scrollHeight + "px")
            }
          />
          <input
            type="radio"
            name="correctOption"
            value={label}
            checked={correctOption === label}
            onChange={(e) => setCorrectOption(e.target.value)}
          />
        </div>
      ))}

      {/* Difficulty Dropdown */}
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500"
      >
        <option value="">Select Difficulty</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          className="border border-gray-400 rounded px-4 py-2 hover:bg-gray-100"
          onClick={() => window.history.back()}
        >
          Back
        </button>
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
