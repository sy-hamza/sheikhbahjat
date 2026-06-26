"use client";

import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Award, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function BiographySection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--color-bg-warm)] to-[var(--color-bg-cream)]/40 dark:from-[var(--color-bg-dark)] dark:to-[var(--color-bg-dark-surface)]/40 text-right" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-4">
              نبذة عن فضيلة الشيخ
            </h2>
            <div className="w-24 h-1 bg-[var(--color-accent)] mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Callout Container */}
          <div className="lg:col-span-4 flex justify-center">
            <ScrollReveal delay={0.1}>
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] dark:from-[var(--color-bg-dark-surface)] dark:to-[var(--color-bg-dark-elevated)] text-white shadow-xl max-w-sm border border-white/5 relative overflow-hidden group">
                {/* Decorative Pattern overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,165,90,0.15),transparent)] pointer-events-none" />
                <div className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-[var(--color-accent)]/5 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                
                <div className="relative z-10 space-y-4 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center mx-auto shadow-inner text-4xl font-serif">
                    ع
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-[var(--font-family-heading)] text-[var(--color-accent-light)]">الشيخ د. عامر بهجت</h3>
                    <p className="text-xs text-white/60 mt-1">الأرشيف العلمي والتعليمي</p>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <p className="text-xs text-white/80 leading-relaxed font-serif italic">
                    "جهود مباركة متواصلة لتقريب المذهب الحنبلي وتبسيط العلوم الشرعية والقرآنية لطلاب العلم بكافة أرجاء العالم الإسلامي."
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Quick Biography details */}
          <div className="lg:col-span-8 space-y-6">
            <ScrollReveal delay={0.2}>
              <p className="text-base sm:text-lg text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] leading-relaxed mb-6 font-serif">
                هو فضيلة الشيخ الدكتور **عامر بن محمد فداء بن محمد عبد المعطي بهجت**. ولد بالمدينة المنورة وتلقى العلوم الشرعية على يد كبار العلماء والمسندين، ويشرف على منصات تأصيلية فقهية حنبلية متعددة، وله شرح للمتون العلمية يُدرّس في الأروقة الشرعية والمسجد النبوي الشريف.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScrollReveal delay={0.25}>
                <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/20 shadow-sm flex items-start gap-4 text-right">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">المؤهلات الأكاديمية</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">حاصل على الدكتوراه بتقدير ممتاز مع مرتبة الشرف الأولى في الفقه</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/20 shadow-sm flex items-start gap-4 text-right">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">التدريس بالمسجد النبوي</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">عضو هيئة تدريس بجامعة طيبة ومُدرِّس في المسجد النبوي الشريف</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.35}>
                <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/20 shadow-sm flex items-start gap-4 text-right">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 flex-shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">التصنيف والمنظومات</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">له العديد من المصنفات والمنظومات الفقهية المقررة لطلاب العلم</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/20 shadow-sm flex items-start gap-4 text-right">
                  <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500 flex-shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">تسهيل وتقريب الفقه</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">يُشرف على برامج تأصيلية ومعهد الإمام البهوتي للتفقه</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.45} className="pt-4 text-center sm:text-right">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white dark:bg-[var(--color-accent-dark)] dark:hover:bg-[var(--color-accent)] font-bold rounded-xl shadow-md transition-all hover:translate-x-[-4px]"
              >
                <span>اقرأ السيرة الذاتية الكاملة</span>
                <ArrowLeft size={16} />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
