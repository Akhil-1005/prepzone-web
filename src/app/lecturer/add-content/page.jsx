"use client";

import { useState, useEffect, Suspense } from "react";
import {
  PlusCircle, BookOpen, Layers, HelpCircle,
  Search, Pencil, Trash2, X, ChevronDown, AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getChapterBySubject, getSubjects, saveChapter, saveSubject,
  getQuestionsByChapter, deleteSubject, updateSubject,
  deleteChapter, updateChapter, deleteQuestion,
} from "@/services/lecturerService";

// ── Helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function TypeBadge({ type }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      type === "MCQ" ? "bg-indigo-100 text-indigo-600" : "bg-orange-100 text-orange-600"
    }`}>
      {type === "INTEGER" ? "Integer" : "MCQ"}
    </span>
  );
}

function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null;
  const map = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Hard: "bg-red-100 text-red-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[difficulty] ?? "bg-gray-100 text-gray-500"}`}>
      {difficulty}
    </span>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-300" />
      </div>
      <p className="text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function StyledSelect({ value, onChange, disabled, className = "", children }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="appearance-none w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-9"
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

function Modal({ title, onClose, onSave, saving, error, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 space-y-4">{children}</div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <Spinner />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function AddContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") || "Subjects";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Data ──────────────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Chapter tab filter
  const [chapterFilterSubjectId, setChapterFilterSubjectId] = useState("");

  // Questions tab filters
  const [questionFilterSubjectId, setQuestionFilterSubjectId] = useState("");
  const [questionFilterChapterId, setQuestionFilterChapterId] = useState("");
  const [questionChapters, setQuestionChapters] = useState([]);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalError, setModalError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Add Subject
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [savingSubject, setSavingSubject] = useState(false);

  // Edit Subject
  const [editingSubject, setEditingSubject] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [updatingSubject, setUpdatingSubject] = useState(false);

  // Add Chapter
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ subjectId: "", chapterName: "" });
  const [savingChapter, setSavingChapter] = useState(false);

  // Edit Chapter
  const [editingChapter, setEditingChapter] = useState(null);
  const [editChapterName, setEditChapterName] = useState("");
  const [updatingChapter, setUpdatingChapter] = useState(false);

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data.data ?? []);
    } catch (e) { console.error(e); }
  };

  const loadChapters = async (subjectId) => {
    if (!subjectId) { setChapters([]); return; }
    try {
      const res = await getChapterBySubject(subjectId);
      setChapters(res.data.data ?? []);
    } catch (e) { console.error(e); }
  };

  const loadQuestions = async (chapterId) => {
    if (!chapterId) { setQuestions([]); return; }
    try {
      const res = await getQuestionsByChapter(chapterId);
      setQuestions(res.data.data ?? []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => { loadChapters(chapterFilterSubjectId); }, [chapterFilterSubjectId]);
  useEffect(() => {
    if (!questionFilterSubjectId) {
      setQuestionChapters([]); setQuestionFilterChapterId(""); setQuestions([]); return;
    }
    getChapterBySubject(questionFilterSubjectId)
      .then(res => setQuestionChapters(res.data.data ?? []))
      .catch(console.error);
    setQuestionFilterChapterId("");
    setQuestions([]);
  }, [questionFilterSubjectId]);
  useEffect(() => { loadQuestions(questionFilterChapterId); }, [questionFilterChapterId]);

  // ── Tab navigation ────────────────────────────────────────────────────────
  const updateTab = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    router.replace(`?tab=${tab}`);
  };

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredSubjects = subjects.filter(s =>
    s.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredChapters = chapters.filter(c =>
    c.chapterName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredQuestions = questions.filter(q =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Handlers: Subject ─────────────────────────────────────────────────────
  const handleSaveSubject = async () => {
    if (!subjectName.trim()) { setModalError("Subject name cannot be empty."); return; }
    setSavingSubject(true); setModalError("");
    try {
      const res = await saveSubject({ subjectName });
      if (res.data.statusCode === "201 CREATED") {
        setShowAddSubject(false); setSubjectName("");
        await loadSubjects();
      } else {
        setModalError(res.data.message || "Failed to save.");
      }
    } catch { setModalError("Something went wrong."); }
    finally { setSavingSubject(false); }
  };

  const handleUpdateSubject = async () => {
    if (!editSubjectName.trim()) { setModalError("Subject name cannot be empty."); return; }
    setUpdatingSubject(true); setModalError("");
    try {
      const res = await updateSubject(editingSubject.id, { subjectName: editSubjectName });
      if (res.data.statusCode === "200 OK") {
        setEditingSubject(null); await loadSubjects();
      } else {
        setModalError(res.data.message || "Failed to update.");
      }
    } catch { setModalError("Something went wrong."); }
    finally { setUpdatingSubject(false); }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Delete this subject? Its chapters and questions will also be removed.")) return;
    setDeletingId(id);
    try { await deleteSubject(id); await loadSubjects(); }
    catch { alert("Failed to delete subject."); }
    finally { setDeletingId(null); }
  };

  // ── Handlers: Chapter ─────────────────────────────────────────────────────
  const handleSaveChapter = async () => {
    if (!newChapter.subjectId) { setModalError("Please select a subject."); return; }
    if (!newChapter.chapterName.trim()) { setModalError("Chapter name cannot be empty."); return; }
    setSavingChapter(true); setModalError("");
    try {
      const res = await saveChapter(newChapter, newChapter.subjectId);
      if (res.data.statusCode === "201 CREATED") {
        setShowAddChapter(false);
        setChapterFilterSubjectId(newChapter.subjectId);
        setNewChapter({ subjectId: "", chapterName: "" });
      } else {
        setModalError(res.data.message || "Failed to save.");
      }
    } catch { setModalError("Something went wrong."); }
    finally { setSavingChapter(false); }
  };

  const handleUpdateChapter = async () => {
    if (!editChapterName.trim()) { setModalError("Chapter name cannot be empty."); return; }
    setUpdatingChapter(true); setModalError("");
    try {
      const res = await updateChapter(editingChapter.id, { chapterName: editChapterName });
      if (res.data.statusCode === "200 OK") {
        setEditingChapter(null); await loadChapters(chapterFilterSubjectId);
      } else {
        setModalError(res.data.message || "Failed to update.");
      }
    } catch { setModalError("Something went wrong."); }
    finally { setUpdatingChapter(false); }
  };

  const handleDeleteChapter = async (id) => {
    if (!window.confirm("Delete this chapter? Its questions will also be removed.")) return;
    setDeletingId(id);
    try { await deleteChapter(id); await loadChapters(chapterFilterSubjectId); }
    catch { alert("Failed to delete chapter."); }
    finally { setDeletingId(null); }
  };

  // ── Handlers: Question ────────────────────────────────────────────────────
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    setDeletingId(id);
    try { await deleteQuestion(id); await loadQuestions(questionFilterChapterId); }
    catch { alert("Failed to delete question."); }
    finally { setDeletingId(null); }
  };

  // ── Add button ────────────────────────────────────────────────────────────
  const handleAdd = () => {
    setModalError("");
    if (activeTab === "Subjects") { setSubjectName(""); setShowAddSubject(true); }
    else if (activeTab === "Chapters") { setNewChapter({ subjectId: "", chapterName: "" }); setShowAddChapter(true); }
    else router.push("/lecturer/add-content/add-question");
  };

  // ── Tab config ────────────────────────────────────────────────────────────
  const tabs = [
    { id: "Subjects",  label: "Subjects",  icon: BookOpen,   count: subjects.length },
    { id: "Chapters",  label: "Chapters",  icon: Layers,     count: chapters.length },
    { id: "Questions", label: "Questions", icon: HelpCircle, count: questions.length },
  ];

  const addButtonLabel =
    activeTab === "Subjects" ? "Add Subject" :
    activeTab === "Chapters" ? "Add Chapter" : "Add Question";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Content</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your subjects, chapters and questions</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <PlusCircle size={17} />
          <span className="hidden sm:inline">{addButtonLabel}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Segment tab bar */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-5 gap-1">
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => updateTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                active ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center ${
                active ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* ── SUBJECTS TAB ──────────────────────────────────────────────────── */}
      {activeTab === "Subjects" && (
        <div className="space-y-2.5">
          {filteredSubjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects yet"
              subtitle='Click "Add Subject" to create your first subject'
            />
          ) : (
            filteredSubjects.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-4 hover:shadow-md transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-blue-500" />
                </div>
                <p className="flex-1 font-semibold text-gray-900 truncate">{s.subjectName}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingSubject(s); setEditSubjectName(s.subjectName); setModalError(""); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(s.id)}
                    disabled={deletingId === s.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === s.id ? <Spinner /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── CHAPTERS TAB ──────────────────────────────────────────────────── */}
      {activeTab === "Chapters" && (
        <div>
          <StyledSelect
            value={chapterFilterSubjectId}
            onChange={(e) => setChapterFilterSubjectId(e.target.value)}
            className="max-w-xs mb-5"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.subjectName}</option>
            ))}
          </StyledSelect>

          <div className="space-y-2.5">
            {filteredChapters.length === 0 ? (
              <EmptyState
                icon={Layers}
                title={chapterFilterSubjectId ? "No chapters in this subject" : "Select a subject to view chapters"}
                subtitle={chapterFilterSubjectId ? 'Click "Add Chapter" to create one' : ""}
              />
            ) : (
              filteredChapters.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-4 hover:shadow-md transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Layers size={18} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.chapterName}</p>
                    {chapterFilterSubjectId && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {subjects.find((s) => s.id === chapterFilterSubjectId)?.subjectName}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingChapter(c); setEditChapterName(c.chapterName); setModalError(""); }}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(c.id)}
                      disabled={deletingId === c.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === c.id ? <Spinner /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── QUESTIONS TAB ─────────────────────────────────────────────────── */}
      {activeTab === "Questions" && (
        <div>
          <div className="flex gap-3 mb-5 flex-wrap">
            <StyledSelect
              value={questionFilterSubjectId}
              onChange={(e) => setQuestionFilterSubjectId(e.target.value)}
              className="flex-1 min-w-[150px]"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.subjectName}</option>
              ))}
            </StyledSelect>
            <StyledSelect
              value={questionFilterChapterId}
              onChange={(e) => setQuestionFilterChapterId(e.target.value)}
              disabled={!questionFilterSubjectId}
              className="flex-1 min-w-[150px]"
            >
              <option value="">Select Chapter</option>
              {questionChapters.map((c) => (
                <option key={c.id} value={c.id}>{c.chapterName}</option>
              ))}
            </StyledSelect>
          </div>

          <div className="space-y-2.5">
            {filteredQuestions.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title={
                  questionFilterChapterId
                    ? "No questions in this chapter"
                    : "Select a subject and chapter"
                }
                subtitle={
                  questionFilterChapterId
                    ? 'Click "Add Question" to create one'
                    : "Use the filters above to load questions"
                }
              />
            ) : (
              filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 hover:shadow-md transition group"
                >
                  <div className="flex items-start gap-3">
                    <p className="flex-1 text-gray-900 font-medium text-sm line-clamp-2 leading-relaxed">
                      {q.questionText}
                    </p>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={deletingId === q.id}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === q.id ? <Spinner /> : <Trash2 size={15} />}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <TypeBadge type={q.questionType} />
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── ADD SUBJECT MODAL ─────────────────────────────────────────────── */}
      {showAddSubject && (
        <Modal
          title="Add Subject"
          onClose={() => setShowAddSubject(false)}
          onSave={handleSaveSubject}
          saving={savingSubject}
          error={modalError}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Name</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Physics"
              value={subjectName}
              onChange={(e) => { setSubjectName(e.target.value); setModalError(""); }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </Modal>
      )}

      {/* ── EDIT SUBJECT MODAL ────────────────────────────────────────────── */}
      {editingSubject && (
        <Modal
          title="Edit Subject"
          onClose={() => setEditingSubject(null)}
          onSave={handleUpdateSubject}
          saving={updatingSubject}
          error={modalError}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Name</label>
            <input
              autoFocus
              type="text"
              value={editSubjectName}
              onChange={(e) => { setEditSubjectName(e.target.value); setModalError(""); }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </Modal>
      )}

      {/* ── ADD CHAPTER MODAL ─────────────────────────────────────────────── */}
      {showAddChapter && (
        <Modal
          title="Add Chapter"
          onClose={() => setShowAddChapter(false)}
          onSave={handleSaveChapter}
          saving={savingChapter}
          error={modalError}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <StyledSelect
              value={newChapter.subjectId}
              onChange={(e) => { setNewChapter({ ...newChapter, subjectId: e.target.value }); setModalError(""); }}
            >
              <option value="">Select a subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.subjectName}</option>
              ))}
            </StyledSelect>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Chapter Name</label>
            <input
              type="text"
              placeholder="e.g. Mechanics"
              value={newChapter.chapterName}
              onChange={(e) => { setNewChapter({ ...newChapter, chapterName: e.target.value }); setModalError(""); }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </Modal>
      )}

      {/* ── EDIT CHAPTER MODAL ────────────────────────────────────────────── */}
      {editingChapter && (
        <Modal
          title="Edit Chapter"
          onClose={() => setEditingChapter(null)}
          onSave={handleUpdateChapter}
          saving={updatingChapter}
          error={modalError}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Chapter Name</label>
            <input
              autoFocus
              type="text"
              value={editChapterName}
              onChange={(e) => { setEditChapterName(e.target.value); setModalError(""); }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AddContentPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
      <AddContentInner />
    </Suspense>
  );
}
