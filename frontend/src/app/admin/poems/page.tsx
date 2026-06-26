"use client";

/**
 * Admin Poems Management Page
 * ===========================
 * Fully functional management interface for poems/manzumat.
 * Communicates with the FastAPI backend API.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Plus, Edit, Trash2, X, Loader2, Save, Play, FileText, FolderInput } from "lucide-react";
import { poemsApi, categoriesApi, uploadApi, Poem, Category } from "@/lib/api";

export default function AdminPoemsPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [categories, setCategories] = useState<(Category & { label?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("الشيخ عامر بهجت");
  const [description, setDescription] = useState("");
  const [textContent, setTextContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [verseCount, setVerseCount] = useState<number | "">("");
  const [subject, setSubject] = useState("");
  const [audioPath, setAudioPath] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Loading states for file uploads
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio Preview state
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);

  // Quick move state
  const [movingPoemId, setMovingPoemId] = useState<number | null>(null);

  // Load poems & categories on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all poems (including unpublished for admin)
      const poemsData = await poemsApi.getAll({ include_unpublished: true, limit: 1000 });
      const categoriesData = await categoriesApi.getAll();
      setPoems(poemsData);

      // Flatten hierarchical categories with indentation for the dropdown selection
      const flatList: (Category & { label: string })[] = [];
      const flatten = (cats: Category[], depth = 0) => {
        const sorted = [...cats].sort((a, b) => a.sort_order - b.sort_order);
        sorted.forEach((c) => {
          const prefix = depth > 0 ? "\u00A0\u00A0".repeat(depth) + "↳ " : "";
          flatList.push({
            ...c,
            label: `${prefix}${c.name}`,
          });
          if (c.children && c.children.length > 0) {
            flatten(c.children, depth + 1);
          }
        });
      };
      flatten(categoriesData);
      setCategories(flatList);
    } catch (err: any) {
      setError(err.message || "فشل تحميل البيانات من الخادم");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPoem(null);
    setTitle("");
    setAuthor("الشيخ عامر بهجت");
    setDescription("");
    setTextContent("");
    setCategoryId("");
    setVerseCount("");
    setSubject("");
    setAudioPath("");
    setIsPublished(true);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (poem: Poem) => {
    setEditingPoem(poem);
    setTitle(poem.title);
    setAuthor(poem.author);
    setDescription(poem.description || "");
    setTextContent(poem.text_content);
    setCategoryId(poem.category_id || "");
    setVerseCount(poem.verse_count || "");
    setSubject(poem.subject || "");
    setAudioPath(poem.audio_path || "");
    setIsPublished(poem.is_published);
    setIsFeatured(poem.is_featured);
    setIsModalOpen(true);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    try {
      const result = await uploadApi.uploadAudio(file);
      setAudioPath(result.url);
    } catch (err: any) {
      alert(err.message || "فشل رفع الملف الصوتي");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !textContent) {
      alert("الرجاء تعبئة العنوان والمؤلف وأبيات المنظومة");
      return;
    }

    setIsSubmitting(true);
    const poemData: Partial<Poem> = {
      title,
      author,
      description: description || undefined,
      text_content: textContent,
      category_id: categoryId ? Number(categoryId) : undefined,
      verse_count: verseCount ? Number(verseCount) : undefined,
      subject: subject || undefined,
      audio_path: audioPath || undefined,
      is_published: isPublished,
      is_featured: isFeatured,
    };

    try {
      if (editingPoem) {
        await poemsApi.update(editingPoem.id, poemData);
      } else {
        await poemsApi.create(poemData);
      }
      setIsModalOpen(false);
      fetchData(); // Reload list
    } catch (err: any) {
      alert(err.message || "فشل حفظ المنظومة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه المنظومة نهائياً؟")) return;

    try {
      await poemsApi.delete(id);
      fetchData(); // Reload list
    } catch (err: any) {
      alert(err.message || "فشل حذف المنظومة");
    }
  };

  const handleQuickMove = async (poemId: number, newCategoryId: number) => {
    try {
      await poemsApi.update(poemId, { category_id: newCategoryId });
      setPoems((prev) =>
        prev.map((p) =>
          p.id === poemId
            ? {
                ...p,
                category_id: newCategoryId,
                category_name: categories.find((c) => c.id === newCategoryId)?.name || p.category_name,
              }
            : p
        )
      );
      setMovingPoemId(null);
    } catch (err: any) {
      alert(err.message || "فشل نقل المنظومة");
    }
  };

  const toggleAudioPreview = (url: string) => {
    if (activeAudioUrl === url) {
      setActiveAudioUrl(null);
    } else {
      setActiveAudioUrl(url);
    }
  };

  return (
    <div className="text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          إضافة منظومة
        </button>
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
            إدارة المنظومات
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">
            إضافة وتعديل وحذف المنظومات الشعرية والتسجيلات الصوتية
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Audio Player Preview Bar */}
      {activeAudioUrl && (
        <div className="mb-6 p-4 bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] rounded-2xl flex items-center justify-between flex-row-reverse gap-4 border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <audio src={activeAudioUrl} autoPlay controls className="w-full max-w-md h-9" />
          <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] font-medium">
            معاينة الصوت المشغل حالياً
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={36} className="text-[var(--color-accent)] animate-spin" />
        </div>
      ) : (
        /* Poems Table */
        <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">#</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">العنوان</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">الموضوع</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">التصنيف</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">الأبيات</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">صوت</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">مميز</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">الحالة</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {poems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-[var(--color-text-muted)] text-sm">
                      لا توجد منظومات مضافة حالياً. اضغط على "إضافة منظومة" للبدء.
                    </td>
                  </tr>
                ) : (
                  poems.map((poem, index) => (
                    <motion.tr
                      key={poem.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 hover:bg-[var(--color-bg-cream)]/50 dark:hover:bg-[var(--color-bg-dark-elevated)]/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-[var(--color-text-muted)]">{poem.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B3FA0] to-[#8B5FD0] flex items-center justify-center flex-shrink-0">
                            <Music size={14} className="text-white" />
                          </div>
                          <span className="font-semibold text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                            {poem.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]">
                        {poem.subject || "غير محدد"}
                      </td>
                      <td className="p-4 text-sm">
                        {movingPoemId === poem.id ? (
                          <select
                            autoFocus
                            value={poem.category_id || ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleQuickMove(poem.id, Number(e.target.value));
                              }
                            }}
                            onBlur={() => setMovingPoemId(null)}
                            className="w-full px-2 py-1.5 rounded-lg border-2 border-[var(--color-accent)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 text-right"
                            dir="rtl"
                          >
                            <option value="">اختر المجلد...</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.label || cat.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setMovingPoemId(poem.id)}
                            className="group flex items-center gap-1.5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                            title="اضغط للنقل إلى مجلد آخر"
                          >
                            <span>{poem.category_name || "بدون تصنيف"}</span>
                            <FolderInput size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]">
                        {poem.verse_count || "غير محدد"}
                      </td>
                      <td className="p-4">
                        {poem.audio_path ? (
                          <button
                            onClick={() => toggleAudioPreview(poem.audio_path!)}
                            className={`p-1.5 rounded-full transition-colors ${
                              activeAudioUrl === poem.audio_path
                                ? "bg-[var(--color-accent)] text-white"
                                : "bg-purple-50 dark:bg-purple-950/10 text-purple-600 hover:bg-purple-100"
                            }`}
                            title="تشغيل الصوت"
                          >
                            <Play size={12} />
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">لا يوجد</span>
                        )}
                      </td>
                      <td className="p-4">
                        {poem.is_featured ? (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] text-xs">
                            مميز
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {poem.is_published ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/10 text-green-600 dark:text-green-400 text-xs">
                            منشور
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs">
                            مسودة
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setMovingPoemId(movingPoemId === poem.id ? null : poem.id)}
                            className={`p-1.5 rounded-lg transition-colors ${movingPoemId === poem.id ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'hover:bg-amber-50 dark:hover:bg-amber-900/10 text-amber-600'}`}
                            title="نقل إلى مجلد آخر"
                          >
                            <FolderInput size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(poem)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)] transition-colors"
                            title="تعديل"
                          >
                            <Edit size={14} className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]" />
                          </button>
                          <button
                            onClick={() => handleDelete(poem.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Poem Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex-row-reverse">
                <h2 className="text-xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                  {editingPoem ? "تعديل بيانات المنظومة" : "إضافة منظومة جديدة"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    عنوان المنظومة *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    المؤلف *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    وصف مختصر للمنظومة
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                      التصنيف
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] dark:bg-gray-900"
                    >
                      <option value="">اختر التصنيف...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                      الموضوع العلمى
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: العقيدة، الفقه"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Verse Count */}
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                      عدد الأبيات
                    </label>
                    <input
                      type="number"
                      value={verseCount}
                      onChange={(e) => setVerseCount(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>

                  {/* Settings toggles */}
                  <div className="flex items-end gap-4 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-border)]"
                      />
                      <span className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">تميز في الرئيسية</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-border)]"
                      />
                      <span className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">نشر للعامة</span>
                    </label>
                  </div>
                </div>

                {/* Text Content (Verses) */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    أبيات المنظومة * (أدخل الأبيات الشطر الأول ثم الشطر الثاني)
                  </label>
                  <textarea
                    required
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={6}
                    placeholder="شطر أول ... شطر ثاني&#10;شطر أول ... شطر ثاني"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono resize-y"
                  />
                </div>

                {/* Audio File Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    الملف الصوتي (MP3)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      disabled={isUploadingAudio}
                      className="flex-1 text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-accent)]/10 file:text-[var(--color-accent-dark)] hover:file:bg-[var(--color-accent)]/20 cursor-pointer"
                    />
                    {isUploadingAudio && (
                      <Loader2 size={16} className="animate-spin text-[var(--color-accent)]" />
                    )}
                  </div>
                  {audioPath && (
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-green-500 justify-between">
                      <p className="truncate max-w-xs" dir="ltr">Uploaded: {audioPath}</p>
                      <button
                        type="button"
                        onClick={() => toggleAudioPreview(audioPath)}
                        className="text-xs text-purple-600 underline cursor-pointer"
                      >
                        {activeAudioUrl === audioPath ? "إيقاف التشغيل" : "تشغيل المعاينة"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingAudio}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {editingPoem ? "حفظ التعديلات" : "إضافة ونشر المنظومة"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
