"use client";

/**
 * LatestAdditions Component
 * =========================
 * Carousel showcasing the latest books, poems, and approved fatwas from the database.
 * Auto-plays with pause on hover. Uses Framer Motion for transitions.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Music, MessageCircleQuestion, Loader2 } from "lucide-react";
import Link from "next/link";
import { booksApi, poemsApi, fatwasApi } from "@/lib/api";

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  type: "book" | "poem" | "fatwa";
  link: string;
}

const typeIcons = {
  book: BookOpen,
  poem: Music,
  fatwa: MessageCircleQuestion,
};

const typeLabels = {
  book: "كتاب جديد",
  poem: "منظومة جديدة",
  fatwa: "فتوى جديدة",
};

const typeColors = {
  book: "from-[var(--color-primary)] to-[var(--color-primary-light)]",
  poem: "from-[var(--color-secondary)] to-[var(--color-secondary-light)]",
  fatwa: "from-[var(--color-accent-dark)] to-[var(--color-accent)]",
};

export default function LatestAdditions() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const next = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-play
  useEffect(() => {
    if (isPaused || items.length === 0) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, next, items.length]);

  // Load latest additions on mount
  useEffect(() => {
    async function loadLatest() {
      setIsLoading(true);
      try {
        const [books, poems, fatwas] = await Promise.all([
          booksApi.getLatest(3),
          poemsApi.getLatest(3),
          fatwasApi.getApproved({ limit: 3 }),
        ]);

        const merged: CarouselItem[] = [];

        books.forEach((b) => {
          merged.push({
            id: b.id,
            title: b.title,
            description: b.description || "كتاب علمي جديد من مؤلفات فضيلة الشيخ عامر بهجت.",
            type: "book",
            link: "/books",
          });
        });

        poems.forEach((p) => {
          merged.push({
            id: p.id,
            title: p.title,
            description: p.description || "منظومة شعرية علمية ميسرة جديدة للشيخ عامر بهجت.",
            type: "poem",
            link: "/poems",
          });
        });

        fatwas.forEach((f) => {
          merged.push({
            id: f.id,
            title: f.question,
            description: f.answer || "إجابة فقهية جديدة معتمدة من فتاوى الشيخ.",
            type: "fatwa",
            link: "/fatwa",
          });
        });

        // Limit the carousel to show up to 6 items total
        setItems(merged.slice(0, 6));
      } catch (err) {
        console.error("Failed to load latest additions", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLatest();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 size={32} className="text-[var(--color-accent)] animate-spin mb-4" />
          <p className="text-[var(--color-text-secondary)] text-sm">جاري تحميل أحدث الإضافات...</p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null; // Don't show carousel if no items exist
  }

  const currentItem = items[currentIndex];
  const Icon = typeIcons[currentItem.type];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
            أحدث الإضافات العلمية
          </h2>
          <div className="divider-ornament">
            <span className="text-[var(--color-accent)] text-sm">✦</span>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] shadow-[var(--shadow-medium)] min-h-[220px] border border-[var(--color-border)]/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="p-8 sm:p-10 flex flex-col sm:flex-row-reverse items-start gap-6"
              >
                {/* Icon Badge */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${typeColors[currentItem.type]} flex items-center justify-center shadow-md mx-auto sm:mx-0`}>
                  <Icon size={24} className="text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 text-right w-full">
                  <div className="flex items-center gap-2 mb-2 flex-row-reverse justify-end">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] font-bold">
                      {typeLabels[currentItem.type]}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-3 leading-snug">
                    {currentItem.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] leading-relaxed mb-4 text-sm line-clamp-3">
                    {currentItem.description}
                  </p>
                  <Link
                    href={currentItem.link}
                    className="inline-flex items-center gap-1 text-sm text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] hover:text-[var(--color-accent)] font-semibold transition-colors flex-row-reverse"
                  >
                    عرض المزيد
                    <ChevronLeft size={14} className="mr-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-5 w-10 h-10 rounded-full bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-elevated)] shadow-md flex items-center justify-center hover:bg-[var(--color-accent)] hover:text-white transition-all group border border-[var(--color-border)]/20"
            aria-label="التالي"
          >
            <ChevronLeft size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={prev}
            className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-5 w-10 h-10 rounded-full bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-elevated)] shadow-md flex items-center justify-center hover:bg-[var(--color-accent)] hover:text-white transition-all group border border-[var(--color-border)]/20"
            aria-label="السابق"
          >
            <ChevronRight size={18} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-row-reverse">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-[var(--color-accent)]"
                    : "w-2 bg-[var(--color-border)] dark:bg-[var(--color-border-dark)] hover:bg-[var(--color-accent)]/50"
                }`}
                aria-label={`الشريحة ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
