"use client";

/**
 * Admin Categories (Folders) Management Page
 * ==========================================
 * Allows admins to add, edit, and delete folders/categories.
 * Admins can configure hierarchical nesting (choosing the parent folder).
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Plus, Edit, Trash2, X, Loader2, Save, FolderOpen, ArrowRight } from "lucide-react";
import { categoriesApi, Category } from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<{ id: number; name: string; fullPath: string; parent_id?: number; sort_order: number; description?: string; name_en?: string; book_count: number; poem_count: number }[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<{ id: number; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [parentId, setParentId] = useState<number | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);

      // Flatten for the table list showing full paths
      const flatList: typeof flatCategories = [];
      const traverseFlat = (items: Category[], path = "") => {
        const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
        sorted.forEach((cat) => {
          const currentPath = path ? `${path} ➔ ${cat.name}` : cat.name;
          flatList.push({
            id: cat.id,
            name: cat.name,
            name_en: cat.name_en,
            fullPath: currentPath,
            parent_id: cat.parent_id,
            sort_order: cat.sort_order,
            description: cat.description,
            book_count: cat.book_count || 0,
            poem_count: cat.poem_count || 0,
          });
          if (cat.children && cat.children.length > 0) {
            traverseFlat(cat.children, currentPath);
          }
        });
      };
      traverseFlat(data);
      setFlatCategories(flatList);

      // Flatten with indentations for the parent selection dropdown
      const dropdown: typeof dropdownOptions = [];
      const traverseDropdown = (items: Category[], depth = 0) => {
        const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
        sorted.forEach((cat) => {
          const prefix = depth > 0 ? "  ".repeat(depth) + "↳ " : "";
          dropdown.push({
            id: cat.id,
            label: `${prefix}${cat.name}`,
          });
          if (cat.children && cat.children.length > 0) {
            traverseDropdown(cat.children, depth + 1);
          }
        });
      };
      traverseDropdown(data);
      setDropdownOptions(dropdown);
    } catch (err: any) {
      setError(err.message || "فشل تحميل المجلدات من الخادم");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setNameEn("");
    setDescription("");
    setSortOrder(0);
    setParentId("");
    setIsModalOpen(true);
  };

  const openEditModal = (catId: number) => {
    // Find the category in the flat list
    const found = flatCategories.find((c) => c.id === catId);
    if (!found) return;

    setEditingCategory({
      id: found.id,
      name: found.name,
      name_en: found.name_en,
      description: found.description,
      sort_order: found.sort_order,
      parent_id: found.parent_id,
      children: [],
      book_count: found.book_count,
      poem_count: found.poem_count,
    });

    setName(found.name);
    setNameEn(found.name_en || "");
    setDescription(found.description || "");
    setSortOrder(found.sort_order);
    setParentId(found.parent_id || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("الرجاء إدخال اسم المجلد");
      return;
    }

    setIsSubmitting(true);
    const categoryData: Partial<Category> = {
      name: name.trim(),
      name_en: nameEn.trim() || undefined,
      description: description.trim() || undefined,
      sort_order: Number(sortOrder) || 0,
      parent_id: parentId ? Number(parentId) : undefined,
    };

    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, categoryData);
      } else {
        await categoriesApi.create(categoryData);
      }
      setIsModalOpen(false);
      fetchCategories(); // Reload list
    } catch (err: any) {
      alert(err.message || "فشل حفظ المجلد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catId: number, name: string) => {
    const confirmMessage = `هل أنت متأكد من حذف المجلد "${name}"؟\n\nتنبيه هام جداً:\n- سيتم حذف جميع المجلدات الفرعية التابعة له تلقائياً.\n- الكتب والمنظومات داخل هذه المجلدات لن تُحذف، ولكن سيصبح تصنيفها فارغاً.`;
    if (!confirm(confirmMessage)) return;

    try {
      await categoriesApi.delete(catId);
      fetchCategories(); // Reload list
    } catch (err: any) {
      alert(err.message || "فشل حذف المجلد");
    }
  };

  // Exclude current category and its descendants from the parent dropdown options to avoid circular hierarchies
  const getEligibleParentOptions = () => {
    if (!editingCategory) return dropdownOptions;

    // To prevent cycle, let's find all subcategories of editingCategory.id
    const descendants = new Set<number>();
    const findDescendants = (cats: Category[], parentId: number, matchFound = false) => {
      cats.forEach((cat) => {
        const isChildOfTarget = matchFound || cat.parent_id === parentId;
        if (isChildOfTarget) {
          descendants.add(cat.id);
        }
        if (cat.children && cat.children.length > 0) {
          findDescendants(cat.children, parentId, isChildOfTarget);
        }
      });
    };
    findDescendants(categories, editingCategory.id);

    return dropdownOptions.filter(
      (opt) => opt.id !== editingCategory.id && !descendants.has(opt.id)
    );
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
          إضافة مجلد جديد
        </button>
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
            إدارة المجلدات والتقسيمات
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">
            إضافة وتعديل وحذف مجلدات المكتبة الرقمية وتحديد أماكن تفرعها
          </p>
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
        /* Categories Table */
        <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] overflow-hidden shadow-[var(--shadow-soft)]">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-cream)]/50 dark:bg-[var(--color-bg-dark-elevated)]/50 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
                  <th className="px-6 py-4 text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">المسار الكامل للمجلد</th>
                  <th className="px-6 py-4 text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">الاسم بالإنجليزية</th>
                  <th className="px-6 py-4 text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] text-center">الترتيب</th>
                  <th className="px-6 py-4 text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] text-center">الكتب</th>
                  <th className="px-6 py-4 text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] text-center">المنظومات</th>
                  <th className="px-6 py-4 text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] dark:divide-[var(--color-border-dark)]">
                {flatCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[var(--color-bg-cream)]/20 dark:hover:bg-[var(--color-bg-dark-elevated)]/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                      <div className="flex items-center gap-2 flex-row-reverse justify-end">
                        <FolderOpen size={16} className="text-[var(--color-accent)]" />
                        <span className="font-medium text-xs sm:text-sm">{cat.fullPath}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] font-mono">
                      {cat.name_en || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] text-center font-medium">
                      {cat.sort_order}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                        {cat.book_count} كتب
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                        {cat.poem_count} منظومة
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-left">
                      <div className="flex items-center gap-2 justify-start">
                        <button
                          onClick={() => openEditModal(cat.id)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {flatCategories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[var(--color-text-muted)]">
                      <Folder size={40} className="mx-auto mb-3 opacity-30" />
                      <p>لا توجد مجلدات مضافة حالياً.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex-row-reverse">
                <h3 className="text-xl font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                  {editingCategory ? "تعديل المجلد" : "إضافة مجلد جديد"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name AR */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-1">
                    اسم المجلد بالعربية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: العقيدة والتوحيد"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 text-sm"
                  />
                </div>

                {/* Name EN */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-1">
                    اسم المجلد بالإنجليزية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Creed & Islamic Theology"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 text-sm font-mono text-left"
                    dir="ltr"
                  />
                </div>

                {/* Parent Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-1">
                    المجلد الأب (مكانه في التفرع)
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 text-sm"
                  >
                    <option value="">مجلد رئيسي (لا يتبع لأي مجلد آخر)</option>
                    {getEligibleParentOptions().map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    اختر المجلد الأب الذي تريد تفرع هذا المجلد منه. إذا كان مجلداً رئيسياً، اتركه كما هو.
                  </p>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-1">
                    ترتيب العرض (الوزن الرقمي)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 text-sm"
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    الأرقام الأصغر تُعرض أولاً.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-1">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف مختصر لمحتويات المجلد..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 text-sm resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {editingCategory ? "حفظ التعديلات" : "إضافة المجلد"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
