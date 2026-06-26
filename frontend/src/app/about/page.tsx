"use client";

import PageTransition from "@/components/layout/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { GraduationCap, Award, BookOpen, Music, Users, ChevronLeft, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

const timeline = [
  {
    year: "1404 هـ",
    title: "الميلاد والنشأة",
    description: "ولد في المدينة المنورة وبدأ نشأته العلمية وحفظ كتاب الله في حلقات القرآن الكريم بالمدينة النبوية.",
  },
  {
    year: "بكالوريوس",
    title: "كلية الشريعة",
    description: "تخرج وحصل على البكالوريوس في الشريعة من جامعة الإمام محمد بن سعود الإسلامية.",
  },
  {
    year: "ماجستير",
    title: "الفقه المقارن",
    description: "حصل على درجة الماجستير في الفقه المقارن بتقدير ممتاز من المعهد العالي للقضاء (جامعة الإمام).",
  },
  {
    year: "دكتوراه",
    title: "أعلى الدرجات العلمية",
    description: "حصل على شهادة الدكتوراه في الفقه بتقدير ممتاز مع مرتبة الشرف الأولى من الجامعة الإسلامية بالمدينة المنورة.",
  },
];

const teachers = [
  { name: "فضيلة الشيخ عبد الله بن عبد العزيز العقيل", role: "رئيس الهيئة الدائمة بمجلس القضاء الأعلى سابقاً" },
  { name: "فضيلة الشيخ د. عبد الله بن عبد الرحمن بن جبرين", role: "عضو الإفتاء واللجنة الدائمة سابقاً" },
  { name: "معالي الشيخ د. صالح بن فوزان الفوزان", role: "عضو هيئة كبار العلماء واللجنة الدائمة للإفتاء" },
  { name: "جمع من العلماء والمسندين", role: "حاصل على إجازات علمية متعددة في رواية متون الحديث والفقه" },
];

const books = [
  { title: "النظم البين في الفقه المتعين", category: "فقه حنبلي" },
  { title: "الأسئلة والإجابات على متن أخصر المختصرات", category: "شروح فقهية" },
  { title: "التدريبات على الورقات في أصول الفقه", category: "أصول الفقه" },
  { title: "الجمع البهي لمنظومات الفقه الحنبلي", category: "منظومات" },
  { title: "الاحمرار الحنبلي على نظم الورقات", category: "أصول الفقه" },
  { title: "الأساس في المعاملات الجارية بين الناس", category: "معاملات ونظم" },
  { title: "منظومة المقادير الشرعية بالوحدات المعاصرة", category: "مقادير" },
  { title: "النظم الأصغر في الفقه", category: "منظومات فقهية" },
  { title: "الإختلاط بين الجنسين في ضوء الكتاب والسنة", category: "أبحاث اجتماعية" },
  { title: "نظم التوحيد والإيمان", category: "عقيدة" },
  { title: "التمارين الأصولية على مفتاح الوصول", category: "أصول الفقه" },
];

export default function AboutPage() {
  return (
    <PageTransition className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-16 relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white flex items-center justify-center mx-auto mb-6 shadow-xl text-3xl font-serif">
              ع
            </div>
            <h1 className="text-4xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-white mb-4">
              السيرة العلمية للشيخ د. عامر بهجت
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] max-w-2xl mx-auto leading-relaxed">
              عضو هيئة التدريس بجامعة طيبة بالمدينة المنورة والمدرس بالمسجد النبوي الشريف والمشرف العلمي على برامج تيسير وتقريب الفقه الحنبلي.
            </p>
          </div>
        </ScrollReveal>

        {/* Section: Academic Timeline */}
        <div className="mb-20">
          <ScrollReveal>
            <h2 className="text-2xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-white mb-8 border-r-4 border-[var(--color-accent)] pr-4">
              المسيرة الدراسية والأكاديمية
            </h2>
          </ScrollReveal>

          <div className="relative border-r border-gray-200 dark:border-gray-800 mr-4 space-y-10">
            {timeline.map((item, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="relative pr-8">
                  {/* Timeline bullet */}
                  <span className="absolute -right-2 top-1.5 w-4 h-4 rounded-full bg-[var(--color-accent)] border-4 border-white dark:border-[var(--color-bg-dark)] shadow-md" />
                  
                  <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/20 shadow-sm">
                    <span className="inline-block px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] text-xs font-bold rounded-lg mb-2">
                      {item.year}
                    </span>
                    <h3 className="font-bold text-lg text-[var(--color-primary)] dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Section: Teachers (Shaykhs) */}
        <div className="mb-20">
          <ScrollReveal>
            <h2 className="text-2xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-white mb-8 border-r-4 border-[var(--color-accent)] pr-4">
              من مشايخه وأساتذته
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teachers.map((teacher, index) => (
              <ScrollReveal key={index} delay={index * 0.05}>
                <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/20 shadow-sm flex gap-4 text-right items-start">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white flex items-center justify-center flex-shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-primary)] dark:text-white">{teacher.name}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] mt-1">{teacher.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Section: Academic Roles */}
        <div className="mb-20">
          <ScrollReveal>
            <h2 className="text-2xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-white mb-8 border-r-4 border-[var(--color-accent)] pr-4">
              النشاط والمهام العلمية
            </h2>
          </ScrollReveal>

          <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/20 shadow-sm space-y-4">
            <div className="flex items-start gap-4 text-right">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award size={16} />
              </div>
              <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] leading-relaxed">
                عضو هيئة تدريس دائم في **جامعة طيبة بالمدينة المنورة** لتدريس الفقه وأصوله لطلبة الدراسات الجامعية والعليا.
              </p>
            </div>
            
            <div className="flex items-start gap-4 text-right">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award size={16} />
              </div>
              <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] leading-relaxed">
                التدريس والشروحات الفقهية المقررة بالمسجد النبوي الشريف لطلاب العلم والزوار والوافدين.
              </p>
            </div>

            <div className="flex items-start gap-4 text-right">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award size={16} />
              </div>
              <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] leading-relaxed">
                الإشراف العلمي والتربوي على **معهد الإمام البهوتي للتفقه الحنبلي** المعني بنشر الفقه الحنبلي وتقريبه بصورة منهجية ميسرة للطلاب.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Publications Grid */}
        <div className="mb-16">
          <ScrollReveal>
            <h2 className="text-2xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-white mb-8 border-r-4 border-[var(--color-accent)] pr-4">
              من مؤلفاته ومصنفاته العلمية
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.map((book, index) => (
              <ScrollReveal key={index} delay={index * 0.05}>
                <div className="p-4 rounded-xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] border border-[var(--color-border)]/20 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] flex items-center justify-center">
                      <BookOpen size={16} />
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)] dark:text-white group-hover:text-[var(--color-accent-dark)] dark:group-hover:text-[var(--color-accent-light)] transition-colors">{book.title}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] rounded font-medium">
                    {book.category}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Quick Links back to Archive */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8 border-t border-[var(--color-border)]/20">
            <Link
              href="/books"
              className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white font-bold rounded-xl shadow-md transition-all text-center w-full sm:w-auto"
            >
              تصفح كتب الأرشيف
            </Link>
            <Link
              href="/poems"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all text-center w-full sm:w-auto"
            >
              استمع للمنظومات العلمية
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </PageTransition>
  );
}
