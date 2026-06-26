"use client";

/**
 * Admin Layout
 * ============
 * Protected layout wrapper for admin pages with sidebar navigation.
 */

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageCircleQuestion,
  BookOpen,
  Music,
  FolderOpen,
  LogOut,
  Shield,
  Loader2,
  Video,
} from "lucide-react";
import { authApi } from "@/lib/api";

const sidebarLinks = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/fatwas", label: "إدارة الفتاوى", icon: MessageCircleQuestion },
  { href: "/admin/books", label: "إدارة الكتب", icon: BookOpen },
  { href: "/admin/poems", label: "إدارة المنظومات", icon: Music },
  { href: "/admin/videos", label: "إدارة المرئيات", icon: Video },
  { href: "/admin/categories", label: "إدارة المجلدات", icon: FolderOpen },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      return;
    }

    const verifyAuth = async () => {
      try {
        await authApi.me();
        setCheckingAuth(false);
      } catch (err) {
        // Redirect to login page if unauthorized
        router.push("/admin/login");
      }
    };

    verifyAuth();
  }, [pathname, router]);

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex flex-col items-center justify-center text-right" dir="rtl">
        <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin mb-4" />
        <p className="text-[var(--color-text-dark-secondary)] text-sm font-medium">جاري التحقق من الهوية...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex pt-20">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border-l border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-4 flex flex-col fixed right-0 top-20 bottom-0 z-40">
        {/* Admin header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">لوحة التحكم</p>
            <p className="text-xs text-[var(--color-text-muted)]">المدير</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] border-r-2 border-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)]"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-2"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </Link>
      </aside>

      {/* Main content */}
      <div className="flex-1 mr-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
