"use client";

/**
 * HeroSection Component
 * =====================
 * Animated welcoming hero section with biography excerpt,
 * decorative Islamic pattern, and CTA buttons.
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, MessageCircleQuestion, ArrowDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pattern-bg">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-warm)] via-transparent to-[var(--color-bg-warm)] dark:from-[var(--color-bg-dark)] dark:via-transparent dark:to-[var(--color-bg-dark)]" />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[var(--color-accent)]/5 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[var(--color-secondary)]/5 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        {/* Bismillah */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[var(--color-accent)] font-[var(--font-family-heading)] text-2xl mb-6"
        >
          بسم الله الرحمن الرحيم
        </motion.p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-24 h-0.5 bg-gradient-to-l from-transparent via-[var(--color-accent)] to-transparent mx-auto mb-8"
        />

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-4"
        >
          الشيخ{" "}
          <span className="text-gold-gradient">عامر بهجت</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl sm:text-2xl text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] font-[var(--font-family-heading)] mb-8"
        >
          الأرشيف الرقمي والموقع الرسمي
        </motion.p>

        {/* Biography excerpt */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-2xl mx-auto text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] text-base sm:text-lg leading-relaxed mb-10"
        >
          مرحباً بكم في الموقع الرسمي للشيخ عامر بهجت. يضم هذا الأرشيف الرقمي مجموعة شاملة
          من الكتب والمنظومات والرسائل العلمية والفتاوى الشرعية. نسعى من خلال هذا الموقع
          إلى نشر العلم الشرعي وتيسير الوصول إليه لطلاب العلم في كل مكان.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/books"
            className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-xl text-base font-medium shadow-lg hover:shadow-xl hover:shadow-[var(--color-accent)]/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <BookOpen size={20} className="group-hover:scale-110 transition-transform" />
            تصفح المكتبة
          </Link>
          <Link
            href="/fatwa/submit"
            className="group flex items-center gap-2 px-8 py-3.5 border-2 border-[var(--color-primary)] dark:border-[var(--color-text-dark-secondary)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] rounded-xl text-base font-medium hover:bg-[var(--color-primary)] hover:text-white dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
          >
            <MessageCircleQuestion size={20} className="group-hover:scale-110 transition-transform" />
            اطرح سؤالك
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={24} className="text-[var(--color-accent)]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
