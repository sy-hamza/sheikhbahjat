/**
 * Footer Component
 * ================
 * Elegant footer with quick links, social icons, and decorative elements.
 */

import Link from "next/link";
import { BookOpen, MessageCircleQuestion, FolderOpen, Music, Heart } from "lucide-react";

const footerLinks = [
  { href: "/books", label: "الكتب والرسائل", icon: BookOpen },
  { href: "/poems", label: "المنظومات", icon: Music },
  { href: "/fatwa", label: "الفتاوى", icon: MessageCircleQuestion },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-[var(--color-primary)] dark:bg-[var(--color-bg-dark-surface)] text-white overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-l from-transparent via-[var(--color-accent)] to-transparent" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">ع</span>
              </div>
              <div>
                <h3 className="text-lg font-bold font-[var(--font-family-heading)]">الشيخ عامر بهجت</h3>
                <p className="text-sm text-gray-400">الأرشيف الرقمي الرسمي</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              منصة رقمية شاملة تضم مؤلفات الشيخ عامر بهجت من كتب ومنظومات ورسائل علمية وفتاوى شرعية، 
              بهدف نشر العلم الشرعي وتيسير الوصول إليه.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold font-[var(--font-family-heading)] mb-4 text-[var(--color-accent)]">
              روابط سريعة
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-gray-300 hover:text-[var(--color-accent)] transition-colors text-sm py-1"
                    >
                      <Icon size={14} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact / Submit Question */}
          <div>
            <h3 className="text-lg font-bold font-[var(--font-family-heading)] mb-4 text-[var(--color-accent)]">
              تواصل معنا
            </h3>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              لديك سؤال شرعي؟ يمكنك إرسال سؤالك مباشرة من خلال بوابة الفتاوى.
            </p>
            <Link
              href="/fatwa/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-300"
            >
              <MessageCircleQuestion size={16} />
              أرسل سؤالك
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            جميع الحقوق محفوظة © {new Date().getFullYear()} — الموقع الرسمي للشيخ عامر بهجت
          </p>
          <p className="text-gray-500 text-xs flex items-center gap-1">
            صُنع بـ <Heart size={12} className="text-red-400 fill-red-400" /> لخدمة العلم الشرعي
          </p>
        </div>
      </div>
    </footer>
  );
}
