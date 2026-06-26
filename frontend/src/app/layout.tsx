import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AudioProvider } from "@/context/AudioContext";
import FloatingAudioPlayer from "@/components/ui/FloatingAudioPlayer";

/* ─── SEO Metadata ─────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "الشيخ عامر بهجت | الموقع الرسمي والأرشيف الرقمي",
    template: "%s | الشيخ عامر بهجت",
  },
  description:
    "الموقع الرسمي والأرشيف الرقمي للشيخ عامر بهجت. يضم مجموعة شاملة من الكتب والمنظومات والرسائل العلمية والفتاوى الشرعية.",
  keywords: [
    "الشيخ عامر بهجت",
    "كتب إسلامية",
    "فتاوى",
    "منظومات",
    "أرشيف رقمي",
    "علوم شرعية",
  ],
  authors: [{ name: "الشيخ عامر بهجت" }],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "الشيخ عامر بهجت",
    title: "الشيخ عامر بهجت | الموقع الرسمي والأرشيف الرقمي",
    description:
      "الموقع الرسمي والأرشيف الرقمي للشيخ عامر بهجت - كتب، منظومات، فتاوى",
  },
};

/* ─── Root Layout ──────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <AudioProvider>
          {/* Navigation Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <Footer />

          {/* Persistent Floating Audio Player */}
          <FloatingAudioPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
