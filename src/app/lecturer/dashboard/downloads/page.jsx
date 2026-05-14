"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Download, Eye, X, Search, BookOpen, CheckSquare } from "lucide-react";
import MathRenderer from "@/components/MathRenderer";
import {
  getSubjects,
  getChapterBySubject,
  getQuestionsByChapter,
} from "@/services/lecturerService";

// ─── Helper ───────────────────────────────────────────────────────────────────
function getCorrectAnswer(q) {
  if (q.questionType === "INTEGER") return q.correctAnswer ?? "—";
  const idx = q.options?.findIndex((o) => o.isCorrect);
  return idx >= 0 ? ["A", "B", "C", "D"][idx] : "—";
}

// ─── Paper content ────────────────────────────────────────────────────────────
// All colours are inline hex — html2canvas cannot parse oklch/lab from Tailwind.
// No header, no difficulty badge (per requirements).
function PaperContent({ questions, startingQNo = 1 }) {
  return (
    <div style={{ backgroundColor: "#ffffff", padding: "32px", fontFamily: "Georgia, serif" }}>
      {questions.map((q, idx) => (
        <div key={q.id} style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>

            {/* Number */}
            <span style={{ fontWeight: "bold", color: "#111827", flexShrink: 0, width: "24px" }}>
              {startingQNo + idx}.
            </span>

            {/* Body */}
            <div style={{ flex: 1 }}>
              <p style={{ color: "#111827", lineHeight: "1.65", margin: 0 }}>
                <MathRenderer text={q.questionText} />
              </p>

              {/* Options — show whenever options exist, regardless of questionType stored */}
              {q.options?.length > 0 && (
                <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 32px" }}>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: "flex", gap: "6px", color: "#374151", fontSize: "13px" }}>
                      <span style={{ fontWeight: "600", flexShrink: 0 }}>
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <MathRenderer text={opt.optionText} />
                    </div>
                  ))}
                </div>
              )}

              {/* Integer answer blank */}
              {(!q.options || q.options.length === 0) && (
                <p style={{ marginTop: "12px", fontSize: "13px", color: "#374151", margin: "12px 0 0 0" }}>
                  Answer:{" "}
                  <span style={{
                    display: "inline-block",
                    borderBottom: "1px solid #111827",
                    width: "140px",
                    marginLeft: "4px",
                    verticalAlign: "bottom",
                  }} />
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Answer key content ───────────────────────────────────────────────────────
function AnswerKeyContent({ questions, startingQNo = 1 }) {
  return (
    <div style={{ backgroundColor: "#ffffff", padding: "32px", fontFamily: "Georgia, serif" }}>
      <h2 style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", marginBottom: "6px", color: "#111827", letterSpacing: "0.05em" }}>
        ANSWER KEY
      </h2>
      <div style={{ borderTop: "2px solid #111827", marginBottom: "24px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 64px" }}>
        {questions.map((q, idx) => (
          <div key={q.id} style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "14px", color: "#111827" }}>
            <span style={{ fontWeight: "600", minWidth: "32px" }}>{startingQNo + idx}.</span>
            <span style={{ fontWeight: "700", color: "#1a3db5", fontSize: "15px" }}>{getCorrectAnswer(q)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Solution key content ─────────────────────────────────────────────────────
function SolutionKeyContent({ questions, startingQNo = 1 }) {
  return (
    <div style={{ backgroundColor: "#ffffff", padding: "32px", fontFamily: "Georgia, serif" }}>
      <h2 style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", marginBottom: "6px", color: "#111827", letterSpacing: "0.05em" }}>
        SOLUTION KEY
      </h2>
      <div style={{ borderTop: "2px solid #111827", marginBottom: "28px" }} />
      {questions.map((q, idx) => (
        <div key={q.id} style={{ marginBottom: "28px", paddingBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{ fontWeight: "bold", color: "#111827", flexShrink: 0, width: "24px" }}>{startingQNo + idx}.</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#111827", lineHeight: "1.65", margin: "0 0 10px 0" }}>
                <MathRenderer text={q.questionText} />
              </p>
              <p style={{ fontWeight: "700", color: "#1a3db5", fontSize: "13px", margin: "0 0 8px 0" }}>
                Answer: {getCorrectAnswer(q)}
              </p>
              {q.explanation ? (
                <div style={{ background: "#f0f4ff", borderLeft: "3px solid #1a3db5", padding: "10px 14px", borderRadius: "4px" }}>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#1a3db5", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Solution</p>
                  <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.7" }}>
                    <MathRenderer text={q.explanation} />
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic", margin: 0 }}>No solution provided.</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DownloadsPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState(new Set());
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState("paper"); // "paper" | "answerKey" | "solutionKey"
  const [autoDownload, setAutoDownload] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [startingQNo, setStartingQNo] = useState(1);

  const paperRef = useRef(null);

  // ── Load subjects on mount ─────────────────────────────────────────────────
  useEffect(() => {
    getSubjects()
      .then((res) => setSubjects(res.data.data ?? []))
      .catch(console.error);
  }, []);

  // ── Load chapters when subject changes ─────────────────────────────────────
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setSelectedChapterIds(new Set());
      setQuestions([]);
      setSelectedIds(new Set());
      return;
    }
    getChapterBySubject(selectedSubject)
      .then((res) => {
        setChapters(res.data.data ?? []);
        setSelectedChapterIds(new Set());
        setQuestions([]);
        setSelectedIds(new Set());
      })
      .catch(console.error);
  }, [selectedSubject]);

  // ── Load questions from ALL selected chapters in parallel ──────────────────
  useEffect(() => {
    if (selectedChapterIds.size === 0) {
      setQuestions([]);
      setSelectedIds(new Set());
      return;
    }
    setLoadingQuestions(true);
    Promise.all([...selectedChapterIds].map((id) => getQuestionsByChapter(id)))
      .then((results) => {
        const merged = results.flatMap((r) => r.data.data ?? []);
        // Deduplicate by question id
        const seen = new Set();
        const unique = merged.filter((q) => {
          if (seen.has(q.id)) return false;
          seen.add(q.id);
          return true;
        });
        setQuestions(unique);
        setSelectedIds(new Set());
      })
      .catch(console.error)
      .finally(() => setLoadingQuestions(false));
  }, [selectedChapterIds]);

  // ── Chapter toggle handlers ────────────────────────────────────────────────
  const toggleChapter = (id) => {
    setSelectedChapterIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllChapters = () =>
    setSelectedChapterIds(new Set(chapters.map((c) => c.id)));

  const clearAllChapters = () => setSelectedChapterIds(new Set());

  // ── Question filter ────────────────────────────────────────────────────────
  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "All" || q.questionType === typeFilter;
    return matchSearch && matchType;
  });

  const selectedQuestions = questions.filter((q) => selectedIds.has(q.id));
  const subjectName = subjects.find((s) => s.id === selectedSubject)?.subjectName ?? "";

  // ── Question selection ─────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredQuestions.forEach((q) => next.add(q.id));
      return next;
    });
  };

  const clearAll = () => setSelectedIds(new Set());

  // ── Preview / download ─────────────────────────────────────────────────────
  const openPreview = (mode = "paper") => { setPreviewMode(mode); setAutoDownload(false); setShowPreview(true); };
  const openAndDownload = (mode = "paper") => { setPreviewMode(mode); setAutoDownload(true); setShowPreview(true); };

  const handleDownloadPDF = useCallback(async () => {
    if (!paperRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageW = 210;
      const pageH = 297;
      const margin = 12;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;

      let renderedH = 0;

      while (renderedH < imgH) {
        if (renderedH > 0) pdf.addPage();
        const yPos = margin - renderedH;
        pdf.addImage(imgData, "PNG", margin, yPos, usableW, imgH);
        renderedH += usableH;
      }

      const base = (subjectName || "prepzone").replace(/\s+/g, "_");
      const suffix = previewMode === "answerKey" ? "_answer_key"
        : previewMode === "solutionKey" ? "_solution_key"
        : "_question_paper";
      const filename = base + suffix + ".pdf";
      pdf.save(filename);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [paperRef, subjectName, previewMode]);

  useEffect(() => {
    if (showPreview && autoDownload) {
      const t = setTimeout(() => {
        handleDownloadPDF();
        setAutoDownload(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [showPreview, autoDownload, handleDownloadPDF]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Question Paper Builder
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Filters + Question list ───────────────────────────────── */}
        <div className="flex-1 space-y-4">

          {/* Filter card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.subjectName}</option>
                ))}
              </select>
            </div>

            {/* Chapter checkboxes — only when a subject is selected */}
            {selectedSubject && chapters.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Chapters
                    {selectedChapterIds.size > 0 && (
                      <span className="ml-2 text-blue-600 normal-case">
                        ({selectedChapterIds.size} selected)
                      </span>
                    )}
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={selectAllChapters}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearAllChapters}
                      className="text-xs text-gray-400 hover:underline font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="border-2 border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                  {chapters.map((c) => (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition ${
                        selectedChapterIds.has(c.id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedChapterIds.has(c.id)}
                        onChange={() => toggleChapter(c.id)}
                        className="accent-blue-600 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">{c.chapterName}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Type filter pills */}
            <div className="flex gap-2">
              {["All", "MCQ", "INTEGER"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    typeFilter === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "INTEGER" ? "Integer" : type}
                </button>
              ))}
            </div>
          </div>

          {/* Question list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredQuestions.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <span className="text-sm text-gray-500">
                  {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""}
                </span>
                <div className="flex gap-4">
                  <button onClick={selectAllVisible} className="text-xs text-blue-600 hover:underline font-medium">
                    Select All
                  </button>
                  <button onClick={clearAll} className="text-xs text-red-400 hover:underline font-medium">
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Empty states */}
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Loading questions...</span>
              </div>
            ) : selectedChapterIds.size === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <BookOpen size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Select a subject and at least one chapter.</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No questions match your filters.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredQuestions.map((q) => (
                  <label
                    key={q.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                      selectedIds.has(q.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(q.id)}
                      onChange={() => toggleSelect(q.id)}
                      className="mt-1 accent-blue-600 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                        {q.questionText}
                      </p>
                      <div className="flex gap-2 mt-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          q.questionType === "INTEGER"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-indigo-100 text-indigo-600"
                        }`}>
                          {q.questionType === "INTEGER" ? "Integer" : "MCQ"}
                        </span>
                        {q.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            q.difficulty === "Easy" ? "bg-green-100 text-green-600"
                            : q.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                          }`}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Selected questions panel ─────────────────────────────── */}
        <div className="w-full lg:w-72 xl:w-80">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Selected</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                {selectedIds.size}
              </span>
            </div>

            {selectedQuestions.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <CheckSquare size={32} className="mb-2 opacity-30" />
                <p className="text-xs text-center">Check questions on the left to add them here.</p>
              </div>
            ) : (
              <ul className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
                {selectedQuestions.map((q, idx) => (
                  <li key={q.id} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 font-semibold mt-0.5 flex-shrink-0 w-5">
                      {startingQNo + idx}.
                    </span>
                    <span className="line-clamp-2 flex-1 text-gray-700 leading-relaxed">
                      {q.questionText}
                    </span>
                    <button
                      onClick={() => toggleSelect(q.id)}
                      className="text-gray-300 hover:text-red-400 transition flex-shrink-0 mt-0.5"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Starting Q. No. */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-1">
              <label className="text-xs font-semibold text-gray-500">Starting Q. No.</label>
              <input
                type="number"
                min={1}
                value={startingQNo}
                onChange={(e) => setStartingQNo(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => openPreview("paper")}
                disabled={selectedIds.size === 0}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Eye size={15} />
                Preview Paper
              </button>
              <button
                onClick={() => openAndDownload("paper")}
                disabled={selectedIds.size === 0}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={15} />
                Question Paper PDF
              </button>
              <div className="border-t border-gray-100 pt-2 flex flex-col gap-2">
                <button
                  onClick={() => openAndDownload("answerKey")}
                  disabled={selectedIds.size === 0}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={15} />
                  Answer Key PDF
                </button>
                <button
                  onClick={() => openAndDownload("solutionKey")}
                  disabled={selectedIds.size === 0}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={15} />
                  Solution Key PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREVIEW MODAL ─────────────────────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {previewMode === "answerKey" ? "Preview — Answer Key"
                    : previewMode === "solutionKey" ? "Preview — Solution Key"
                    : "Preview — Question Paper"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">This is exactly how the PDF will look.</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X size={22} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[65vh] border-b border-gray-100">
              <div ref={paperRef}>
                {previewMode === "answerKey" && <AnswerKeyContent questions={selectedQuestions} startingQNo={startingQNo} />}
                {previewMode === "solutionKey" && <SolutionKeyContent questions={selectedQuestions} startingQNo={startingQNo} />}
                {previewMode === "paper" && <PaperContent questions={selectedQuestions} startingQNo={startingQNo} />}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-gray-500">
                {selectedQuestions.length} question{selectedQuestions.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Download size={15} />
                  {downloading ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
