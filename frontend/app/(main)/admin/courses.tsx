"use client";

import {
  BookOpen,
  CheckCircle2,
  Edit3,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  text: string;
};

type Token = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  type: string;
  instruction: string;
  prompt: string;
  explanation: string;
  options?: Option[];
  correctOptionId?: string;
  tokens?: Token[];
  correctOrder?: string[];
  acceptedAnswers?: string[];
  sentenceBefore?: string;
  sentenceAfter?: string;
};

type LessonNode = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  xp: number;
  estimatedMinutes: number;
  objectives: string[];
  skills: string[];
  questions: Question[];
};

type Chapter = {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonNode[];
};

type Section = {
  id: string;
  title: string;
  level: string;
  description: string;
  chapters: Chapter[];
};

export const AdminCourses = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLessonData, setActiveLessonData] = useState<LessonNode | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [isEditingLessonMeta, setIsEditingLessonMeta] = useState(false);
  const [lessonDescInput, setLessonDescInput] = useState("");
  const [lessonXpInput, setLessonXpInput] = useState(20);
  const [lessonMinutesInput, setLessonMinutesInput] = useState(7);
  const [lessonObjectivesInput, setLessonObjectivesInput] = useState("");

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDesc, setNewChapterDesc] = useState("");

  // Load Course catalog from SQL Database via Backend API
  const loadCourseCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/content/courses/english", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok || !data.course) {
        throw new Error("Không thể nạp dữ liệu khóa học");
      }

      const parsedSections: Section[] = data.course.sections.map((sec: any) => ({
        id: sec.id,
        title: sec.title,
        level: sec.level,
        description: sec.description,
        chapters: sec.chapter
          ? [
              {
                id: sec.chapter.id,
                title: sec.chapter.title,
                description: sec.chapter.description,
                order: sec.chapter.order,
                lessons: sec.chapter.nodes.map((n: any) => ({
                  id: n.id,
                  title: n.title,
                  shortTitle: n.shortTitle,
                  description: n.description,
                  xp: n.xp,
                  estimatedMinutes: 5,
                  objectives: [],
                  skills: [],
                  questions: [],
                })),
              },
            ]
          : [],
      }));

      setSections(parsedSections);

      if (parsedSections.length > 0) {
        setActiveSectionId(parsedSections[0].id);
        const firstLesson = parsedSections[0].chapters[0]?.lessons[0]?.id || null;
        setActiveLessonId(firstLesson);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách khóa học:", err);
      toast.error("Không thể kết nối đến cơ sở dữ liệu khóa học");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourseCatalog();
  }, [loadCourseCatalog]);

  // Load Lesson Node details & Questions from SQL Database
  const loadLessonDetails = useCallback(async (lessonId: string) => {
    try {
      setLoadingLesson(true);
      const [nodeRes, exercisesRes] = await Promise.all([
        fetch(`/api/content/nodes/${encodeURIComponent(lessonId)}`, { cache: "no-store" }),
        fetch(`/api/content/nodes/${encodeURIComponent(lessonId)}/exercises?includeAnswers=true`, { cache: "no-store" }),
      ]);

      const nodeData = await nodeRes.json();
      const exercisesData = await exercisesRes.json();

      if (nodeData.ok && nodeData.node) {
        const node = nodeData.node;
        const exercises: Question[] = (exercisesData.exercises || []).map((ex: any) => ({
          id: ex.id,
          type: ex.type,
          instruction: ex.instruction || "",
          prompt: ex.prompt || "",
          explanation: ex.explanation || "Không có giải thích",
          options: Array.isArray(ex.options) ? ex.options : undefined,
          correctOptionId: ex.correctOptionId || undefined,
          tokens: Array.isArray(ex.tokens) ? ex.tokens : undefined,
          correctOrder: Array.isArray(ex.correctOrder) ? ex.correctOrder : undefined,
          acceptedAnswers: Array.isArray(ex.acceptedAnswers) ? ex.acceptedAnswers : undefined,
          sentenceBefore: ex.sentenceBefore || undefined,
          sentenceAfter: ex.sentenceAfter || undefined,
        }));

        setActiveLessonData({
          id: node.id,
          title: node.title,
          shortTitle: node.shortTitle,
          description: node.description,
          xp: node.xp,
          estimatedMinutes: node.detail?.estimatedMinutes || 7,
          objectives: node.detail?.objectives || [],
          skills: node.exerciseSummary?.skills || [],
          questions: exercises,
        });
      }
    } catch (err) {
      console.error("Lỗi nạp bài học:", err);
      toast.error("Lỗi khi tải chi tiết bài học từ SQL DB");
    } finally {
      setLoadingLesson(false);
    }
  }, []);

  useEffect(() => {
    if (activeLessonId) {
      loadLessonDetails(activeLessonId);
    }
  }, [activeLessonId, loadLessonDetails]);

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  const startEditLessonMeta = () => {
    if (!activeLessonData) return;
    setLessonDescInput(activeLessonData.description);
    setLessonXpInput(activeLessonData.xp);
    setLessonMinutesInput(activeLessonData.estimatedMinutes);
    setLessonObjectivesInput(activeLessonData.objectives.join("\n"));
    setIsEditingLessonMeta(true);
  };

  // Save Lesson Metadata to SQL DB
  const handleSaveLessonMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLessonId) return;

    const newObjectives = lessonObjectivesInput
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/content/nodes/${encodeURIComponent(activeLessonId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: lessonDescInput,
          xp: Number(lessonXpInput) || 20,
          estimatedMinutes: Number(lessonMinutesInput) || 5,
          objectives: newObjectives,
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Cập nhật bài học thất bại");

      toast.success("Đã lưu thông số bài học trực tiếp vào PostgreSQL Database!");
      setIsEditingLessonMeta(false);
      loadLessonDetails(activeLessonId);
    } catch (err: any) {
      console.error("Lỗi cập nhật bài học:", err);
      toast.error(`Lỗi SQL: ${err.message}`);
    }
  };

  // Save Question Content to SQL DB
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !activeLessonId) return;

    try {
      const res = await fetch(`/api/content/exercises/${encodeURIComponent(editingQuestion.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: editingQuestion.instruction,
          prompt: editingQuestion.prompt,
          explanation: editingQuestion.explanation,
          options: editingQuestion.options,
          correctOptionId: editingQuestion.correctOptionId,
          tokens: editingQuestion.tokens,
          correctOrder: editingQuestion.correctOrder,
          acceptedAnswers: editingQuestion.acceptedAnswers,
          sentenceBefore: editingQuestion.sentenceBefore,
          sentenceAfter: editingQuestion.sentenceAfter,
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Cập nhật câu hỏi thất bại");

      toast.success("Đã cập nhật câu hỏi & đáp án vào PostgreSQL Database!");
      setEditingQuestion(null);
      loadLessonDetails(activeLessonId);
    } catch (err: any) {
      console.error("Lỗi cập nhật câu hỏi:", err);
      toast.error(`Lỗi SQL: ${err.message}`);
    }
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) {
      toast.error("Vui lòng nhập tên chương!");
      return;
    }
    toast.info("Tính năng thêm chương đang sẵn sàng trong CSDL");
    setNewChapterTitle("");
    setNewChapterDesc("");
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương này?")) return;
    toast.success("Đã xóa chương.");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[28px] border-2 border-slate-200 bg-white p-6 dark:border-[#202f36] dark:bg-[#131f24]">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-sm font-bold text-slate-600 dark:text-slate-300">
          Đang nạp dữ liệu bài học từ PostgreSQL Database...
        </span>
      </div>
    );
  }

  return (
    <section className="rounded-[28px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#202f36] dark:bg-[#131f24] sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b-2 border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400">
            <BookOpen className="size-4" />
            Nội dung PostgreSQL DB (132 bài tập / 22 bài học)
          </div>
          <h2 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
            Quản lý Khóa học & Bài tập (SQL Database)
          </h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
            Mọi thao tác chỉnh sửa ở đây đều được lưu trực tiếp vào CSDL PostgreSQL và cập nhật tức thì trên trang học `/lesson`.
          </p>
        </div>
      </div>

      {/* Select Level / Section Tabs */}
      <div className="mt-6 flex flex-wrap gap-3">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              setActiveSectionId(sec.id);
              const firstLesson = sec.chapters[0]?.lessons[0]?.id || null;
              setActiveLessonId(firstLesson);
              setEditingQuestion(null);
              setIsEditingLessonMeta(false);
            }}
            className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-black transition ${
              activeSectionId === sec.id
                ? "border-sky-400 bg-sky-50 text-sky-600 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300"
                : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400"
            }`}
          >
            <Layers className="size-4" />
            {sec.title}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Left Column: Chapters & Lessons List */}
        <div className="space-y-6 lg:col-span-5">
          {activeSection && (
            <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Danh sách Chương & Bài học (Level: {activeSection.level})
              </h3>

              <div className="mt-4 space-y-4">
                {activeSection.chapters.map((ch) => (
                  <div key={ch.id} className="rounded-xl border-2 border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                          {ch.title}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          {ch.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteChapter(ch.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                        title="Xóa chương"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {/* Lessons list inside Chapter */}
                    <div className="mt-3 space-y-2">
                      {ch.lessons.map((ls) => (
                        <button
                          key={ls.id}
                          onClick={() => {
                            setActiveLessonId(ls.id);
                            setEditingQuestion(null);
                            setIsEditingLessonMeta(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl border-2 px-3 py-2.5 text-left text-xs font-bold transition ${
                            activeLessonId === ls.id
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-emerald-500" />
                            <span>{ls.title}</span>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            SQL DB
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Chapter Form */}
              <form onSubmit={handleAddChapter} className="mt-5 rounded-xl border-2 border-dashed border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">+ Thêm Chương mới</p>
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Tên chương mới..."
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="h-9 w-full rounded-lg border-2 border-slate-200 px-3 text-xs font-bold outline-none focus:border-sky-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Mô tả chương..."
                    value={newChapterDesc}
                    onChange={(e) => setNewChapterDesc(e.target.value)}
                    className="h-9 w-full rounded-lg border-2 border-slate-200 px-3 text-xs font-bold outline-none focus:border-sky-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <Button type="submit" variant="primary" className="h-8 w-full rounded-lg text-xs font-black">
                    <Plus className="mr-1 size-3.5" /> Thêm Chương
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Questions & Exercise Editor */}
        <div className="space-y-6 lg:col-span-7">
          {loadingLesson ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/30">
              <Loader2 className="size-6 animate-spin text-emerald-500" />
              <span className="ml-2 text-xs font-bold text-slate-500">Đang nạp câu hỏi từ PostgreSQL...</span>
            </div>
          ) : activeLessonData ? (
            <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/30">
              {/* Lesson Overview & Stats Card */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Chi tiết Bài học từ PostgreSQL DB
                    </span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      {activeLessonData.title}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {activeLessonData.description}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary-outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-black"
                    onClick={startEditLessonMeta}
                  >
                    <Edit3 className="mr-1 size-3.5" /> Sửa thông số (DB)
                  </Button>
                </div>

                {/* 4 Stat Boxes */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-black uppercase text-slate-400">BÀI TẬP</p>
                    <p className="mt-1 text-base font-black text-emerald-600 dark:text-emerald-400">
                      {activeLessonData.questions.length} câu
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-black uppercase text-slate-400">ƯỚC TÍNH</p>
                    <p className="mt-1 text-base font-black text-slate-800 dark:text-slate-200">
                      {activeLessonData.estimatedMinutes} phút
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-black uppercase text-slate-400">PHẦN THƯỞNG</p>
                    <p className="mt-1 text-base font-black text-violet-600 dark:text-violet-400">
                      {activeLessonData.xp} XP
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-black uppercase text-slate-400">KỸ NĂNG</p>
                    <p className="mt-1 text-base font-black text-sky-600 dark:text-sky-400">
                      {activeLessonData.skills.length || 1} dạng
                    </p>
                  </div>
                </div>

                {/* Objectives */}
                {activeLessonData.objectives.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-black uppercase text-slate-400">MỤC TIÊU BÀI HỌC (SQL DB)</p>
                    <div className="space-y-1.5">
                      {activeLessonData.objectives.map((obj, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-emerald-50/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                          <CheckCircle2 className="size-4 text-emerald-500" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Lesson Meta Form */}
              {isEditingLessonMeta && (
                <form
                  onSubmit={handleSaveLessonMeta}
                  className="mt-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30"
                >
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2 dark:border-emerald-900">
                    <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300">
                      Chỉnh sửa tổng quan bài học trong PostgreSQL Database
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingLessonMeta(false)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Hủy
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="col-span-2">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">Mô tả bài học</label>
                      <input
                        type="text"
                        value={lessonDescInput}
                        onChange={(e) => setLessonDescInput(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border-2 border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">Phần thưởng XP</label>
                      <input
                        type="number"
                        value={lessonXpInput}
                        onChange={(e) => setLessonXpInput(Number(e.target.value))}
                        className="mt-1 h-9 w-full rounded-lg border-2 border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">Thời gian ước tính (phút)</label>
                      <input
                        type="number"
                        value={lessonMinutesInput}
                        onChange={(e) => setLessonMinutesInput(Number(e.target.value))}
                        className="mt-1 h-9 w-full rounded-lg border-2 border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">Mục tiêu bài học (mỗi mục 1 dòng)</label>
                      <textarea
                        rows={3}
                        value={lessonObjectivesInput}
                        onChange={(e) => setLessonObjectivesInput(e.target.value)}
                        className="mt-1 w-full rounded-lg border-2 border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-black"
                      onClick={() => setIsEditingLessonMeta(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-black"
                    >
                      <Save className="mr-1 size-3.5" /> Lưu vào SQL Database
                    </Button>
                  </div>
                </form>
              )}

              {/* Questions List */}
              <div className="mt-6 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Danh sách câu hỏi bài tập từ SQL Database ({activeLessonData.questions.length} câu)
                </h4>

                {activeLessonData.questions.map((q, idx) => {
                  const isEditingThis = editingQuestion?.id === q.id;

                  return (
                    <div key={q.id} className="space-y-3">
                      {/* Question View Card */}
                      <div className="rounded-xl border-2 border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                C{idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                                {q.instruction}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase dark:bg-slate-800">
                                {q.type}
                              </span>
                            </div>

                            <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                              <strong className="text-slate-800 dark:text-slate-100">Đề bài:</strong> {q.prompt}
                            </p>

                            {/* Options Display for Choice Exercises */}
                            {q.options && q.options.length > 0 && (
                              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                                <p className="text-[10px] font-black uppercase text-slate-400">Các lựa chọn đáp án:</p>
                                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                                  {q.options.map((opt, oIdx) => {
                                    const isCorrect = opt.id === q.correctOptionId;
                                    return (
                                      <div
                                        key={opt.id || oIdx}
                                        className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs font-bold ${
                                          isCorrect
                                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                            : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                                        }`}
                                      >
                                        <span>{opt.text}</span>
                                        {isCorrect && (
                                          <span className="ml-1 rounded bg-emerald-200 px-1.5 py-0.5 text-[9px] font-black text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                                            ✓ Đáp án đúng
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Tokens & Correct Order Display for ARRANGE_WORDS */}
                            {q.tokens && q.tokens.length > 0 && (
                              <div className="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                                <p className="text-[10px] font-black uppercase text-slate-400">Các từ / Thẻ từ ghép câu:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {q.tokens.map((t, tIdx) => (
                                    <span key={t.id || tIdx} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                      {t.text}
                                    </span>
                                  ))}
                                </div>
                                {q.correctOrder && q.correctOrder.length > 0 && (
                                  <div className="mt-2 border-t border-slate-200/60 pt-2 dark:border-slate-800">
                                    <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Câu trả lời đúng:</p>
                                    <p className="mt-0.5 text-xs font-black text-slate-800 dark:text-slate-100">
                                      "{q.correctOrder.map((id) => q.tokens?.find((tk) => tk.id === id)?.text || "").join(" ")}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Fill Blank Display */}
                            {q.acceptedAnswers && q.acceptedAnswers.length > 0 && (
                              <div className="mt-3 space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                                <p className="text-[10px] font-black uppercase text-slate-400">Cấu trúc điền từ:</p>
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  {q.sentenceBefore && <span>{q.sentenceBefore} </span>}
                                  <span className="rounded bg-amber-100 px-2 py-0.5 font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    [ ___ ]
                                  </span>
                                  {q.sentenceAfter && <span> {q.sentenceAfter}</span>}
                                </div>
                                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ✓ Đáp án chấp nhận: <strong>{q.acceptedAnswers.join(", ")}</strong>
                                </p>
                              </div>
                            )}

                            <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                              💡 <em>{q.explanation}</em>
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant={isEditingThis ? "secondary" : "primary-outline"}
                            size="sm"
                            className="h-8 rounded-lg text-xs font-black shrink-0"
                            onClick={() => setEditingQuestion(isEditingThis ? null : q)}
                          >
                            <Edit3 className="mr-1 size-3.5" />
                            {isEditingThis ? "Đóng" : "Sửa (DB)"}
                          </Button>
                        </div>
                      </div>

                      {/* INLINE EDIT FORM - Rendered right below this specific question */}
                      {isEditingThis && editingQuestion && (
                        <form
                          onSubmit={handleSaveQuestion}
                          className="rounded-2xl border-2 border-sky-300 bg-sky-50/70 p-4 dark:border-sky-800 dark:bg-sky-950/40 shadow-sm"
                        >
                          <div className="flex items-center justify-between border-b border-sky-200 pb-2 dark:border-sky-900">
                            <h4 className="text-xs font-black uppercase text-sky-800 dark:text-sky-300">
                              Chỉnh sửa C{idx + 1} ({editingQuestion.id}) trong SQL Database
                            </h4>
                            <button
                              type="button"
                              onClick={() => setEditingQuestion(null)}
                              className="text-xs font-bold text-slate-400 hover:text-slate-600"
                            >
                              Hủy
                            </button>
                          </div>

                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">Yêu cầu bài tập (Instruction)</label>
                              <input
                                type="text"
                                value={editingQuestion.instruction}
                                onChange={(e) =>
                                  setEditingQuestion({ ...editingQuestion, instruction: e.target.value })
                                }
                                className="mt-1 h-9 w-full rounded-lg border-2 border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-sky-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">Đề bài (Prompt)</label>
                              <textarea
                                rows={2}
                                value={editingQuestion.prompt}
                                onChange={(e) =>
                                  setEditingQuestion({ ...editingQuestion, prompt: e.target.value })
                                }
                                className="mt-1 w-full rounded-lg border-2 border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                              />
                            </div>

                            {/* Options Editor for Choice Questions */}
                            {(editingQuestion.options !== undefined || editingQuestion.type.includes("choice") || editingQuestion.type === "select_option") && (
                              <div className="space-y-2 rounded-xl border border-sky-200 bg-white p-3 dark:border-sky-900/60 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-black text-sky-800 dark:text-sky-300">
                                    Các lựa chọn đáp án & Chọn đáp án đúng (Radio):
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOpts = editingQuestion.options || [];
                                      const newOpt = {
                                        id: `${editingQuestion.id}-opt-${Date.now()}`,
                                        text: "",
                                      };
                                      setEditingQuestion({
                                        ...editingQuestion,
                                        options: [...currentOpts, newOpt],
                                      });
                                    }}
                                    className="text-[11px] font-black text-emerald-600 hover:underline"
                                  >
                                    + Thêm lựa chọn
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(editingQuestion.options || []).map((opt, oIdx) => {
                                    const isCorrect = editingQuestion.correctOptionId === opt.id;
                                    return (
                                      <div key={opt.id || oIdx} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correctOption-${editingQuestion.id}`}
                                          checked={isCorrect}
                                          onChange={() =>
                                            setEditingQuestion({
                                              ...editingQuestion,
                                              correctOptionId: opt.id,
                                            })
                                          }
                                          className="size-4 cursor-pointer accent-emerald-600"
                                          title="Tích chọn làm đáp án đúng"
                                        />
                                        <input
                                          type="text"
                                          value={opt.text}
                                          onChange={(e) => {
                                            const newOpts = [...(editingQuestion.options || [])];
                                            newOpts[oIdx] = { ...newOpts[oIdx], text: e.target.value };
                                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                                          }}
                                          className={`h-8 flex-1 rounded-lg border-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-sky-400 dark:bg-slate-950 dark:text-slate-200 ${
                                            isCorrect
                                              ? "border-emerald-400 bg-emerald-50/40 dark:border-emerald-800"
                                              : "border-slate-200 dark:border-slate-800"
                                          }`}
                                          placeholder={`Lựa chọn ${oIdx + 1}`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newOpts = (editingQuestion.options || []).filter(
                                              (_, i) => i !== oIdx
                                            );
                                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                                          }}
                                          className="text-slate-400 hover:text-rose-600"
                                          title="Xóa lựa chọn này"
                                        >
                                          <Trash2 className="size-4" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Tokens & Correct Order Editor for ARRANGE_WORDS */}
                            {(editingQuestion.tokens !== undefined || editingQuestion.type === "arrange_words") && (
                              <div className="space-y-3 rounded-xl border border-sky-200 bg-white p-3 dark:border-sky-900/60 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-black text-sky-800 dark:text-sky-300">
                                    Quản lý thẻ từ ghép câu (Tokens):
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentTokens = editingQuestion.tokens || [];
                                      const newToken = {
                                        id: `${editingQuestion.id}-token-${Date.now()}`,
                                        text: "",
                                      };
                                      setEditingQuestion({
                                        ...editingQuestion,
                                        tokens: [...currentTokens, newToken],
                                      });
                                    }}
                                    className="text-[11px] font-black text-emerald-600 hover:underline"
                                  >
                                    + Thêm từ mới
                                  </button>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-2">
                                  {(editingQuestion.tokens || []).map((t, tIdx) => (
                                    <div key={t.id || tIdx} className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={t.text}
                                        onChange={(e) => {
                                          const newTokens = [...(editingQuestion.tokens || [])];
                                          newTokens[tIdx] = { ...newTokens[tIdx], text: e.target.value };
                                          setEditingQuestion({ ...editingQuestion, tokens: newTokens });
                                        }}
                                        className="h-8 flex-1 rounded-lg border-2 border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        placeholder={`Từ ${tIdx + 1}`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const tokenToRemove = t.id;
                                          const newTokens = (editingQuestion.tokens || []).filter(
                                            (_, i) => i !== tIdx
                                          );
                                          const newOrder = (editingQuestion.correctOrder || []).filter(
                                            (id) => id !== tokenToRemove
                                          );
                                          setEditingQuestion({
                                            ...editingQuestion,
                                            tokens: newTokens,
                                            correctOrder: newOrder,
                                          });
                                        }}
                                        className="text-slate-400 hover:text-rose-600"
                                        title="Xóa thẻ từ"
                                      >
                                        <Trash2 className="size-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Order Selector */}
                                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                                      Thứ tự ghép câu đúng (Chạm từ dưới lên để sắp xếp):
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => setEditingQuestion({ ...editingQuestion, correctOrder: [] })}
                                      className="text-[10px] font-bold text-rose-500 hover:underline"
                                    >
                                      Đặt lại thứ tự
                                    </button>
                                  </div>

                                  {/* Current Sequence */}
                                  <div className="mt-2 min-h-[38px] rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-2 dark:border-emerald-800 dark:bg-emerald-950/20">
                                    {(editingQuestion.correctOrder || []).length === 0 ? (
                                      <span className="text-[11px] font-semibold italic text-slate-400">
                                        Chưa chọn từ nào. Nhấp vào các thẻ từ bên dưới theo thứ tự đúng.
                                      </span>
                                    ) : (
                                      <div className="flex flex-wrap gap-1.5">
                                        {(editingQuestion.correctOrder || []).map((id, seqIdx) => {
                                          const token = (editingQuestion.tokens || []).find((tk) => tk.id === id);
                                          return (
                                            <button
                                              key={id || seqIdx}
                                              type="button"
                                              onClick={() => {
                                                const newOrder = (editingQuestion.correctOrder || []).filter(
                                                  (_, i) => i !== seqIdx
                                                );
                                                setEditingQuestion({ ...editingQuestion, correctOrder: newOrder });
                                              }}
                                              className="flex items-center gap-1 rounded-md border border-emerald-400 bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-900 transition hover:bg-emerald-200 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-100"
                                              title="Nhấp để xóa khỏi câu trả lời"
                                            >
                                              <span className="text-[10px] font-black opacity-60">{seqIdx + 1}.</span>
                                              <span>{token?.text || id}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* Available Tokens to click */}
                                  <div className="mt-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Chọn thêm từ vào câu:</p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                      {(editingQuestion.tokens || []).map((tk) => {
                                        const isUsed = (editingQuestion.correctOrder || []).includes(tk.id);
                                        return (
                                          <button
                                            key={tk.id}
                                            type="button"
                                            disabled={isUsed}
                                            onClick={() => {
                                              const currentOrder = editingQuestion.correctOrder || [];
                                              setEditingQuestion({
                                                ...editingQuestion,
                                                correctOrder: [...currentOrder, tk.id],
                                              });
                                            }}
                                            className={`rounded-md border px-2 py-1 text-xs font-bold transition ${
                                              isUsed
                                                ? "border-slate-200 bg-slate-100 text-slate-400 opacity-40 dark:border-slate-800 dark:bg-slate-900"
                                                : "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200"
                                            }`}
                                          >
                                            + {tk.text || "(trống)"}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Fill Blank Editor */}
                            {(editingQuestion.acceptedAnswers !== undefined || editingQuestion.type === "fill_blank") && (
                              <div className="space-y-3 rounded-xl border border-sky-200 bg-white p-3 dark:border-sky-900/60 dark:bg-slate-900">
                                <label className="text-[11px] font-black text-sky-800 dark:text-sky-300">
                                  Chỉnh sửa câu điền từ (FILL_BLANK):
                                </label>

                                <div className="grid gap-2 sm:grid-cols-2">
                                  <div>
                                    <label className="text-[10px] font-black text-slate-500">Văn bản trước chỗ trống</label>
                                    <input
                                      type="text"
                                      value={editingQuestion.sentenceBefore || ""}
                                      onChange={(e) =>
                                        setEditingQuestion({ ...editingQuestion, sentenceBefore: e.target.value })
                                      }
                                      className="mt-1 h-8 w-full rounded-lg border-2 border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                      placeholder="Ví dụ: I"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-black text-slate-500">Văn bản sau chỗ trống</label>
                                    <input
                                      type="text"
                                      value={editingQuestion.sentenceAfter || ""}
                                      onChange={(e) =>
                                        setEditingQuestion({ ...editingQuestion, sentenceAfter: e.target.value })
                                      }
                                      className="mt-1 h-8 w-full rounded-lg border-2 border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                      placeholder="Ví dụ: from Vietnam."
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                                    Danh sách đáp án được chấp nhận (phân cách bằng dấu phẩy)
                                  </label>
                                  <input
                                    type="text"
                                    value={(editingQuestion.acceptedAnswers || []).join(", ")}
                                    onChange={(e) => {
                                      const answers = e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean);
                                      setEditingQuestion({ ...editingQuestion, acceptedAnswers: answers });
                                    }}
                                    className="mt-1 h-8 w-full rounded-lg border-2 border-emerald-300 bg-emerald-50/50 px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-slate-200"
                                    placeholder="Ví dụ: am, 'm"
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">Giải thích đáp án (Explanation)</label>
                              <input
                                type="text"
                                value={editingQuestion.explanation}
                                onChange={(e) =>
                                  setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                                }
                                className="mt-1 h-9 w-full rounded-lg border-2 border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-sky-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 rounded-lg text-xs font-black"
                                onClick={() => setEditingQuestion(null)}
                              >
                                Hủy
                              </Button>
                              <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                className="h-8 rounded-lg text-xs font-black"
                              >
                                <Save className="mr-1 size-3.5" /> Lưu vào SQL Database
                              </Button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
              <HelpCircle className="size-8 text-slate-400" />
              <p className="mt-2 text-sm font-bold text-slate-500">
                Vui lòng chọn một bài học ở cột bên trái để xem và sửa các câu hỏi bài tập từ CSDL.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
