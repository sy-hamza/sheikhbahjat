"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Play, Search, X, Loader2, Video as VideoIcon, Youtube, ExternalLink } from "lucide-react";
import { videosApi, Video } from "@/lib/api";

function VideoLightbox({ video, onClose }: { video: Video; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden text-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Aspect Ratio Container for Responsive Video */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>

        {/* Video Info Footer */}
        <div className="p-6 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-row-reverse justify-end">
              <h2 className="text-xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
                {video.title}
              </h2>
              {video.category_name && (
                <span className="text-xs px-2.5 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] rounded-full font-semibold">
                  {video.category_name}
                </span>
              )}
            </div>
            {video.description && (
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] leading-relaxed">
                {video.description}
              </p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="md:self-center px-6 py-2.5 bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] hover:bg-red-500/10 hover:text-red-500 rounded-xl font-semibold transition-all duration-200 text-center flex items-center justify-center gap-2 self-end"
          >
            <X size={18} />
            إغلاق المشغل
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function loadVideos() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await videosApi.getAll();
        setVideos(data);

        // Support direct linking via URL query parameters (?id=12)
        const params = new URLSearchParams(window.location.search);
        const videoId = params.get("id");
        if (videoId && data.length > 0) {
          const matched = data.find((v) => v.id === Number(videoId));
          if (matched) {
            setSelectedVideo(matched);
          }
        }
      } catch (err: any) {
        setError("فشل تحميل قائمة الفيديوهات. يرجى التأكد من تشغيل الخادم.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadVideos();
  }, []);

  // Dynamically extract categories that actually have videos
  const activeCategories = Array.from(
    new Set(videos.map((v) => v.category_name).filter(Boolean))
  ) as string[];

  // Filter videos based on category and search query
  const filteredVideos = videos.filter((v) => {
    const matchesCategory =
      selectedCategory === "all" || v.category_name === selectedCategory;
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <VideoIcon size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] mb-3">
              المرئيات
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] max-w-lg mx-auto">
              شاهد المحاضرات والدروس العلمية للشيخ عامر بهجت مباشرة من اليوتيوب دون مغادرة الموقع
            </p>
          </div>
        </ScrollReveal>

        {/* Search & Filters */}
        <div className="space-y-6 mb-10">
          <ScrollReveal delay={0.1}>
            <div className="relative max-w-md mx-auto text-right" dir="rtl">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="ابحث عن مقطع مرئي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-11 pl-4 py-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] text-[var(--color-text-primary)] dark:text-[var(--color-text-dark-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 transition-all text-sm text-right"
                dir="rtl"
              />
            </div>
          </ScrollReveal>

          {/* Categories Tab Selector */}
          {activeCategories.length > 0 && (
            <ScrollReveal delay={0.15}>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center scrollbar-none flex-row-reverse" dir="rtl">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
                    selectedCategory === "all"
                      ? "text-white"
                      : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)]"
                  }`}
                >
                  {selectedCategory === "all" && (
                    <motion.div
                      layoutId="activeVideoCategory"
                      className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] rounded-xl -z-10 shadow-md"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  الكل
                </button>
                {activeCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
                      selectedCategory === cat
                        ? "text-white"
                        : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-elevated)]"
                    }`}
                  >
                    {selectedCategory === cat && (
                      <motion.div
                        layoutId="activeVideoCategory"
                        className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] rounded-xl -z-10 shadow-md"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {cat}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>

        {/* Pinned YouTube Channel Banner */}
        <ScrollReveal delay={0.2}>
          <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-l from-red-600/10 via-red-600/5 to-transparent border border-red-500/20 dark:border-red-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-right">
            {/* Background Decorative YouTube Icon */}
            <Youtube size={180} className="absolute -left-10 -bottom-10 text-red-600/[0.03] dark:text-red-500/[0.05] pointer-events-none -rotate-12" />
            
            <div className="flex items-center gap-4 sm:gap-6 flex-col sm:flex-row-reverse text-center sm:text-right">
              <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20 flex-shrink-0 animate-pulse">
                <Youtube size={36} className="fill-current" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-[var(--font-family-heading)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] flex items-center gap-2 justify-center sm:justify-start flex-row-reverse">
                  <span>القناة الرسمية للشيخ د. عامر بهجت</span>
                  <span className="text-[10px] px-2 py-0.5 bg-red-600/10 text-red-600 dark:text-red-400 rounded-full font-medium border border-red-600/20">مثبتة</span>
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] max-w-xl">
                  اشترك في القناة الرسمية على اليوتيوب لمتابعة الدروس العلمية والمحاضرات والمنظومات فور نزولها وتفعيل التنبيهات.
                </p>
              </div>
            </div>

            <a
              href="https://www.youtube.com/@AmerBahjat/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-red-600/20 hover:scale-[1.02] transition-all duration-300 flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <ExternalLink size={18} />
              <span>زيارة قناة اليوتيوب</span>
            </a>
          </div>
        </ScrollReveal>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={36} className="text-[var(--color-accent)] animate-spin" />
          </div>
        ) : (
          <>
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos.map((video, index) => (
                  <ScrollReveal key={video.id} delay={index * 0.05}>
                    <div
                      onClick={() => setSelectedVideo(video)}
                      className="group cursor-pointer bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)]/40 dark:border-[var(--color-border-dark)]/40 hover:border-[var(--color-accent)]/50 transition-all duration-300 hover:shadow-xl flex flex-col h-full text-right"
                    >
                      {/* Image Thumbnail with Overlay Play Button */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-[var(--color-accent)] text-[var(--color-primary)] group-hover:text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                            <Play size={24} className="fill-current translate-x-[-1px]" />
                          </div>
                        </div>
                      </div>

                      {/* Video Content details */}
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              {video.created_at ? new Date(video.created_at).toLocaleDateString("ar-SA") : ""}
                            </span>
                            {video.category_name && (
                              <span className="text-xs px-2.5 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)] dark:text-[var(--color-accent-light)] rounded-full font-medium">
                                {video.category_name}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] line-clamp-2 leading-snug group-hover:text-[var(--color-accent-dark)] dark:group-hover:text-[var(--color-accent-light)] transition-colors">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)] line-clamp-2 leading-relaxed">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-surface)] rounded-2xl border border-[var(--color-border)]/20 p-6">
                <VideoIcon size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">لم يتم العثور على أي مقاطع فيديو مطابقة</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Lightbox Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoLightbox video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
