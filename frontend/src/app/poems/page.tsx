"use client";

/**
 * Poems Page
 * ==========
 * Listing of poems with a featured poem displayed in split view.
 * Connected dynamically to the FastAPI backend API.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Play, Pause, Music, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { poemsApi, Poem } from "@/lib/api";
import { useAudio } from "@/context/AudioContext";

export default function PoemsPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const isCurrentTrack = currentTrack?.id === selectedPoem?.id;
  const [versePage, setVersePage] = useState(0);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const filteredPoems = poems.filter((poem) =>
    poem.title.includes(sidebarSearch) ||
    (poem.subject && poem.subject.includes(sidebarSearch)) ||
    (poem.description && poem.description.includes(sidebarSearch))
  );


  // Reset verse page on poem change
  useEffect(() => {
    setVersePage(0);
  }, [selectedPoem]);

  useEffect(() => {
    async function loadPoems() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await poemsApi.getAll({ limit: 500 });
        setPoems(data);
        
        // Support direct linking via URL query parameters (?id=12)
        const params = new URLSearchParams(window.location.search);
        const poemId = params.get("id");
        if (poemId && data.length > 0) {
          const matched = data.find((p) => p.id === Number(poemId));
          if (matched) {
            setSelectedPoem(matched);
            setIsLoading(false);
            return;
          }
        }

        if (data.length > 0) {
          setSelectedPoem(data[0]);
        }
      } catch (err: any) {
        setError("فشل تحميل قائمة المنظومات. يرجى التأكد من تشغيل الخادم.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPoems();
  }, []);

  return (
    <PageTransition className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B3FA0] to-[#8B5FD0] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Music size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-3">
              المنظومات والمتون
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] max-w-lg mx-auto">
              منظومات شعرية علمية للشيخ عامر بهجت، مع إمكانية القراءة والاستماع للتلاوة الصوتية
            </p>
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
        ) : poems.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl p-10">
            <Music size={48} className="mx-auto mb-4 opacity-30" />
            <p>لا توجد منظومات منشورة حالياً</p>
          </div>
        ) : (
          /* Split View Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poems List (sidebar) */}
            <ScrollReveal delay={0.1} className="lg:col-span-1">
              <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] p-4 border border-[var(--color-border)]/20">
                <h2 className="text-lg font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] px-3 py-2 mb-1">
                  قائمة المنظومات
                </h2>
                <div className="relative mb-3 px-2">
                  <Search size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    placeholder="ابحث عن منظومة..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full pr-8 pl-3 py-2 rounded-xl border border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)]/50 bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-xs text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                  {filteredPoems.map((poem) => (

                    <motion.button
                      key={poem.id}
                      onClick={() => setSelectedPoem(poem)}
                      whileHover={{ x: -3 }}
                      className={`w-full text-right flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        selectedPoem?.id === poem.id
                          ? "bg-[var(--color-accent)]/10 border-r-2 border-[var(--color-accent)]"
                          : "hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedPoem?.id === poem.id
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-muted)]"
                      }`}>
                        <Music size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          selectedPoem?.id === poem.id
                            ? "text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)]"
                            : "text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]"
                        }`}>
                          {poem.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {poem.subject || "عام"} • {poem.verse_count || "غير محدد"} أبيات
                        </p>
                      </div>
                      <ChevronLeft size={14} className="text-[var(--color-text-muted)]" />
                    </motion.button>
                  ))}
                  {filteredPoems.length === 0 && (
                    <div className="text-center py-6 text-xs text-[var(--color-text-muted)]">
                      لا توجد منظومات مطابقة
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Selected Poem (main content - split view) */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedPoem && (
                  <motion.div
                    key={selectedPoem.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Poem Text & Player Card */}
                    <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] p-8 border border-[var(--color-border)]/20">
                      <div className="flex items-center gap-3 mb-6 justify-start flex-row-reverse">
                        <h2 className="text-2xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                          {selectedPoem.title}
                        </h2>
                        {selectedPoem.is_featured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)]">
                            مميزة
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] mb-6 flex-row-reverse justify-start">
                        <span>{selectedPoem.author}</span>
                        <span>•</span>
                        <span>{selectedPoem.subject || "عام"}</span>
                        {selectedPoem.verse_count && (
                          <>
                            <span>•</span>
                            <span>{selectedPoem.verse_count} أبيات</span>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      {selectedPoem.description && (
                        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mb-6 leading-relaxed bg-[var(--color-bg-cream)]/30 dark:bg-gray-800/10 p-3 rounded-xl">
                          {selectedPoem.description}
                        </p>
                      )}

                      {/* Integrated Audio Player (Above Verses) */}
                      {selectedPoem.audio_path && (
                        <div className="mb-6 p-4 rounded-xl bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] border border-[var(--color-border)]/40 dark:border-[var(--color-border-dark)]/40 flex items-center justify-between flex-row-reverse">
                          <div className="flex items-center gap-3 flex-row-reverse">
                            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] flex items-center justify-center">
                              <Music size={18} />
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">استمع للمنظومة بصوت القارئ</p>
                              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-0.5">تشغيل الصوت في مشغل عائم أسفل الشاشة</p>
                            </div>
                          </div>
                          <button
                            onClick={() => isCurrentTrack ? togglePlay() : playTrack(selectedPoem)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                          >
                            {isCurrentTrack && isPlaying ? (
                              <>
                                <Pause size={16} className="fill-current" />
                                <span>إيقاف مؤقت</span>
                              </>
                            ) : (
                              <>
                                <Play size={16} className="fill-current translate-x-[-1px]" />
                                <span>تشغيل الصوت</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Decorative divider */}
                      <div className="divider-ornament mb-6 text-center">
                        <span className="text-[var(--color-accent)]">❋</span>
                      </div>

                      {/* Scrollable Verses Container */}
                      <div className="max-h-[450px] overflow-y-auto pr-2 pl-2 scrollbar-thin scrollbar-thumb-[var(--color-accent)]/30 scrollbar-track-transparent">
                        {(() => {
                          const versesPerPage = 10;
                          const verses = selectedPoem.text_content.split("\n").filter(line => line.trim() !== "");
                          const totalPages = Math.ceil(verses.length / versesPerPage);
                          const displayedVerses = verses.slice(versePage * versesPerPage, (versePage + 1) * versesPerPage);

                          return (
                            <>
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={versePage}
                                  initial={{ opacity: 0, x: 25 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -25 }}
                                  transition={{ duration: 0.2 }}
                                  className="space-y-2"
                                >
                                  {displayedVerses.map((line, index) => (
                                    <div
                                      key={index}
                                      className="verse-line flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/10"
                                    >
                                      {line.includes("***") ? (
                                        <>
                                          <span className="flex-1 text-left text-sm md:text-base text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] font-medium font-serif leading-relaxed">{line.split("***")[0].trim()}</span>
                                          <span className="text-[var(--color-accent)] text-xs">✦</span>
                                          <span className="flex-1 text-right text-sm md:text-base text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] font-medium font-serif leading-relaxed">{line.split("***")[1].trim()}</span>
                                        </>
                                      ) : (
                                        <span className="w-full text-center text-sm md:text-base text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] font-medium font-serif leading-relaxed">{line}</span>
                                      )}
                                    </div>
                                  ))}
                                </motion.div>
                              </AnimatePresence>
                              
                              {/* Verses Pagination controls */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 flex-row-reverse bg-gray-50/50 dark:bg-gray-800/10 p-3 rounded-xl border border-[var(--color-border)]/10">
                                  <button
                                    type="button"
                                    disabled={versePage === 0}
                                    onClick={() => setVersePage(prev => Math.max(0, prev - 1))}
                                    className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:text-[var(--color-accent)] disabled:opacity-30 disabled:hover:text-[var(--color-text-muted)] transition-colors select-none cursor-pointer"
                                  >
                                    السابق
                                    <ChevronRight size={14} />
                                  </button>
                                  
                                  <span className="text-xs text-[var(--color-text-muted)] font-medium">
                                    الأبيات {versePage * versesPerPage + 1} - {Math.min((versePage + 1) * versesPerPage, verses.length)} من أصل {verses.length}
                                  </span>

                                  <button
                                    type="button"
                                    disabled={versePage >= totalPages - 1}
                                    onClick={() => setVersePage(prev => Math.min(totalPages - 1, prev + 1))}
                                    className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:text-[var(--color-accent)] disabled:opacity-30 disabled:hover:text-[var(--color-text-muted)] transition-colors select-none cursor-pointer"
                                  >
                                    <ChevronLeft size={14} />
                                    التالي
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
