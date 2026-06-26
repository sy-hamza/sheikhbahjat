"use client";

/**
 * Admin Books Management Page
 * ===========================
 * Fully functional management interface for books and booklets.
 * Communicates with the FastAPI backend API.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Edit, Trash2, X, Loader2, Save, FolderInput } from "lucide-react";
import { booksApi, categoriesApi, uploadApi, Book, Category } from "@/lib/api";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<(Category & { label?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Search States
  const [filterCategoryId, setFilterCategoryId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = books.filter((book) => {
    const matchesCategory = filterCategoryId === "all" || book.category_id === filterCategoryId;
    const matchesSearch = !searchQuery.trim() ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.category_name && book.category_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Form Modal States

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("الشيخ عامر بهجت");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [pageCount, setPageCount] = useState<number | "">("");
  const [publishYear, setPublishYear] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [pdfPath, setPdfPath] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Loading states for file uploads
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick move state
  const [movingBookId, setMovingBookId] = useState<number | null>(null);

  // Load books & categories on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all books (including unpublished for admin)
      const booksData = await booksApi.getAll({ include_unpublished: true, limit: 1000 });
      const categoriesData = await categoriesApi.getAll();
      setBooks(booksData);
      
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
    setEditingBook(null);
    setTitle("");
    setAuthor("الشيخ عامر بهجت");
    setDescription("");
    setCategoryId("");
    setPageCount("");
    setPublishYear("");
    setCoverImage("");
    setPdfPath("");
    setIsPublished(true);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description || "");
    setCategoryId(book.category_id || "");
    setPageCount(book.page_count || "");
    setPublishYear(book.publish_year || "");
    setCoverImage(book.cover_image || "");
    setPdfPath(book.pdf_path || "");
    setIsPublished(book.is_published);
    setIsFeatured(book.is_featured);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await uploadApi.uploadImage(file);
      setCoverImage(result.url);
    } catch (err: any) {
      alert(err.message || "فشل رفع صورة الغلاف");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImagePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    let imageFile: File | null = null;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          imageFile = file;
          break;
        }
      }
    }
    
    if (!imageFile) {
      alert("لم يتم العثور على صورة في الحافظة. يرجى نسخ صورة أولاً ثم المحاولة.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const timestamp = new Date().getTime();
      const filename = `pasted-cover-${timestamp}.png`;
      const renamedFile = new File([imageFile], filename, { type: imageFile.type });
      
      const result = await uploadApi.uploadImage(renamedFile);
      setCoverImage(result.url);
    } catch (err: any) {
      alert(err.message || "فشل رفع الصورة الملصقة");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    try {
      const result = await uploadApi.uploadPdf(file);
      setPdfPath(result.url);
    } catch (err: any) {
      alert(err.message || "فشل رفع ملف الكتاب");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      alert("الرجاء تعبئة العنوان والمؤلف");
      return;
    }

    setIsSubmitting(true);
    const bookData: Partial<Book> = {
      title,
      author,
      description: description || undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
      page_count: pageCount ? Number(pageCount) : undefined,
      publish_year: publishYear || undefined,
      cover_image: coverImage || undefined,
      pdf_path: pdfPath || undefined,
      is_published: isPublished,
      is_featured: isFeatured,
    };

    try {
      if (editingBook) {
        await booksApi.update(editingBook.id, bookData);
      } else {
        await booksApi.create(bookData);
      }
      setIsModalOpen(false);
      fetchData(); // Reload list
    } catch (err: any) {
      alert(err.message || "فشل حفظ الكتاب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الكتاب نهائياً؟")) return;

    try {
      await booksApi.delete(id);
      fetchData(); // Reload list
    } catch (err: any) {
      alert(err.message || "فشل حذف الكتاب");
    }
  };

  const handleQuickMove = async (bookId: number, newCategoryId: number) => {
    try {
      await booksApi.update(bookId, { category_id: newCategoryId });
      // Update local state immediately for instant UI feedback
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? {
                ...b,
                category_id: newCategoryId,
                category_name: categories.find((c) => c.id === newCategoryId)?.name || b.category_name,
              }
            : b
        )
      );
      setMovingBookId(null);
    } catch (err: any) {
      alert(err.message || "فشل نقل الكتاب");
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
          إضافة كتاب
        </button>
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
            إدارة الكتب
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">
            إضافة وتعديل وحذف الكتب والرسائل العلمية
          </p>
        </div>
      </div>

      {/* Search & Category Filter Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 p-5 rounded-2xl shadow-[var(--shadow-soft)]" dir="rtl">
        {/* Search */}
        <div className="md:col-span-2 text-right">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mb-2">البحث في الكتب:</label>
          <input
            type="text"
            placeholder="ابحث عن كتاب بالاسم أو المؤلف أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 text-right"
            dir="rtl"
          />
        </div>

        {/* Category Filter */}
        <div className="text-right">
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mb-2">تصفية حسب المجلد (التصنيف):</label>
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 dark:bg-gray-900 text-right"
            dir="rtl"
          >
            <option value="all">كل المجلدات (عرض الكل)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label || cat.name}
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

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={36} className="text-[var(--color-accent)] animate-spin" />
        </div>
      ) : (
        /* Books Table */
        <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">#</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">العنوان</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">التصنيف</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">الصفحات</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">مميز</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">الحالة</th>
                  <th className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, index) => (
                  <motion.tr
                    key={book.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 hover:bg-[var(--color-bg-cream)]/50 dark:hover:bg-[var(--color-bg-dark-elevated)]/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-[var(--color-text-muted)]">{book.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                          <BookOpen size={14} className="text-white" />
                        </div>
                        <span className="font-semibold text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                          {book.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {movingBookId === book.id ? (
                        <select
                          autoFocus
                          value={book.category_id || ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleQuickMove(book.id, Number(e.target.value));
                            }
                          }}
                          onBlur={() => setMovingBookId(null)}
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
                          onClick={() => setMovingBookId(book.id)}
                          className="group flex items-center gap-1.5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                          title="اضغط للنقل إلى مجلد آخر"
                        >
                          <span>{book.category_name || "بدون تصنيف"}</span>
                          <FolderInput size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]">
                      {book.page_count || "غير محدد"}
                    </td>
                    <td className="p-4">
                      {book.is_featured ? (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] text-xs">
                          مميز
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {book.is_published ? (
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
                          onClick={() => setMovingBookId(movingBookId === book.id ? null : book.id)}
                          className={`p-1.5 rounded-lg transition-colors ${movingBookId === book.id ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'hover:bg-amber-50 dark:hover:bg-amber-900/10 text-amber-600'}`}
                          title="نقل إلى مجلد آخر"
                        >
                          <FolderInput size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)] transition-colors"
                          title="تعديل"
                        >
                          <Edit size={14} className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex-row-reverse">
                <h2 className="text-xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                  {editingBook ? "تعديل بيانات الكتاب" : "إضافة كتاب جديد"}
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
                    عنوان الكتاب *
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
                    وصف مختصر
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
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

                  {/* Publish Year */}
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                      سنة النشر (هجري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 1445"
                      value={publishYear}
                      onChange={(e) => setPublishYear(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Page Count */}
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                      عدد الصفحات
                    </label>
                    <input
                      type="number"
                      value={pageCount}
                      onChange={(e) => setPageCount(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>

                  {/* Dummy space / alignment */}
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

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    غلاف الكتاب (صورة)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="flex-1 text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-accent)]/10 file:text-[var(--color-accent-dark)] hover:file:bg-[var(--color-accent)]/20 cursor-pointer"
                    />
                    {isUploadingImage && (
                      <Loader2 size={16} className="animate-spin text-[var(--color-accent)]" />
                    )}
                  </div>
                  
                  {/* Paste Container */}
                  <div
                    onPaste={handleImagePaste}
                    className="mt-2 border border-dashed border-[var(--color-border)] dark:border-[var(--color-border-dark)] rounded-xl p-3 text-center cursor-pointer hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all bg-[var(--color-bg-warm)]/50 dark:bg-gray-800/10 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    tabIndex={0}
                    title="اضغط هنا ثم الصق الصورة باستخدام Ctrl+V"
                  >
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]">
                      📋 انقر هنا ثم اضغط <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-850 rounded border border-gray-300 dark:border-gray-700 text-[10px] font-mono">Ctrl + V</kbd> للصق الغلاف مباشرة دون تحميله
                    </p>
                  </div>

                  {coverImage && (
                    <p className="text-xs text-green-500 mt-1 truncate" dir="ltr">
                      Uploaded: {coverImage}
                    </p>
                  )}
                </div>

                {/* PDF File Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                    ملف الكتاب (PDF)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      disabled={isUploadingPdf}
                      className="flex-1 text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-accent)]/10 file:text-[var(--color-accent-dark)] hover:file:bg-[var(--color-accent)]/20 cursor-pointer"
                    />
                    {isUploadingPdf && (
                      <Loader2 size={16} className="animate-spin text-[var(--color-accent)]" />
                    )}
                  </div>
                  {pdfPath && (
                    <p className="text-xs text-green-500 mt-1 truncate" dir="ltr">
                      Uploaded: {pdfPath}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage || isUploadingPdf}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {editingBook ? "حفظ التعديلات" : "إضافة ونشر الكتاب"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
