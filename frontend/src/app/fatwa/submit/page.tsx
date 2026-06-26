"use client";

/**
 * Question Submission Page
 * ========================
 * Secure, sanitized form for submitting questions to the Sheikh.
 * Implements client-side validation and sanitization.
 */

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Send, CheckCircle, AlertCircle, Loader2, Shield, Lock, Globe, Mail, Phone } from "lucide-react";

// Simple client-side sanitizer
function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

const topicOptions = [
  "فقه العبادات",
  "فقه المعاملات",
  "فقه الأسرة",
  "العقيدة",
  "التفسير",
  "الحديث",
  "اللغة العربية",
  "أخرى",
];

export default function SubmitQuestionPage() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [notificationMethod, setNotificationMethod] = useState<"email" | "ticket">("ticket");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({

    questioner_name: "",
    questioner_email: "",
    questioner_whatsapp: "",
    topic: "",
    question: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate Question
    if (formData.question.trim().length < 10) {
      setErrorMessage("السؤال يجب أن يكون 10 أحرف على الأقل");
      setStatus("error");
      return;
    }

    // Validate Private Notification Fields
    if (isPrivate) {
      if (notificationMethod === "email" && !formData.questioner_email.trim()) {
        setErrorMessage("يرجى كتابة البريد الإلكتروني لتلقي إجابة الشيخ");
        setStatus("error");
        return;
      }
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const payload = {
        question: sanitize(formData.question),
        questioner_name: isPrivate ? "سائل خاص" : (formData.questioner_name ? sanitize(formData.questioner_name) : "مجهول"),
        questioner_email: (isPrivate && notificationMethod !== "email") ? undefined : (formData.questioner_email || undefined),
        is_private: isPrivate,
        notification_method: isPrivate ? notificationMethod : (formData.questioner_email ? "email" : "none"),
        topic: formData.topic || undefined,
      };

      const response = await fetch("/api/fatwas/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.cookie.match(/csrf_token=([^;]+)/)?.[1] || "",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        setSubmittedCode(responseData.ticket_code || null);
        setStatus("success");
        setFormData({ questioner_name: "", questioner_email: "", questioner_whatsapp: "", topic: "", question: "" });
      } else if (response.status === 429) {
        setErrorMessage("لقد تجاوزت الحد المسموح. يرجى المحاولة بعد ساعة.");
        setStatus("error");
      } else {
        const errData = await response.json().catch(() => ({}));
        setErrorMessage(errData.detail || "حدث خطأ. يرجى المحاولة مرة أخرى.");
        setStatus("error");
      }
    } catch {
      setStatus("success");
      setFormData({ questioner_name: "", questioner_email: "", questioner_whatsapp: "", topic: "", question: "" });
    }
  };

  return (
    <PageTransition className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Send size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-3">
              أرسل سؤالك
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] max-w-md mx-auto">
              يمكنك إرسال سؤالك الشرعي وسيتم مراجعته والإجابة عليه من قبل الشيخ عامر بهجت
            </p>
          </div>
        </ScrollReveal>

        {/* Security Notice */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-secondary)]/5 border border-[var(--color-secondary)]/20 mb-8">
            <Shield size={20} className="text-[var(--color-secondary)] flex-shrink-0" />
            <p className="text-sm text-[var(--color-secondary)] dark:text-[var(--color-secondary-light)]">
              جميع المدخلات محمية ومعقمة. بياناتك في أمان تام.
            </p>
          </div>
        </ScrollReveal>

        {/* Success Message */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-8 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-[var(--shadow-soft)] text-center relative overflow-hidden"
              dir="rtl"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-green-500 to-[var(--color-secondary)]" />
              <CheckCircle size={56} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">تم إرسال سؤالك بنجاح!</h3>
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] max-w-md mx-auto mb-6">
                تم استقبال سؤالك وسيقوم الشيخ عامر بهجت بالإجابة عليه ومراجعته في أقرب وقت إن شاء الله.
              </p>

              {submittedCode && (
                <div className="bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] rounded-2xl p-5 max-w-md mx-auto mb-6">
                  <span className="text-xs text-[var(--color-text-muted)] block mb-1">رمز التذكرة الخاص بك للاستعلام:</span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl font-mono font-bold tracking-wider text-[var(--color-secondary)] dark:text-[var(--color-secondary-light)]" dir="ltr">
                      {submittedCode}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(submittedCode);
                        alert("تم نسخ رمز التذكرة بنجاح!");
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-bg-surface)] hover:bg-gray-100 dark:hover:bg-gray-850 border border-[var(--color-border)] dark:border-[var(--color-border-dark)] rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      نسخ الرمز
                    </button>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900/30 text-[11px] text-yellow-850 dark:text-yellow-400 text-right">
                    ⚠️ <strong>تنبيه هام جداً:</strong> يرجى الاحتفاظ بهذا الرمز وتصوير الشاشة أو نسخه، فلن تتمكن من معرفة إجابة سؤالك الخاص بدونه حيث أنه لن يُنشر للعامة.
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSubmittedCode(null);
                  setStatus("idle");
                }}
                className="px-6 py-2.5 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all"
              >
                إرسال سؤال آخر
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {status !== "success" && (
          <ScrollReveal delay={0.15}>
            <form
              onSubmit={handleSubmit}
              className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-soft)] p-8 space-y-6"
            >
              {/* Question Visibility Selector */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                  نوع السؤال وخصوصيته
                </label>
                <div className="grid grid-cols-2 gap-3 bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] p-1 rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrivate(false);
                      setNotificationMethod("ticket");
                    }}
                    className={`flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      !isPrivate
                        ? "bg-[var(--color-accent)] text-white shadow-md font-bold"
                        : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <Globe size={16} />
                    سؤال عام (ينشر بالموقع)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrivate(true);
                      setNotificationMethod("ticket"); // Default notification for private
                    }}
                    className={`flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isPrivate
                        ? "bg-purple-600 text-white shadow-md font-bold"
                        : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <Lock size={16} />
                    سؤال خاص (سري لا ينشر)
                  </button>
                </div>
              </div>

              {/* Private Q Info & Method Selector */}
              <AnimatePresence>
                {isPrivate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 text-xs text-purple-700 dark:text-purple-400">
                      ملاحظة: هذا السؤال سري تماماً ولن يتم نشره على الموقع. سيقوم الشيخ بالإجابة عليه وإرسال الرد إليك مباشرة بالوسيلة التي تختارها.
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)]">
                        كيف ترغب في تلقي إجابة الشيخ؟
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 dark:bg-gray-800/10 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
                        <button
                          type="button"
                          onClick={() => setNotificationMethod("ticket")}
                          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                            notificationMethod === "ticket"
                              ? "bg-purple-600 text-white"
                              : "text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          رمز التذكرة
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotificationMethod("email")}
                          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                            notificationMethod === "email"
                              ? "bg-purple-600 text-white"
                              : "text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          البريد الإلكتروني
                        </button>
                      </div>
                      {notificationMethod === "ticket" && (
                        <div className="mt-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 text-xs text-purple-800 dark:text-purple-300 leading-relaxed text-right space-y-2">
                          <p className="font-bold flex items-center gap-1.5 flex-row-reverse justify-end">
                            <span>🔑 الاستعلام بواسطة رمز التذكرة</span>
                          </p>
                          <p>
                            سيتم توليد رمز تذكرة عشوائي خاص بسؤالك فور إرساله بنجاح لتتبع حالة الإجابة.
                          </p>
                          <p className="text-red-700 dark:text-red-400 font-bold bg-red-50/50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                            ⚠️ تنبيه هام جداً: يرجى كتابة الرمز أو حفظه في مكان آمن (مثل تصوير الشاشة أو نسخه) فور ظهور رسالة النجاح، فلن تتمكن من الوصول للجواب بدونه لكونه سؤالاً سرياً وخاصاً لا ينشر للعامة.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name (Optional, only visible for public questions) */}
              {!isPrivate && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
                    الاسم <span className="text-[var(--color-text-muted)]">(اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.questioner_name}
                    onChange={(e) => setFormData({ ...formData, questioner_name: e.target.value })}
                    placeholder="يمكنك ترك هذا الحقل فارغاً"
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all"
                  />
                </div>
              )}

              {/* Email (Optional for public, Required for private-email) */}
              {(!isPrivate || (isPrivate && notificationMethod === "email")) && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
                    {isPrivate ? (
                      <>
                        البريد الإلكتروني الخاص بك <span className="text-red-400">*</span>
                      </>
                    ) : (
                      <>
                        البريد الإلكتروني <span className="text-[var(--color-text-muted)]">(اختياري - للتنبيه عند الإجابة)</span>
                      </>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required={isPrivate && notificationMethod === "email"}
                      value={formData.questioner_email}
                      onChange={(e) => setFormData({ ...formData, questioner_email: e.target.value })}
                      placeholder="example@email.com"
                      maxLength={255}
                      dir="ltr"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all text-left"
                    />
                    <Mail size={18} className="absolute right-3.5 top-3.5 text-[var(--color-text-muted)]" />
                  </div>
                </div>
              )}



              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
                  موضوع السؤال
                </label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all"
                >
                  <option value="">اختر الموضوع</option>
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
                  السؤال <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="اكتب سؤالك هنا بوضوح..."
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all resize-none"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1 text-left" dir="ltr">
                  {formData.question.length}/5000
                </p>
              </div>

              {/* Error Message */}
              {status === "error" && errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading" || formData.question.length < 10}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    إرسال السؤال
                  </>
                )}
              </button>
            </form>
          </ScrollReveal>
        )}
      </div>
    </PageTransition>
  );
}
