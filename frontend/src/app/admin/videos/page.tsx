"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video as VideoIcon, Plus, Edit, Trash2, X, Loader2, Save, ExternalLink } from "lucide-react";
import { videosApi, Video } from "@/lib/api";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await videosApi.getAll({ include_unpublished: true, limit: 1000 });
      setVideos(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل قائمة الفيديوهات من الخادم");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique category names for filter dropdown
  const categoriesList = Array.from(
    new Set(videos.map((v) => v.category_name).filter(Boolean))
  ) as string[];

  const filteredVideos = videos.filter((video) => {
    const matchesCategory = filterCategory === "all" || video.category_name === filterCategory;
    const matchesSearch = !searchQuery.trim() ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (video.category_name && video.category_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingVideo(null);
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setCategoryName("");
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (video: Video) => {
    setEditingVideo(video);
    setTitle(video.title);
    setDescription(video.description || "");
    setYoutubeUrl(video.youtube_url);
    setCategoryName(video.category_name || "");
    setIsPublished(video.is_published);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) {
      alert("الرجاء تعبئة العنوان ورابط يوتيوب");
      return;
    }

    setIsSubmitting(true);
    const videoData: Partial<Video> = {
      title,
      description: description || undefined,
      youtube_url: youtubeUrl,
      category_name: categoryName || undefined,
      is_published: isPublished,
    };

    try {
      if (editingVideo) {
        await videosApi.update(editingVideo.id, videoData);
      } else {
        await videosApi.create(videoData);
      }
      setIsModalOpen(false);
      fetchVideos();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حفظ الفيديو. تأكد من أن الرابط يوتيوب صحيح.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الفيديو نهائياً؟")) return;

    try {
      await videosApi.delete(id);
      fetchVideos();
    } catch (err: any) {
      alert(err.message || "فشل حذف الفيديو");
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
          إضافة فيديو
        </button>
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
            إدارة المرئيات
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">
            إضافة وتعديل وحذف روابط اليوتيوب في الأرشيف المرئي
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 p-5 rounded-2xl shadow-[var(--shadow-soft)]" dir="rtl">
        {/* Search */}
        <div className="md:col-span-2 text-right">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mb-2">البحث في المرئيات:</label>
          <input
            type="text"
            placeholder="ابحث عن فيديو بالاسم أو الوصف أو التصنيف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 text-right"
            dir="rtl"
          />
        </div>

        {/* Filter Category */}
        <div className="text-right">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mb-2">تصفية حسب التصنيف:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 dark:bg-gray-900 text-right"
            dir="rtl"
          >
            <option value="all">كل التصنيفات (عرض الكل)</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={36} className="text-[var(--color-accent)] animate-spin" />
        </div>
      ) : (
        /* Videos List Table */
        <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">#</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">العنوان</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">التصنيف</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">معرف يوتيوب</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">الحالة</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">تاريخ الإضافة</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video, index) => (
                  <motion.tr
                    key={video.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 hover:bg-[var(--color-bg-cream)]/50 dark:hover:bg-[var(--color-bg-dark-elevated)]/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-[var(--color-text-muted)]">{video.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] line-clamp-2">
                          {video.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]">
                      {video.category_name || "بدون تصنيف"}
                    </td>
                    <td className="p-4 text-sm font-mono text-[var(--color-text-muted)]">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors justify-end flex-row-reverse"
                      >
                        <span dir="ltr">{video.youtube_id}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="p-4">
                      {video.is_published ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/10 text-green-600 dark:text-green-400 text-xs">
                          منشور
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs">
                          مسودة
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]">
                      {video.created_at ? new Date(video.created_at).toLocaleDateString("ar-SA") : "غير محدد"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openEditModal(video)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)] transition-colors"
                          title="تعديل"
                        >
                          <Edit size={14} className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredVideos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-[var(--color-text-muted)]">
                      لا يوجد مقاطع مرئية حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex-row-reverse">
                <h2 className="text-xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                  {editingVideo ? "تعديل بيانات الفيديو" : "إضافة فيديو جديد"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    عنوان الفيديو *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-right"
                    dir="rtl"
                  />
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    رابط فيديو يوتيوب *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="مثال: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-left font-mono"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">
                    يدعم الروابط الكاملة وروابط المختصرة (youtu.be) وروابط Shorts والمشغل المنبثق
                  </p>
                </div>

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    اسم التصنيف (اختياري)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      list="adminVideoCategories"
                      placeholder="مثال: شروح علمية، مواعظ..."
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-right"
                      dir="rtl"
                    />
                    <datalist id="adminVideoCategories">
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    وصف مختصر (اختياري)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none text-right"
                    dir="rtl"
                  />
                </div>

                {/* Switch Options */}
                <div className="flex items-center gap-4 py-2 justify-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-border)]"
                    />
                    <span className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">نشر للعامة فورا</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {editingVideo ? "حفظ التعديلات" : "إضافة الفيديو"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
