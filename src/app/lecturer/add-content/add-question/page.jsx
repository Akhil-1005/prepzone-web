"use client";

import { saveQuestion, getSubjects, getChapterBySubject } from "@/services/lecturerService";
import { useState, useEffect, useRef } from "react";

export default function AddQuestionPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("MCQ");
  const [options, setOptions] = useState([
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ]);
  const [correctOption, setCorrectOption] = useState("");
  const [integerAnswer, setIntegerAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const optionRefs = useRef([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getSubjects();
        setSubjects(response.data.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      const fetchChapters = async () => {
        try {
          const response = await getChapterBySubject(selectedSubject);
          setChapters(response.data.data);
        } catch (error) {
          console.error("Error fetching chapters:", error);
        }
      };
      fetchChapters();
      setSelectedChapter("");
    }
  }, [selectedSubject]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [question]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index].optionText = value;
    setOptions(updated);
  };

  const handleSave = async () => {
    if (!selectedSubject) { alert("Please select a subject."); return; }
    if (!selectedChapter) { alert("Please select a chapter."); return; }
    if (!question.trim()) { alert("Please enter the question text."); return; }
    if (!difficulty) { alert("Please select a difficulty level."); return; }

    let payload;

    if (questionType === "MCQ") {
      if (!correctOption) { alert("Please select the correct option."); return; }
      const emptyOption = options.findIndex((o) => !o.optionText.trim());
      if (emptyOption !== -1) {
        alert(`Option ${["A","B","C","D"][emptyOption]} cannot be empty.`);
        return;
      }
      const correctIndex = ["A", "B", "C", "D"].indexOf(correctOption);
      const finalOptions = options.map((opt, idx) => ({
        optionText: opt.optionText,
        isCorrect: idx === correctIndex,
      }));
      payload = {
        questionText: question,
        difficulty,
        chapterId: selectedChapter,
        questionType: "MCQ",
        options: finalOptions,
      };
    } else {
      if (!integerAnswer.toString().trim()) { alert("Please enter the correct integer answer."); return; }
      payload = {
        questionText: question,
        difficulty,
        chapterId: selectedChapter,
        questionType: "INTEGER",
        correctAnswer: integerAnswer.toString(),
        options: [],
      };
    }

    try {
      await saveQuestion(payload);
      alert("Question saved successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to save question.");
    }
  };

  return (
    <div className="mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">Add Question</h1>

      {/* Subject + Chapter */}
      <div className="flex space-x-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 focus:outline-none focus:border-blue-500"
        >
          <option value="">Select Subject</option>
          {subjects.map((subj) => (
            <option key={subj.id} value={subj.id}>
              {subj.subjectName}
            </option>
          ))}
        </select>

        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 focus:outline-none focus:border-blue-500"
          disabled={!selectedSubject}
        >
          <option value="">Select Chapter</option>
          {chapters.map((chap) => (
            <option key={chap.id} value={chap.id}>
              {chap.chapterName}
            </option>
          ))}
        </select>
      </div>

      {/* Question Type Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-gray-700 font-medium">Question Type:</span>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            type="button"
            onClick={() => setQuestionType("MCQ")}
            className={`px-5 py-2 text-sm font-medium transition ${
              questionType === "MCQ"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            MCQ
          </button>
          <button
            type="button"
            onClick={() => setQuestionType("INTEGER")}
            className={`px-5 py-2 text-sm font-medium transition border-l border-gray-300 ${
              questionType === "INTEGER"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Integer
          </button>
        </div>
      </div>

      {/* Question Text */}
      <textarea
        ref={textareaRef}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Paste your question here"
        className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 placeholder-gray-500 resize-none overflow-hidden focus:outline-none focus:border-blue-500 whitespace-pre-wrap"
        rows={1}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      />

      {/* MCQ Options */}
      {questionType === "MCQ" && (
        <div className="space-y-3">
          {["A", "B", "C", "D"].map((label, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="radio"
                name="correctOption"
                value={label}
                checked={correctOption === label}
                onChange={(e) => setCorrectOption(e.target.value)}
              />
              <span className="w-4 font-semibold text-gray-700">{label}.</span>
              <textarea
                ref={(el) => (optionRefs.current[idx] = el)}
                value={options[idx].optionText}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${label}`}
                className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 placeholder-gray-500 resize-none overflow-hidden focus:outline-none focus:border-blue-500"
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
              />
            </div>
          ))}
          <p className="text-xs text-gray-400">
            Select the radio button next to the correct option.
          </p>
        </div>
      )}

      {/* Integer Answer */}
      {questionType === "INTEGER" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer{" "}
            <span className="text-gray-400 font-normal">(numeric)</span>
          </label>
          <input
            type="number"
            value={integerAnswer}
            onChange={(e) => setIntegerAnswer(e.target.value)}
            placeholder="Enter the correct integer answer"
            className="border border-gray-400 rounded px-3 py-2 w-full max-w-xs text-gray-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Difficulty */}
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="border border-gray-400 rounded px-3 py-2 w-full text-gray-800 focus:outline-none focus:border-blue-500"
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
