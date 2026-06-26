"use client";

/**
 * Books Page
 * ==========
 * Hierarchical folder-system for browsing book categories (Arabic vs English, Creed, Fiqh, etc.).
 * Dynamically fetches and classifies database items.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import BookCard from "@/components/books/BookCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BookOpen, Search, X, FolderOpen, Loader2, ChevronLeft, ArrowRight, Music } from "lucide-react";
import { booksApi, poemsApi, categoriesApi, Book, Poem, Category } from "@/lib/api";

// Modal for book detail
function BookModal({ book, onClose }: { book: Book; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-right"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <div>
            <h2 className="text-2xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
              {book.title}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">
              {book.author}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] leading-relaxed text-sm">
            {book.description || "لا يوجد وصف متوفر لهذا الكتاب حالياً."}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {book.category_name && (
              <div className="p-3 rounded-xl bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">التصنيف</p>
                <p className="font-semibold text-sm text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">{book.category_name}</p>
              </div>
            )}
            {book.page_count && (
              <div className="p-3 rounded-xl bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">عدد الصفحات</p>
                <p className="font-semibold text-sm text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">{book.page_count}</p>
              </div>
            )}
            {book.publish_year && (
              <div className="p-3 rounded-xl bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">سنة النشر</p>
                <p className="font-semibold text-sm text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">{book.publish_year} هـ</p>
              </div>
            )}
          </div>

          {/* Download Button */}
          {book.pdf_path ? (
            <a
              href={book.pdf_path}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-300"
            >
              <BookOpen size={18} />
              تحميل وقراءة الكتاب (PDF)
            </a>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-200 dark:bg-gray-800 text-gray-500 rounded-xl font-medium cursor-not-allowed"
            >
              <BookOpen size={18} />
              ملف الكتاب غير متوفر حالياً
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Folder navigation state: [] (root), ['arabic'], ['arabic', 'arabic_books'], etc.
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    setSelectedCategory("all");
  }, [currentPath]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [booksData, poemsData, categoriesData] = await Promise.all([
          booksApi.getAll({ limit: 1000 }),
          poemsApi.getAll({ limit: 1000 }),
          categoriesApi.getAll()
        ]);
        setBooks(booksData);
        setPoems(poemsData);

        // Support direct linking via URL query parameters (?id=12)
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get("id");
        if (bookId && booksData.length > 0) {
          const matched = booksData.find((b) => b.id === Number(bookId));
          if (matched) {
            setSelectedBook(matched);
            if (matched.category_id === 30 || matched.category_name === "الكتب بالإنجليزية") {
              setCurrentPath(["english"]);
            } else {
              setCurrentPath(["arabic", "arabic_books"]);
            }
          }
        }

        // Flatten hierarchical categories list
        const flatList: Category[] = [];
        const flatten = (cats: Category[]) => {
          const sorted = [...cats].sort((a, b) => a.sort_order - b.sort_order);
          sorted.forEach((c) => {
            flatList.push(c);
            if (c.children && c.children.length > 0) {
              flatten(c.children);
            }
          });
        };
        flatten(categoriesData);
        setCategories(flatList);
      } catch (err: any) {
        setError("فشل تحميل قائمة الكتب والمنظومات. يرجى التأكد من تشغيل الخادم.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Dynamic classification based on database categories
  const english = books.filter(
    (b) => b.category_id === 30 || b.category_name === "الكتب بالإنجليزية"
  );
  const arabicBooks = books.filter((b) => !english.includes(b));
  const arabicPoems = poems;

  // Get active categories for the current view
  const isPoemsView = currentPath[1] === "arabic_poems";
  const currentItems = isPoemsView ? arabicPoems : arabicBooks;

  // Get all categories that have at least one item in the current view
  const activeCategories = categories.filter((cat) => {
    if (cat.id === 30) return false; // Exclude English from Arabic tabs
    return currentItems.some((item) => item.category_id === cat.id);
  });

  // Check if we have items that don't belong to any active category
  const uncategorizedItems = currentItems.filter((item) => 
    !item.category_id || !activeCategories.some((cat) => cat.id === item.category_id)
  );
  const hasOthers = uncategorizedItems.length > 0;

  // Construct tab IDs
  const tabIds = ["all", ...activeCategories.map((c) => String(c.id))];
  if (hasOthers) {
    tabIds.push("others");
  }

  const getTabLabel = (tabId: string) => {
    if (tabId === "all") return "الكل";
    if (tabId === "others") return isPoemsView ? "منظومات ومتون أخرى" : "كتب ومصنفات أخرى";
    const cat = activeCategories.find((c) => String(c.id) === tabId);
    return cat ? cat.name : "";
  };

  const getTabCount = (tabId: string) => {
    if (tabId === "all") return currentItems.length;
    if (tabId === "others") return uncategorizedItems.length;
    const catId = Number(tabId);
    return currentItems.filter((item) => item.category_id === catId).length;
  };

  const displayedItems = (() => {
    if (selectedCategory === "all") {
      return currentItems;
    }
    if (selectedCategory === "others") {
      return uncategorizedItems;
    }
    const catId = Number(selectedCategory);
    return currentItems.filter((item) => item.category_id === catId);
  })();

  // If searching, we show flat search results bypassing folder path
  const isSearching = searchQuery.trim() !== "";
  const matchingBooks = books.filter(
    (b) =>
      b.title.includes(searchQuery) ||
      (b.description && b.description.includes(searchQuery)) ||
      (b.category_name && b.category_name.includes(searchQuery))
  );
  const matchingPoems = poems.filter(
    (p) =>
      p.title.includes(searchQuery) ||
      (p.description && p.description.includes(searchQuery)) ||
      (p.category_name && p.category_name.includes(searchQuery)) ||
      (p.subject && p.subject.includes(searchQuery))
  );


  return (
    <PageTransition className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-light)] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-3">
              المكتبة الرقمية
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] max-w-lg mx-auto">
              تصفح مصنفات وشروحات الشيخ عامر بهجت مقسمة حسب اللغة والتخصص العلمي
            </p>
          </div>
        </ScrollReveal>

        {/* Search */}
        <ScrollReveal delay={0.1}>
          <div className="relative max-w-md mx-auto mb-8 text-right" dir="rtl">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="ابحث عن كتاب أو منظومة في المكتبة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-11 pl-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 transition-all text-sm text-right"
              dir="rtl"
            />
          </div>
        </ScrollReveal>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={36} className="text-[var(--color-accent)] animate-spin" />
          </div>
        ) : isSearching ? (
          /* Search Results View */
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold mb-6 text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] border-b border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 pb-2 flex items-center gap-2 justify-start flex-row-reverse">
                <span>الكتب والشروح المطابقة ({matchingBooks.length})</span>
              </h2>
              {matchingBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {matchingBooks.map((book, index) => (
                    <ScrollReveal key={book.id} delay={index * 0.05}>
                      <BookCard {...book} onView={() => setSelectedBook(book)} />
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl border border-[var(--color-border)]/20 p-6">
                  لم يتم العثور على كتب مطابقة
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6 text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] border-b border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 pb-2 flex items-center gap-2 justify-start flex-row-reverse">
                <span>المنظومات والمتون المطابقة ({matchingPoems.length})</span>
              </h2>
              {matchingPoems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {matchingPoems.map((poem, index) => (
                    <ScrollReveal key={poem.id} delay={index * 0.05}>
                      <BookCard
                        key={poem.id}
                        id={poem.id}
                        title={poem.title}
                        author={poem.author}
                        description={poem.description}
                        category_name={poem.category_name}
                        page_count={poem.verse_count}
                        is_featured={poem.is_featured}
                        onView={() => {
                          window.location.href = `/poems?id=${poem.id}`;
                        }}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl border border-[var(--color-border)]/20 p-6">
                  لم يتم العثور على منظومات مطابقة
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Folder Explorer View */
          <div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-8 text-sm text-[var(--color-text-muted)] flex-row-reverse justify-start select-none">
              <button
                onClick={() => setCurrentPath([])}
                className={`hover:text-[var(--color-accent)] transition-colors font-semibold ${
                  currentPath.length === 0 ? "text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] font-bold" : ""
                }`}
              >
                المكتبة الرئيسية
              </button>
              {currentPath.length > 0 && (
                <>
                  <ChevronLeft size={14} />
                  <button
                    onClick={() => setCurrentPath(currentPath.slice(0, 1))}
                    className={`hover:text-[var(--color-accent)] transition-colors font-semibold ${
                      currentPath.length === 1 ? "text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] font-bold" : ""
                    }`}
                  >
                    {currentPath[0] === "arabic" ? "الكتب العربية" : "الكتب الإنجليزية"}
                  </button>
                </>
              )}
              {currentPath.length > 1 && currentPath[0] === "arabic" && (
                <>
                  <ChevronLeft size={14} />
                  <button
                    onClick={() => setCurrentPath(currentPath.slice(0, 2))}
                    className={`hover:text-[var(--color-accent)] transition-colors font-semibold ${
                      currentPath.length === 2 ? "text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] font-bold" : ""
                    }`}
                  >
                    {currentPath[1] === "arabic_books" ? "الكتب والشروح" : "المنظومات والمتون"}
                  </button>
                </>
              )}
            </div>

            {/* View Render based on path */}
            <AnimatePresence mode="wait">
              {/* ROOT PATH [] */}
              {currentPath.length === 0 && (
                <motion.div
                  key="root"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {/* Arabic Folder */}
                  <div
                    onClick={() => setCurrentPath(["arabic"])}
                    className="p-8 bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] hover:border-[var(--color-accent)] border border-transparent transition-all cursor-pointer flex items-center justify-between flex-row-reverse group"
                  >
                    <div className="flex items-center gap-4 flex-row-reverse text-right">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                        <FolderOpen size={32} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                          كتب باللغة العربية
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          يحتوي على {arabicBooks.length + arabicPoems.length} مصنفاً علمياً مقسماً
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors rotate-180" />
                  </div>

                  {/* English Folder */}
                  <div
                    onClick={() => setCurrentPath(["english"])}
                    className="p-8 bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] hover:border-[var(--color-accent)] border border-transparent transition-all cursor-pointer flex items-center justify-between flex-row-reverse group"
                  >
                    <div className="flex items-center gap-4 flex-row-reverse text-right">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                        <FolderOpen size={32} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                          English Books & Translations
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {english.length} translated booklets and resources
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors rotate-180" />
                  </div>
                </motion.div>
              )}

              {/* ARABIC SUB-SECTIONS PATH ['arabic'] */}
              {currentPath.length === 1 && currentPath[0] === "arabic" && (
                <motion.div
                  key="arabic-subsections"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {/* Prose Books Folder */}
                  <div
                    onClick={() => setCurrentPath(["arabic", "arabic_books"])}
                    className="p-8 bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] hover:border-[var(--color-accent)] border border-transparent transition-all cursor-pointer flex items-center justify-between flex-row-reverse group"
                  >
                    <div className="flex items-center gap-4 flex-row-reverse text-right">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                        <BookOpen size={32} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                          الكتب والشروح
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          مؤلفات ورسائل وشروحات الشيخ عامر بهجت ({arabicBooks.length} كتاباً)
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors rotate-180" />
                  </div>

                  {/* Poetic Poems Folder */}
                  <div
                    onClick={() => setCurrentPath(["arabic", "arabic_poems"])}
                    className="p-8 bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] hover:border-[var(--color-accent)] border border-transparent transition-all cursor-pointer flex items-center justify-between flex-row-reverse group"
                  >
                    <div className="flex items-center gap-4 flex-row-reverse text-right">
                      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                        <Music size={32} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                          المنظومات والمتون
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          المنظومات الشعرية والمنثورات الصوتية للشيخ ({arabicPoems.length} منظومة)
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors rotate-180" />
                  </div>
                </motion.div>
              )}

              {/* ARABIC SUB-ITEMS LIST PATH WITH FILTER TABS ['arabic', subType] */}
              {currentPath.length === 2 && currentPath[0] === "arabic" && (
                <motion.div
                  key={`arabic-items-${currentPath[1]}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8 text-right"
                  dir="rtl"
                >
                  {/* Category tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 justify-start sm:justify-center scrollbar-none flex-row-reverse" dir="rtl">
                    {tabIds.map((tabId) => {
                      const isSelected = selectedCategory === tabId;
                      const count = getTabCount(tabId);

                      return (
                        <button
                          key={tabId}
                          onClick={() => setSelectedCategory(tabId)}
                          className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 flex items-center gap-1.5 ${
                            isSelected
                              ? "text-white animate-none"
                              : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)]"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="activeCategory"
                              className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] rounded-xl -z-10 shadow-md"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span>{getTabLabel(tabId)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isSelected 
                              ? "bg-white/20 text-white" 
                              : "bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-muted)]"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Grid layout */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {displayedItems.map((item) => (
                      <BookCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        author={item.author}
                        description={item.description}
                        category_name={item.category_name}
                        page_count={isPoemsView ? (item as Poem).verse_count : (item as Book).page_count}
                        is_featured={item.is_featured}
                        cover_image={!isPoemsView ? (item as Book).cover_image : undefined}
                        onView={() => {
                          if (isPoemsView) {
                            window.location.href = `/poems?id=${item.id}`;
                          } else {
                            setSelectedBook(item as Book);
                          }
                        }}
                      />
                    ))}
                  </div>
                  {displayedItems.length === 0 && (
                    <div className="text-center py-16 text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl p-10">
                      {isPoemsView ? (
                        <Music size={48} className="mx-auto mb-4 opacity-30" />
                      ) : (
                        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                      )}
                      <p>لا توجد {isPoemsView ? "منظومات" : "كتب"} مضافة في هذا القسم حالياً.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ENGLISH BOOKS LIST PATH ['english'] */}
              {currentPath.length === 1 && currentPath[0] === "english" && (
                <motion.div
                  key="english-books"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {english.map((book) => (
                      <BookCard key={book.id} {...book} onView={() => setSelectedBook(book)} />
                    ))}
                  </div>
                  {english.length === 0 && (
                    <div className="text-center py-16 text-[var(--color-text-muted)]">
                      <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                      <p>No English books uploaded yet.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
