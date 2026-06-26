"use client";

/**
 * BookCard Component
 * ==================
 * 3D-looking book card with hover effects (scale up + shadow increase).
 */

import { motion } from "framer-motion";
import { BookOpen, Download, Eye } from "lucide-react";

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  description?: string;
  category_name?: string;
  page_count?: number;
  publish_year?: string;
  is_featured?: boolean;
  cover_image?: string;
  onView?: () => void;
}

// Gradient colors for book covers (cycled based on index)
const coverGradients = [
  "from-[#1B2A4A] to-[#2A3F6E]",
  "from-[#2D5A3D] to-[#3D7A52]",
  "from-[#6B3FA0] to-[#8B5FD0]",
  "from-[#8B4513] to-[#A0522D]",
  "from-[#1A4A5A] to-[#2A6A7E]",
  "from-[#4A1A3D] to-[#6E2A5A]",
];

export default function BookCard({
  id,
  title,
  author,
  description,
  category_name,
  page_count,
  publish_year,
  is_featured,
  cover_image,
  onView,
}: BookCardProps) {
  const gradient = coverGradients[id % coverGradients.length];

  return (
    <motion.div
      className="book-3d cursor-pointer group"
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onView}
    >
      <div className="book-3d-inner relative">
        {/* Book Cover */}
        <div className={`relative aspect-[3/4] rounded-xl shadow-[var(--shadow-medium)] group-hover:shadow-[var(--shadow-heavy)] overflow-hidden transition-shadow duration-300 bg-gradient-to-br ${gradient}`}>
          {cover_image ? (
            <>
              <img
                src={cover_image}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Featured badge */}
              {is_featured && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium shadow-sm z-10">
                  مميز
                </div>
              )}
            </>
          ) : (
            <>
              {/* Decorative pattern */}
              <div className="absolute inset-0 pattern-bg opacity-10" />

              {/* Featured badge */}
              {is_featured && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium shadow-sm">
                  مميز
                </div>
              )}

              {/* Book content overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
                {/* Decorative top border */}
                <div className="w-12 h-0.5 bg-[var(--color-accent)]/60 mb-4 rounded-full" />

                <h3 className="text-lg font-bold font-[var(--font-family-heading)] leading-tight mb-2">
                  {title}
                </h3>
                <p className="text-sm text-white/70">{author}</p>

                {/* Decorative bottom border */}
                <div className="w-8 h-0.5 bg-[var(--color-accent)]/40 mt-4 rounded-full" />

                {publish_year && (
                  <p className="text-xs text-white/50 mt-3">{publish_year} هـ</p>
                )}
              </div>
            </>
          )}

          {/* Spine effect */}
          <div className="absolute right-0 top-0 w-3 h-full bg-black/20 rounded-r-xl z-10" />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Eye size={18} className="text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Download size={18} className="text-white" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Book Info Below */}
        <div className="mt-3 px-1">
          <h4 className="font-bold text-sm text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)] line-clamp-1 group-hover:text-[var(--color-accent-dark)] dark:group-hover:text-[var(--color-accent-light)] transition-colors">
            {title}
          </h4>
          {category_name && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{category_name}</p>
          )}
          {page_count && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1">
              <BookOpen size={10} />
              {page_count} صفحة
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
