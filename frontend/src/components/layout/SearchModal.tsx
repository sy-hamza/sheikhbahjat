"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, Music, Video, MessageCircleQuestion, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { booksApi, poemsApi, fatwasApi, videosApi, Book, Poem, Fatwa, Video as VideoType } from "@/lib/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResults {
  books: Book[];
  poems: Poem[];
  fatwas: Fatwa[];
  videos: VideoType[];
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ books: [], poems: [], fatwas: [], videos: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults({ books: [], poems: [], fatwas: [], videos: [] });
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Debounced search query fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults({ books: [], poems: [], fatwas: [], videos: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const [books, poems, fatwas, videos] = await Promise.all([
          booksApi.getAll({ search: query, limit: 5 }),
          poemsApi.getAll({ search: query, limit: 5 }),
          fatwasApi.getApproved({ search: query, limit: 5 }),
          videosApi.getAll({ search: query, limit: 5 }),
        ]);

        setResults({ books, poems, fatwas, videos });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const hasResults =
    results.books.length > 0 ||
    results.poems.length > 0 ||
    results.fatwas.length > 0 ||
    results.videos.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 md:p-10"
          dir="rtl"
        >
          {/* Modal Header */}
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold font-[var(--font-family-heading)] text-white">البحث الشامل في الأرشيف</h2>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl w-full mx-auto relative mb-8">
            <input
              ref={inputRef}
              type="text"
              placeholder="اكتب كلمة للبحث في الكتب، المنظومات، الفتاوى، أو المرئيات..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pr-14 pl-12 py-4 rounded-2xl bg-white/10 dark:bg-slate-900/60 border border-white/15 dark:border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-transparent transition-all text-base md:text-lg"
            />
            <Search size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
            {isLoading && (
              <Loader2 size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-accent)] animate-spin" />
            )}
          </div>

          {/* Search Results Area */}
          <div className="max-w-4xl w-full mx-auto flex-1 overflow-y-auto pr-1">
            {query.trim() === "" ? (
              <div className="text-center py-20 text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-25 text-white" />
                <p className="text-base font-semibold">ابدأ بكتابة أي كلمة للبحث الفوري</p>
                <p className="text-xs opacity-65 mt-1">مثال: "حنبلي"، "شرح أخصر المختصرات"، "صلاة"</p>
              </div>
            ) : !isLoading && !hasResults ? (
              <div className="text-center py-20 text-slate-400">
                <X size={48} className="mx-auto mb-4 opacity-25 text-white" />
                <p className="text-base font-semibold">لم نجد أي نتائج مطابقة لـ "{query}"</p>
                <p className="text-xs opacity-65 mt-1">تأكد من كتابة الكلمة بشكل صحيح أو جرب كلمة أخرى</p>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {/* Books Results */}
                {results.books.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-light)] flex items-center gap-2">
                      <BookOpen size={14} />
                      <span>الكتب والشروحات ({results.books.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {results.books.map((book) => (
                        <Link
                          key={book.id}
                          href={`/books?id=${book.id}`}
                          onClick={onClose}
                          className="p-4 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent-light)] flex items-center justify-center">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-[var(--color-accent-light)] transition-colors">{book.title}</p>
                              {book.category_name && <p className="text-[10px] text-slate-400 mt-0.5">{book.category_name}</p>}
                            </div>
                          </div>
                          <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Poems Results */}
                {results.poems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Music size={14} />
                      <span>المنظومات والمتون ({results.poems.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {results.poems.map((poem) => (
                        <Link
                          key={poem.id}
                          href={`/poems?id=${poem.id}`}
                          onClick={onClose}
                          className="p-4 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center">
                              <Music size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{poem.title}</p>
                              {poem.subject && <p className="text-[10px] text-slate-400 mt-0.5">{poem.subject}</p>}
                            </div>
                          </div>
                          <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos Results */}
                {results.videos.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                      <Video size={14} />
                      <span>المرئيات اليوتيوب ({results.videos.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {results.videos.map((vid) => (
                        <Link
                          key={vid.id}
                          href={`/videos?id=${vid.id}`}
                          onClick={onClose}
                          className="p-4 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-300 flex items-center justify-center">
                              <Video size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">{vid.title}</p>
                              {vid.category_name && <p className="text-[10px] text-slate-400 mt-0.5">{vid.category_name}</p>}
                            </div>
                          </div>
                          <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fatwas Results */}
                {results.fatwas.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                      <MessageCircleQuestion size={14} />
                      <span>الفتاوى المجابة ({results.fatwas.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {results.fatwas.map((fatwa) => (
                        <Link
                          key={fatwa.id}
                          href={`/fatwa?search=${encodeURIComponent(fatwa.question.slice(0, 20))}`}
                          onClick={onClose}
                          className="p-4 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-300 flex items-center justify-center">
                              <MessageCircleQuestion size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">{fatwa.question}</p>
                              {fatwa.topic && <p className="text-[10px] text-slate-400 mt-0.5">{fatwa.topic}</p>}
                            </div>
                          </div>
                          <ArrowLeft size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
