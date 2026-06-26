"use client";

/**
 * Admin Dashboard
 * ===============
 * Live overview with real-time statistics and quick actions for pending questions.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, Music, MessageCircleQuestion, Clock, CheckCircle, XCircle, TrendingUp, Loader2, Send, ChevronLeft
} from "lucide-react";
import { booksApi, poemsApi, fatwasApi, Fatwa } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    books: 0,
    poems: 0,
    approvedFatwas: 0,
    pendingFatwas: 0,
  });
  const [pendingQuestions, setPendingQuestions] = useState<Fatwa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick answer states
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [quickAnswerText, setQuickAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [booksData, poemsData, fatwasStats, pendingFatwasData] = await Promise.all([
        booksApi.getAll({ include_unpublished: true, limit: 1000 }),
        poemsApi.getAll({ include_unpublished: true, limit: 1000 }),
        fatwasApi.getStats(),
        fatwasApi.getPending("pending"),
      ]);

      setStats({
        books: booksData.length,
        poems: poemsData.length,
        approvedFatwas: fatwasStats.approved || 0,
        pendingFatwas: fatwasStats.pending || 0,
      });

      // Show the most recent 5 pending questions
      setPendingQuestions(pendingFatwasData.slice(0, 5));
    } catch (err: any) {
      setError(err.message || "فشل تحميل بيانات لوحة التحكم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAnswerSubmit = async (id: number) => {
    if (!quickAnswerText.trim()) {
      alert("الرجاء كتابة نص الإجابة أولاً");
      return;
    }

    setIsSubmitting(true);
    try {
      await fatwasApi.answer(id, { answer: quickAnswerText, status: "approved" });
      setAnsweringId(null);
      setQuickAnswerText("");
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "فشل إرسال الإجابة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickReject = async (id: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في رفض هذا السؤال؟")) return;

    try {
      await fatwasApi.reject(id);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "فشل رفض السؤال");
    }
  };

  const statsCards = [
    { label: "الكتب والكتيبات", value: stats.books, icon: BookOpen, color: "from-[var(--color-secondary)] to-[var(--color-secondary-light)]", href: "/admin/books" },
    { label: "المنظومات والملفات الصوتية", value: stats.poems, icon: Music, color: "from-[#6B3FA0] to-[#8B5FD0]", href: "/admin/poems" },
    { label: "الفتاوى المنشورة", value: stats.approvedFatwas, icon: CheckCircle, color: "from-[var(--color-accent-dark)] to-[var(--color-accent)]", href: "/admin/fatwas" },
    { label: "أسئلة معلقة", value: stats.pendingFatwas, icon: Clock, color: "from-[#D97706] to-[#F59E0B]", href: "/admin/fatwas" },
  ];

  return (
    <div className="text-right" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
          لوحة التحكم الإدارية
        </h1>
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">
          مرحباً بك في لوحة إدارة موقع الشيخ عامر بهجت. يمكنك إدارة الكتب، المنظومات، ومتابعة الفتاوى.
        </p>
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
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={stat.href}
                    className="block p-5 bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all group border border-[var(--color-border)]/10"
                  >
                    <div className="flex items-center justify-between mb-3 flex-row-reverse">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <TrendingUp size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">{stat.value}</p>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1 font-medium">{stat.label}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Pending Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]/10">
              <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex-row-reverse">
                <h2 className="text-lg font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] flex items-center gap-2 flex-row-reverse">
                  <Clock size={18} className="text-[#D97706]" />
                  الأسئلة الأخيرة المعلقة
                </h2>
                <Link href="/admin/fatwas" className="text-sm text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] hover:text-[var(--color-accent)] flex items-center gap-1">
                  عرض جميع الأسئلة
                  <ChevronLeft size={14} />
                </Link>
              </div>

              <div className="divide-y divide-[var(--color-border)] dark:divide-[var(--color-border-dark)]">
                {pendingQuestions.length === 0 ? (
                  <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">
                    لا توجد أسئلة معلقة حالياً.
                  </div>
                ) : (
                  pendingQuestions.map((q) => (
                    <div key={q.id} className="p-5 hover:bg-[var(--color-bg-cream)]/50 dark:hover:bg-[var(--color-bg-dark-elevated)]/50 transition-colors">
                      <div className="flex items-start gap-4 flex-row-reverse justify-between">
                        <div className="w-8 h-8 rounded-full bg-[#D97706]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageCircleQuestion size={14} className="text-[#D97706]" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-1">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] flex-row-reverse justify-start">
                            <span>سأل: {q.questioner_name || "مجهول"}</span>
                            {q.created_at && (
                              <span>بتاريخ: {new Date(q.created_at).toLocaleDateString("ar-SA")}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 flex-row">
                          <button
                            onClick={() => {
                              setAnsweringId(answeringId === q.id ? null : q.id);
                              setQuickAnswerText("");
                            }}
                            className="p-2 rounded-lg bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 transition-colors"
                            title="إجابة سريعة"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleQuickReject(q.id)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            title="رفض"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Inline quick answer form */}
                      <AnimatePresence>
                        {answeringId === q.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4 pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]"
                          >
                            <div className="space-y-3">
                              <textarea
                                value={quickAnswerText}
                                onChange={(e) => setQuickAnswerText(e.target.value)}
                                placeholder="اكتب الإجابة السريعة هنا ونشط نشرها..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-transparent text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-y"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => { setAnsweringId(null); setQuickAnswerText(""); }}
                                  className="px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  إلغاء
                                </button>
                                <button
                                  onClick={() => handleQuickAnswerSubmit(q.id)}
                                  disabled={isSubmitting}
                                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-dark)] transition-colors disabled:opacity-50"
                                >
                                  {isSubmitting ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Send size={12} />
                                  )}
                                  حفظ ونشر الإجابة
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
