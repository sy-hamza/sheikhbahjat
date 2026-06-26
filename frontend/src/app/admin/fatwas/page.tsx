"use client";

/**
 * Admin Fatwas Management
 * =======================
 * Stateful view of all fatwas with filtering, answering, approving, rejecting, and deleting actions.
 * Communicates with the FastAPI backend.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircleQuestion, Clock, CheckCircle, XCircle, Trash2, Send, Check, X, Loader2,
  Lock, Globe, Mail, Phone, EyeOff
} from "lucide-react";
import { fatwasApi, Fatwa } from "@/lib/api";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "معلق", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/10 dark:text-amber-400", icon: Clock },
  approved: { label: "منشور", color: "text-green-600 bg-green-50 dark:bg-green-950/10 dark:text-green-400", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "text-red-600 bg-red-50 dark:bg-red-950/10 dark:text-red-400", icon: XCircle },
};

export default function AdminFatwasPage() {
  const [fatwas, setFatwas] = useState<Fatwa[]>([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFatwas();
  }, [filter]);

  const fetchFatwas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (filter === "all") {
        const [pending, approved, rejected] = await Promise.all([
          fatwasApi.getPending("pending"),
          fatwasApi.getPending("approved"),
          fatwasApi.getPending("rejected"),
        ]);
        // Merge and sort by ID descending or created_at descending
        const merged = [...pending, ...approved, ...rejected].sort((a, b) => b.id - a.id);
        setFatwas(merged);
      } else {
        const data = await fatwasApi.getPending(filter);
        const sorted = data.sort((a, b) => b.id - a.id);
        setFatwas(sorted);
      }
    } catch (err: any) {
      setError(err.message || "فشل تحميل الأسئلة من الخادم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (id: number) => {
    if (!answerText.trim()) {
      alert("الرجاء كتابة نص الإجابة أولاً");
      return;
    }

    setIsSubmitting(true);
    try {
      await fatwasApi.answer(id, { answer: answerText, status: "approved" });
      setAnsweringId(null);
      setAnswerText("");
      fetchFatwas();
    } catch (err: any) {
      alert(err.message || "فشل إرسال الإجابة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في رفض هذا السؤال؟")) return;

    try {
      await fatwasApi.reject(id);
      fetchFatwas();
    } catch (err: any) {
      alert(err.message || "فشل رفض السؤال");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا السؤال نهائياً من قاعدة البيانات؟")) return;

    try {
      await fatwasApi.delete(id);
      fetchFatwas();
    } catch (err: any) {
      alert(err.message || "فشل حذف السؤال");
    }
  };

  return (
    <div className="text-right" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
            إدارة الفتاوى والأسئلة
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">
            مراجعة الأسئلة الواردة من المستخدمين والإجابة عليها ونشرها أو رفضها
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "الكل" },
          { key: "pending", label: "المعلقة" },
          { key: "approved", label: "المنشورة" },
          { key: "rejected", label: "المرفوضة" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] hover:border-[var(--color-primary)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={36} className="text-[var(--color-accent)] animate-spin" />
        </div>
      ) : (
        /* Fatwas List */
        <div className="space-y-4">
          {fatwas.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl p-10 text-center text-[var(--color-text-muted)] text-sm">
              لا توجد أسئلة تطابق الفلتر المحدد حالياً.
            </div>
          ) : (
            fatwas.map((fatwa) => {
              const config = statusConfig[fatwa.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={fatwa.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden border border-[var(--color-border)]/20"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-row-reverse">
                      {/* Left: Info & content */}
                      <div className="flex-1 text-right">
                        <div className="flex items-center gap-2 mb-2 justify-start flex-row-reverse">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            <StatusIcon size={12} />
                            {config.label}
                          </span>

                          {/* Visibility badge */}
                          {fatwa.is_private ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400">
                              <Lock size={11} />
                              خاص
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                              <Globe size={11} />
                              عام
                            </span>
                          )}

                          {/* Notification Channel Badge */}
                          {fatwa.is_private && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {fatwa.notification_method === "email" ? (
                                <>
                                  <Mail size={11} className="text-purple-600" />
                                  إيميل
                                </>
                              ) : fatwa.notification_method === "whatsapp" ? (
                                <>
                                  <Phone size={11} className="text-green-600" />
                                  واتساب
                                </>
                              ) : (
                                <>
                                  <EyeOff size={11} />
                                  بدون إشعار
                                </>
                              )}
                            </span>
                          )}

                          {/* Answer delivery status badge */}
                          {fatwa.status === "approved" && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              fatwa.is_answered_and_sent 
                                ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            }`}>
                              {fatwa.is_answered_and_sent ? "تم الإرسال" : "بانتظار الإرسال"}
                            </span>
                          )}

                          {fatwa.topic && (
                            <span className="text-xs text-[var(--color-text-muted)] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              {fatwa.topic}
                            </span>
                          )}
                          <span className="text-xs text-[var(--color-text-muted)]">#{fatwa.id}</span>
                        </div>
                        <h3 className="text-base font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
                          {fatwa.question}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] justify-start flex-row-reverse flex-wrap">
                          <span>سأل: {fatwa.is_private ? "سائل خاص" : (fatwa.questioner_name || "مجهول")}</span>
                          {fatwa.questioner_email && (
                            <span className="ltr select-all flex items-center gap-1">
                              <Mail size={10} />
                              {fatwa.questioner_email}
                            </span>
                          )}
                          {fatwa.questioner_whatsapp && (
                            <span className="ltr select-all flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                              <Phone size={10} />
                              {fatwa.questioner_whatsapp}
                            </span>
                          )}
                          {fatwa.created_at && (
                            <span>بتاريخ: {new Date(fatwa.created_at).toLocaleDateString("ar-SA")}</span>
                          )}
                        </div>

                        {fatwa.answer && (
                          <div className="mt-4 p-4 bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] rounded-xl border border-[var(--color-border)]/50">
                            <span className="block text-xs font-bold text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] mb-1">الجواب:</span>
                            <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] whitespace-pre-line">
                              {fatwa.answer}
                            </p>
                            {fatwa.answered_by && (
                              <span className="block text-xs text-[var(--color-text-muted)] mt-2">
                                المجيب: {fatwa.answered_by}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex gap-2 flex-shrink-0 flex-row">
                        {fatwa.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setAnsweringId(answeringId === fatwa.id ? null : fatwa.id);
                                setAnswerText(fatwa.answer || "");
                              }}
                              className="px-4 py-2 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] hover:bg-[var(--color-accent)]/20 transition-all text-xs font-semibold"
                            >
                              {answeringId === fatwa.id ? "إلغاء" : "إجابة ونشر"}
                            </button>
                            <button
                              onClick={() => handleReject(fatwa.id)}
                              className="p-2 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                              title="رفض السؤال"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}

                        {fatwa.status === "approved" && (
                          <button
                            onClick={() => {
                              setAnsweringId(answeringId === fatwa.id ? null : fatwa.id);
                              setAnswerText(fatwa.answer || "");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs"
                            title="تعديل الإجابة"
                          >
                            تعديل الجواب
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(fatwa.id)}
                          className="p-2 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          title="حذف نهائي"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Answer form */}
                  <AnimatePresence>
                    {answeringId === fatwa.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-900/10"
                      >
                        <div className="p-5 space-y-3">
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                            نص إجابة الشيخ عامر بهجت:
                            {fatwa.is_private && (
                              <span className="text-xs text-purple-600 dark:text-purple-400 block mt-1 font-normal">
                                تنبيه: هذا السؤال خاص. عند إرسال الإجابة سيتم توجيهها للسائل مباشرة عبر{" "}
                                {fatwa.notification_method === "email" ? "البريد الإلكتروني" : fatwa.notification_method === "whatsapp" ? "الواتساب" : "القناة المختارة"}{" "}
                                ولن يتم نشره على الموقع العام.
                              </span>
                            )}
                          </label>
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="اكتب الإجابة الفقهية هنا بالتفصيل..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 transition-all resize-y text-sm"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setAnsweringId(null); setAnswerText(""); }}
                              className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={() => handleAnswerSubmit(fatwa.id)}
                              disabled={isSubmitting}
                              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${
                                fatwa.is_private ? "bg-purple-600 hover:bg-purple-700" : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
                              }`}
                            >
                              {isSubmitting ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                              {fatwa.is_private ? "إرسال الإجابة للسائل" : "نشر الجواب للعامة"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }))}
        </div>
      )}
    </div>
  );
}
