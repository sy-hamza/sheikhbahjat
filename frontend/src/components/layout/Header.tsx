"use client";

/**
 * Header Component
 * ================
 * Sticky navigation header with glassmorphism effect on scroll,
 * responsive mobile menu, and dark mode toggle.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  BookOpen,
  MessageCircleQuestion,
  FolderOpen,
  Music,
  Home,
  Moon,
  Sun,
  Video,
  Search,
} from "lucide-react";
import SearchModal from "@/components/layout/SearchModal";

const navLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/books", label: "الكتب", icon: BookOpen },
  { href: "/poems", label: "المنظومات", icon: Music },
  { href: "/videos", label: "المرئيات", icon: Video },
  { href: "/fatwa", label: "الفتاوى", icon: MessageCircleQuestion },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = usePathname();

  // Track scroll position for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set theme from local storage or default to dark on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const defaultTheme = savedTheme || "dark";
    setTheme(defaultTheme);
    
    if (defaultTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Site Name */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Decorative Islamic star icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg font-[var(--font-family-heading)]">ع</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] leading-tight">
                الشيخ عامر بهجت
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]">
                الأرشيف الرقمي
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] bg-[var(--color-accent)]/10"
                      : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:text-[var(--color-primary)] dark:hover:text-white hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-surface)]"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 right-2 left-2 h-0.5 bg-[var(--color-accent)] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-secondary)] dark:text-slate-300 transition-colors"
              aria-label="البحث في الموقع"
            >
              <Search size={18} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-secondary)] dark:text-slate-300 transition-colors"
              aria-label="تبديل المظهر"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-surface)] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? (
                <X size={24} className="text-[var(--color-primary)] dark:text-white" />
              ) : (
                <Menu size={24} className="text-[var(--color-primary)] dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors ${
                        isActive
                          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] font-medium"
                          : "text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-surface)]"
                      }`}
                    >
                      <Icon size={20} />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Modal Overlay */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
