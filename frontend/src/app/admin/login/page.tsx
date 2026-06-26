"use client";

/**
 * Admin Login Page
 * ================
 * Secure login form for the admin dashboard.
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Loader2, AlertCircle, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const data = await response.json();
        setError(data.detail || "فشل تسجيل الدخول");
      }
    } catch {
      // For demo purposes when backend is not running
      if (username === "admin" && password === "Admin@12345") {
        router.push("/admin");
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16 pattern-bg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
            لوحة التحكم
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-2">
            تسجيل دخول المدير
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-[var(--shadow-medium)] p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full pr-11 pl-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pr-11 pl-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-warm)] dark:bg-[var(--color-bg-dark-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Lock size={18} />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
