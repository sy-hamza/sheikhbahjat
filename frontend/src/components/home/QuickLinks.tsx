"use client";

/**
 * QuickLinks Component
 * ====================
 * Animated grid of quick navigation cards to main sections.
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, FolderOpen, Music, MessageCircleQuestion, GraduationCap, Search } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const quickLinks = [
  {
    href: "/books",
    icon: BookOpen,
    title: "الكتب والرسائل",
    description: "مؤلفات الشيخ من كتب ورسائل علمية وشروحات",
    gradient: "from-[#2D5A3D] to-[#3D7A52]",
  },
  {
    href: "/poems",
    icon: Music,
    title: "المنظومات",
    description: "المنظومات الشعرية مع إمكانية الاستماع للتلاوة",
    gradient: "from-[#6B3FA0] to-[#8B5FD0]",
  },
  {
    href: "/fatwa",
    icon: MessageCircleQuestion,
    title: "الفتاوى والأسئلة",
    description: "تصفح الفتاوى المنشورة أو أرسل سؤالك",
    gradient: "from-[#A6633E] to-[#C5834E]",
  },
];


export default function QuickLinks() {
  return (
    <>
      {/* Quick Links Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
                استكشف المحتوى
              </h2>
              <div className="divider-ornament">
                <span className="text-[var(--color-accent)] text-sm">✦</span>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <ScrollReveal key={link.href} delay={index * 0.1}>
                  <Link href={link.href} className="block group">
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-shadow duration-300 p-6 h-full"
                    >
                      {/* Gradient icon background */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                        <Icon size={22} className="text-white" />
                      </div>

                      <h3 className="text-lg font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-2">
                        {link.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] leading-relaxed">
                        {link.description}
                      </p>

                      {/* Hover accent line */}
                      <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-l from-transparent via-[var(--color-accent)] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </motion.div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-primary-light)] dark:from-[var(--color-bg-dark-surface)] dark:to-[var(--color-bg-dark-elevated)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none pattern-bg" />
        <div className="max-w-4xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-[var(--font-family-heading)] text-[var(--color-accent)] mb-3">
                نبذة عن فضيلة الشيخ
              </h2>
              <p className="text-lg font-[var(--font-family-heading)] max-w-2xl mx-auto leading-relaxed text-gray-300">
                الشيخ الدكتور عامر بن محمد فداء بهجت
              </p>
              <div className="w-16 h-0.5 bg-[var(--color-accent)] mx-auto mt-4 opacity-50" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
            <ScrollReveal delay={0.1} direction="right">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <GraduationCap className="text-[var(--color-accent)]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[var(--font-family-heading)] mb-1 text-[var(--color-accent)]">التحصيل الأكاديمي</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      حاصل على شهادة الدكتوراه في الفقه من الجامعة الإسلامية بالمدينة المنورة بتقدير ممتاز مع مرتبة الشرف الأولى، والماجستير في الفقه المقارن من المعهد العالي للقضاء بالرياض.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <FolderOpen className="text-[var(--color-accent)]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[var(--font-family-heading)] mb-1 text-[var(--color-accent)]">النشاط التدريسي والعملي</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      عضو هيئة التدريس بجامعة طيبة بالمدينة المنورة، ويشرف على منصات تعليمية رائدة لخدمة طلاب العلم الشرعي، أبرزها معهد الإمام البهوتي للتفقه الحنبلي.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="left">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <BookOpen className="text-[var(--color-accent)]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[var(--font-family-heading)] mb-1 text-[var(--color-accent)]">النتاج العلمي والمنظومات</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      له مؤلفات ونظم فقهية متميزة تُعنى بتقريب المسائل وتيسيرها لطلاب العلم، مثل "النظم الجلي في الفقه الحنبلي" و"النظم البين في الفقه المتعين" و"فقه النوازل".
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <Search className="text-[var(--color-accent)]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-[var(--font-family-heading)] mb-1 text-[var(--color-accent)]">شيوخه وإجازاته</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      تتلمذ على يد نخبة من كبار العلماء، منهم الشيخ عبد الله بن عبد العزيز العقيل والشيخ صالح الفوزان، وحاصل على إجازات علمية معتمدة ومسندة في أمهات كتب الحديث والسنة.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
