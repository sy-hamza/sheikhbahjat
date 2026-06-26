"use client";

/**
 * Fatwa Page
 * ==========
 * Public Q&A page with instant search and topic filtering.
 * Connected dynamically to the FastAPI backend API.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageTransition from "@/components/layout/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { MessageCircleQuestion, Search, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { fatwasApi, Fatwa } from "@/lib/api";

function FatwaCard({ fatwa }: { fatwa: Fatwa }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]/20 text-right"
      dir="rtl"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-right p-6 flex items-start gap-4 hover:bg-[var(--color-bg-cream)]/50 dark:hover:bg-[var(--color-bg-dark-elevated)]/50 transition-colors flex-row-reverse"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageCircleQuestion size={18} className="text-white" />
        </div>
        <div className="flex-1 text-right">
          <h3 className="text-lg font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-1">
            {fatwa.question}
          </h3>
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] flex-row-reverse justify-end">
            <span>سأل: {fatwa.questioner_name || "مجهول"}</span>
            {fatwa.topic && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)]">
                {fatwa.topic}
              </span>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-[var(--color-accent)] flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown size={20} className="text-[var(--color-text-muted)] flex-shrink-0 mt-1" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pl-20 text-right">
              <div className="h-px bg-[var(--color-border)] dark:bg-[var(--color-border-dark)] mb-4" />
              <div className="bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] rounded-xl p-5 border border-[var(--color-border)]/30">
                <p className="text-xs text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] font-bold mb-2">الجواب الشرعي:</p>
                <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] leading-relaxed whitespace-pre-line text-sm">
                  {fatwa.answer || "جاري كتابة الإجابة..."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FatwaPage() {
  const [fatwas, setFatwas] = useState<Fatwa[]>([]);
  const [topics, setTopics] = useState<string[]>(["الكل"]);
  const [selectedTopic, setSelectedTopic] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lookup Private Fatwa States
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState<Fatwa | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fatwasApi.lookupByCode(lookupCode);
      setLookupResult(res);
    } catch (err: any) {
      console.error(err);
      setLookupError(err.message || "لم يتم العثور على سؤال بهذا الرمز. يرجى التأكد من كتابة الرمز بشكل صحيح.");
    } finally {
      setIsLookingUp(false);
    }
  };


  useEffect(() => {
    async function loadFatwaData() {
      setIsLoading(true);
      setError(null);
      try {
        const [fatwasData, topicsData] = await Promise.all([
          fatwasApi.getApproved({ limit: 100 }),
          fatwasApi.getTopics(),
        ]);
        setFatwas(fatwasData);
        setTopics(["الكل", ...topicsData]);

        // Support search query parameter from global search modal
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get("search");
        if (searchParam) {
          setSearchQuery(searchParam);
        }
      } catch (err: any) {
        setError("فشل تحميل قائمة الفتاوى. يرجى التأكد من تشغيل الخادم.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFatwaData();
  }, []);

  const filtered = fatwas.filter((f) => {
    const matchesSearch = !searchQuery ||
      f.question.includes(searchQuery) ||
      (f.answer && f.answer.includes(searchQuery));
    const matchesTopic = selectedTopic === "الكل" || f.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <PageTransition className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A6633E] to-[#C5834E] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MessageCircleQuestion size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-3">
              الفتاوى والأسئلة الشرعية
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] max-w-lg mx-auto mb-6">
              أرشيف الفتاوى والإجابات الفقهية المعتمدة للشيخ عامر بهجت
            </p>
            <Link
              href="/fatwa/submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-300"
            >
              <Send size={16} />
              أرسل سؤالك للشيخ
            </Link>
          </div>
        </ScrollReveal>

        {/* Lookup Private Fatwa Card */}
        <ScrollReveal delay={0.05}>
          <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/50 dark:border-[var(--color-border-dark)] rounded-2xl p-6 shadow-[var(--shadow-soft)] mb-8 text-right" dir="rtl">
            <h3 className="text-lg font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-2 flex items-center gap-2 justify-start flex-row-reverse">
              <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center text-purple-600">
                🔑
              </span>
              <span>الاستعلام عن سؤال خاص (رمز التذكرة)</span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mb-4">
              إذا قمت بإرسال سؤال خاص، يمكنك إدخال رمز التذكرة الخاص بك (مثل: BHJ-XXXX-XXXX) أدناه للاستعلام عن حالة السؤال واستعراض إجابة الشيخ فور صدورها.
            </p>
            <form onSubmit={handleLookup} className="flex gap-2 flex-row-reverse">
              <input
                type="text"
                placeholder="أدخل رمز التذكرة الخاص بك..."
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-center font-mono font-bold tracking-wider"
                dir="ltr"
                required
              />
              <button
                type="submit"
                disabled={isLookingUp}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري الاستعلام...
                  </>
                ) : (
                  "استعلام"
                )}
              </button>
            </form>

            {/* Lookup Result Display */}
            <AnimatePresence>
              {lookupResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 pt-5 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] space-y-4 overflow-hidden"
                >
                  {lookupResult.status === "pending" && (
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 text-sm">
                      ⏳ <strong>حالة السؤال:</strong> سؤالك قيد الدراسة والمراجعة حالياً من قبل الشيخ عامر بهجت. يرجى الاحتفاظ بالرمز والاستعلام لاحقاً.
                    </div>
                  )}

                  {lookupResult.status === "rejected" && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-400 text-sm">
                      ❌ <strong>حالة السؤال:</strong> نعتذر منك، لم يتم قبول هذا السؤال لمخالفته شروط النشر أو التكرار.
                    </div>
                  )}

                  {lookupResult.status === "approved" && (
                    <div className="bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] border border-purple-200 dark:border-purple-900/30 rounded-xl p-5 text-right space-y-3">
                      <div className="flex items-center justify-between flex-row-reverse border-b border-purple-100 dark:border-purple-900/30 pb-2">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-400">✅ تمت إجابة سؤالك الخاص بنجاح</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">أجيب بتاريخ: {lookupResult.answered_at ? new Date(lookupResult.answered_at).toLocaleDateString("ar-SA") : ""}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--color-text-muted)] block">السؤال:</span>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mt-1">
                          {lookupResult.question}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]/50">
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-bold block mb-1">الجواب الشرعي:</span>
                        <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] leading-relaxed whitespace-pre-line bg-white dark:bg-gray-900 p-4 rounded-lg border border-[var(--color-border)]/50">
                          {lookupResult.answer}
                        </p>
                      </div>
                      <p className="text-[10px] text-purple-500 text-center font-semibold pt-1">
                        🔒 تنبيه: هذه الإجابة سرية وخاصة بك تماماً ولم يتم نشرها في الأرشيف العام للموقع.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {lookupError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center font-bold"
                >
                  ⚠️ {lookupError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {error && (

          <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Search & Filter */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3 mb-8 text-right" dir="rtl">
            <div className="relative flex-1">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="ابحث في نص الأسئلة أو الإجابات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-11 pl-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 transition-all text-sm text-right"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2 flex-wrap flex-row-reverse justify-end">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    selectedTopic === topic
                      ? "bg-[var(--color-accent)] text-white shadow-md"
                      : "bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Fatwas List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={36} className="text-[var(--color-accent)] animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filtered.map((fatwa, index) => (
                <ScrollReveal key={fatwa.id} delay={index * 0.05}>
                  <FatwaCard fatwa={fatwa} />
                </ScrollReveal>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-[var(--color-text-muted)]">
                <MessageCircleQuestion size={48} className="mx-auto mb-4 opacity-30" />
                <p>لم يتم العثور على فتاوى مطابقة لخيارات البحث</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
