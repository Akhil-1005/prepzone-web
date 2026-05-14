"use client";

import { saveQuestion, getSubjects, getChapterBySubject, extractTextFromImage } from "@/services/lecturerService";
import { useState, useEffect, useRef, useCallback } from "react";
import { ImagePlus, X, Loader2, Sparkles, Crop, RefreshCw } from "lucide-react";
import MathRenderer from "@/components/MathRenderer";

const MATH_TOOLBAR = [
  { label: "x²",   snippet: "x^{2}",            title: "Power / Superscript" },
  { label: "xⁿ",   snippet: "x^{n}",            title: "Exponent" },
  { label: "√",    snippet: "\\sqrt{x}",         title: "Square root" },
  { label: "a/b",  snippet: "\\frac{a}{b}",      title: "Fraction" },
  { label: "∫",    snippet: "\\int_{a}^{b}",     title: "Integral" },
  { label: "Σ",    snippet: "\\sum_{i=1}^{n}",   title: "Summation" },
  { label: "lim",  snippet: "\\lim_{x\\to 0}",   title: "Limit" },
  { label: "d/dx", snippet: "\\frac{d}{dx}",     title: "Derivative" },
  { label: "∂",    snippet: "\\partial",          title: "Partial derivative" },
  { label: "|x|",  snippet: "|x|",               title: "Absolute value" },
  { label: "π",    snippet: "\\pi",              title: "Pi" },
  { label: "∞",    snippet: "\\infty",           title: "Infinity" },
  { label: "α",    snippet: "\\alpha",           title: "Alpha" },
  { label: "β",    snippet: "\\beta",            title: "Beta" },
  { label: "θ",    snippet: "\\theta",           title: "Theta" },
  { label: "λ",    snippet: "\\lambda",          title: "Lambda" },
  { label: "≤",    snippet: "\\leq",             title: "Less or equal" },
  { label: "≥",    snippet: "\\geq",             title: "Greater or equal" },
  { label: "±",    snippet: "\\pm",              title: "Plus minus" },
  { label: "×",    snippet: "\\times",           title: "Times" },
  { label: "→",    snippet: "\\to",              title: "Arrow" },
];

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  const [explanation, setExplanation] = useState("");

  // OCR state
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrTarget, setOcrTarget] = useState("question");
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [ocrError, setOcrError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // refs
  const textareaRef = useRef(null);
  const explanationRef = useRef(null);
  const optionRefs = useRef([]);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // active field for toolbar insertion
  const activeEl = useRef(null);
  const activeSetValue = useRef(null);

  const [selection, setSelection] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    getSubjects()
      .then((r) => setSubjects(r.data.data ?? []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSubject) { setChapters([]); setSelectedChapter(""); return; }
    getChapterBySubject(selectedSubject)
      .then((r) => setChapters(r.data.data ?? []))
      .catch(console.error);
    setSelectedChapter("");
  }, [selectedSubject]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  }, [question]);

  // ── Math toolbar ─────────────────────────────────────────────────────────────
  const trackFocus = (domEl, setter) => {
    activeEl.current = domEl;
    activeSetValue.current = setter;
  };

  const insertAtCursor = (rawSnippet) => {
    const el = activeEl.current;
    if (!el || !activeSetValue.current) return;
    const snippet = `$${rawSnippet}$`;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const newValue = el.value.slice(0, start) + snippet + el.value.slice(end);
    activeSetValue.current(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };

  // ── Canvas / OCR ─────────────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (hasSelection || isDragging) {
      const x = Math.min(selection.startX, selection.endX);
      const y = Math.min(selection.startY, selection.endY);
      const w = Math.abs(selection.endX - selection.startX);
      const h = Math.abs(selection.endY - selection.startY);
      if (w > 4 && h > 4) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(x, y, w, h);
        ctx.drawImage(img, x * (img.naturalWidth / canvas.width), y * (img.naturalHeight / canvas.height),
          w * (img.naturalWidth / canvas.width), h * (img.naturalHeight / canvas.height), x, y, w, h);
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
        [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].forEach(([cx,cy]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
          ctx.fillStyle = "#3b82f6";
          ctx.fill();
        });
      }
    }
  }, [selection, isDragging, hasSelection]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  useEffect(() => {
    if (!ocrPreviewUrl) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = 520;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = ocrPreviewUrl;
    setSelection({ startX: 0, startY: 0, endX: 0, endY: 0 });
    setHasSelection(false);
  }, [ocrPreviewUrl]);

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setOcrFile(file);
    setOcrPreviewUrl(URL.createObjectURL(file));
    setExtractedText("");
    setOcrError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleCanvasMouseDown = (e) => {
    const { x, y } = getCanvasPos(e);
    setSelection({ startX: x, startY: y, endX: x, endY: y });
    setIsDragging(true);
    setHasSelection(false);
    setExtractedText("");
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging) return;
    const { x, y } = getCanvasPos(e);
    setSelection((prev) => ({ ...prev, endX: x, endY: y }));
  };

  const handleCanvasMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const w = Math.abs(selection.endX - selection.startX);
    const h = Math.abs(selection.endY - selection.startY);
    setHasSelection(w > 10 && h > 10);
  };

  const getCroppedBase64 = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!img) return null;
    const x = Math.min(selection.startX, selection.endX);
    const y = Math.min(selection.startY, selection.endY);
    const w = Math.abs(selection.endX - selection.startX);
    const h = Math.abs(selection.endY - selection.startY);
    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;
    const offscreen = document.createElement("canvas");
    offscreen.width = w * scaleX;
    offscreen.height = h * scaleY;
    offscreen.getContext("2d").drawImage(img,
      x * scaleX, y * scaleY, w * scaleX, h * scaleY,
      0, 0, offscreen.width, offscreen.height);
    return offscreen.toDataURL(ocrFile.type).split(",")[1];
  };

  const handleExtract = async () => {
    if (!ocrFile) return;
    setExtracting(true);
    setOcrError("");
    try {
      const base64 = hasSelection ? getCroppedBase64() : await toBase64(ocrFile);
      const res = await extractTextFromImage(base64, ocrFile.type);
      setExtractedText(res.data.text || "");
    } catch (e) {
      setOcrError("Extraction failed. Please try again.");
      console.error(e);
    } finally {
      setExtracting(false);
    }
  };

  const handleUseText = () => {
    if (ocrTarget === "question") {
      setQuestion(extractedText);
    } else if (ocrTarget.startsWith("option_")) {
      const idx = parseInt(ocrTarget.split("_")[1]);
      handleOptionChange(idx, extractedText);
    } else if (ocrTarget === "explanation") {
      setExplanation(extractedText);
    }
    closeOcrModal();
  };

  const openOcrModal = (target) => {
    setOcrTarget(target);
    setShowOcrModal(true);
  };

  const closeOcrModal = () => {
    setShowOcrModal(false);
    setOcrFile(null);
    setOcrPreviewUrl("");
    setExtractedText("");
    setOcrError("");
    setDragOver(false);
    setHasSelection(false);
    setIsDragging(false);
    setSelection({ startX: 0, startY: 0, endX: 0, endY: 0 });
    imageRef.current = null;
  };

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
      const emptyIdx = options.findIndex((o) => !o.optionText.trim());
      if (emptyIdx !== -1) { alert(`Option ${["A","B","C","D"][emptyIdx]} cannot be empty.`); return; }
      const correctIndex = ["A","B","C","D"].indexOf(correctOption);
      payload = {
        questionText: question,
        explanation: explanation.trim() || null,
        difficulty,
        chapterId: selectedChapter,
        questionType: "MCQ",
        options: options.map((opt, idx) => ({ optionText: opt.optionText, isCorrect: idx === correctIndex })),
      };
    } else {
      if (!integerAnswer.toString().trim()) { alert("Please enter the correct integer answer."); return; }
      payload = {
        questionText: question,
        explanation: explanation.trim() || null,
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

  const ocrTargetLabel =
    ocrTarget === "question" ? "Question"
    : ocrTarget.startsWith("option_") ? `Option ${["A","B","C","D"][parseInt(ocrTarget.split("_")[1])]}`
    : "Explanation";

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto p-6 space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold text-blue-700">Add Question</h1>

      {/* Math Toolbar */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={11} className="text-blue-500" />
          <span className="text-xs font-semibold text-gray-500">Math Toolbar</span>
          <span className="text-xs text-gray-400">— click any symbol to insert into the focused field</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {MATH_TOOLBAR.map(({ label, snippet, title }) => (
            <button
              key={label}
              type="button"
              title={title}
              onClick={() => insertAtCursor(snippet)}
              className="px-2 py-1 text-xs font-medium border border-gray-200 rounded-md bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition text-gray-700"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject + Chapter */}
      <div className="flex gap-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-800 focus:outline-none focus:border-blue-500"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
        </select>
        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-800 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          disabled={!selectedSubject}
        >
          <option value="">Select Chapter</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>{c.chapterName}</option>)}
        </select>
      </div>

      {/* Question Type Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-gray-700 font-medium text-sm">Question Type:</span>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          {["MCQ", "INTEGER"].map((type, i) => (
            <button
              key={type}
              onClick={() => setQuestionType(type)}
              className={`px-5 py-2 text-sm font-medium transition ${i > 0 ? "border-l border-gray-300" : ""} ${questionType === type ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              {type === "INTEGER" ? "Integer" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Question Text</label>
          <button
            onClick={() => openOcrModal("question")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1a3db5, #184af0)" }}
          >
            <ImagePlus size={13} />
            Upload Image
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onFocus={(e) => trackFocus(e.target, setQuestion)}
          placeholder="Type your question or use Upload Image to extract from a screenshot"
          className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-gray-800 placeholder-gray-400 resize-none overflow-hidden focus:outline-none focus:border-blue-500 font-mono text-sm"
          rows={3}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
        {question && (
          <div className="border border-blue-100 rounded-lg p-3 bg-blue-50">
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mb-1.5">
              <Sparkles size={11} /> Preview
            </span>
            <div className="text-gray-800 text-sm leading-relaxed">
              <MathRenderer text={question} />
            </div>
          </div>
        )}
      </div>

      {/* MCQ Options */}
      {questionType === "MCQ" && (
        <div className="space-y-3">
          {["A","B","C","D"].map((label, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  value={label}
                  checked={correctOption === label}
                  onChange={(e) => setCorrectOption(e.target.value)}
                  className="accent-blue-600 flex-shrink-0"
                />
                <span className="w-5 font-semibold text-gray-700 text-sm">{label}.</span>
                <textarea
                  ref={(el) => (optionRefs.current[idx] = el)}
                  value={options[idx].optionText}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  onFocus={(e) => trackFocus(e.target, (val) => handleOptionChange(idx, val))}
                  placeholder={`Option ${label}`}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-800 placeholder-gray-400 resize-none overflow-hidden focus:outline-none focus:border-blue-500 font-mono text-sm"
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
                <button
                  onClick={() => openOcrModal(`option_${idx}`)}
                  title={`Extract from image into Option ${label}`}
                  className="flex-shrink-0 p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition"
                >
                  <ImagePlus size={14} />
                </button>
              </div>
              {options[idx].optionText && (
                <div className="ml-9 border border-blue-100 rounded-lg px-3 py-2 bg-blue-50">
                  <div className="text-gray-800 text-sm leading-relaxed">
                    <MathRenderer text={options[idx].optionText} />
                  </div>
                </div>
              )}
            </div>
          ))}
          <p className="text-xs text-gray-400">Select the radio button next to the correct option.</p>
        </div>
      )}

      {/* Integer Answer */}
      {questionType === "INTEGER" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer <span className="text-gray-400 font-normal">(numeric)</span>
          </label>
          <input
            type="number"
            value={integerAnswer}
            onChange={(e) => setIntegerAnswer(e.target.value)}
            placeholder="Enter the correct integer answer"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs text-gray-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Solution / Explanation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Solution / Explanation
            <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <button
            onClick={() => openOcrModal("explanation")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition"
          >
            <ImagePlus size={12} />
            From image
          </button>
        </div>
        <textarea
          ref={explanationRef}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          onFocus={(e) => trackFocus(e.target, setExplanation)}
          placeholder="Write the step-by-step solution. Use $...$ for inline math, $$...$$ for block equations."
          className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 font-mono text-sm"
          rows={3}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
        {explanation && (
          <div className="border border-green-100 rounded-lg p-3 bg-green-50">
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1 mb-1.5">
              <Sparkles size={11} /> Solution Preview
            </span>
            <div className="text-gray-800 text-sm leading-relaxed">
              <MathRenderer text={explanation} />
            </div>
          </div>
        )}
      </div>

      {/* Difficulty */}
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-800 focus:outline-none focus:border-blue-500"
      >
        <option value="">Select Difficulty</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      {/* Action Buttons */}
      <div className="flex justify-between pt-2">
        <button
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition"
          onClick={() => window.history.back()}
        >
          Back
        </button>
        <button
          className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-700 transition"
          onClick={handleSave}
        >
          Save Question
        </button>
      </div>

      {/* ── OCR Modal ───────────────────────────────────────────────────────── */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <ImagePlus size={18} className="text-blue-600" />
                  Extract Text from Image
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Extracting into:{" "}
                  <span className="font-medium text-blue-600">{ocrTargetLabel}</span>
                  {" · "}Upload image → drag to select a region → extract
                </p>
              </div>
              <button onClick={closeOcrModal} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />

              {!ocrPreviewUrl && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
                    dragOver ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <ImagePlus size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    Drag & drop an image, or <span className="text-blue-600 font-medium">click to browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP supported</p>
                </div>
              )}

              {ocrPreviewUrl && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Crop size={12} />
                      {hasSelection
                        ? <span className="text-blue-600 font-medium">Region selected — click Extract to process</span>
                        : <span>Drag on the image to select a region, or extract the full image</span>}
                    </div>
                    <button
                      onClick={() => { setOcrFile(null); setOcrPreviewUrl(""); setHasSelection(false); setExtractedText(""); }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
                    >
                      <RefreshCw size={11} /> Change image
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="w-full rounded-xl border border-gray-200 cursor-crosshair"
                    style={{ maxHeight: "340px", objectFit: "contain" }}
                  />
                </div>
              )}

              {ocrFile && !extractedText && (
                <button
                  onClick={handleExtract}
                  disabled={extracting}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #1a3db5, #184af0)" }}
                >
                  {extracting ? (
                    <><Loader2 size={15} className="animate-spin" /> Extracting with Gemini AI...</>
                  ) : hasSelection ? (
                    <><Crop size={15} /> Extract Selected Region</>
                  ) : (
                    <><Sparkles size={15} /> Extract Full Image</>
                  )}
                </button>
              )}

              {ocrError && <p className="text-sm text-red-500 text-center">{ocrError}</p>}

              {extractedText && (
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <span className="text-xs font-semibold text-gray-500">Raw LaTeX (editable)</span>
                    </div>
                    <textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm font-mono text-gray-800 resize-none focus:outline-none"
                      rows={4}
                    />
                  </div>
                  <div className="border border-blue-100 rounded-xl overflow-hidden">
                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                        <Sparkles size={11} /> Rendered Preview
                      </span>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-800 leading-relaxed">
                      <MathRenderer text={extractedText} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeOcrModal}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUseText}
                disabled={!extractedText}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #1a3db5, #184af0)" }}
              >
                Use this text → {ocrTargetLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
