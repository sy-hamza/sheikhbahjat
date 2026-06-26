"use client";

/**
 * FolderTree Component
 * ====================
 * Hierarchical folder structure with smooth expand/collapse animations.
 * Supports nested categories with icons and item counts.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Folder, FolderOpen,
  BookOpen, Music, Shield, Scale,
  Compass, BookMarked, ScrollText, PenTool, Clock,
} from "lucide-react";
import Link from "next/link";

interface CategoryNode {
  id: number;
  name: string;
  icon?: string;
  children?: CategoryNode[];
  book_count?: number;
  poem_count?: number;
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  scale: Scale,
  compass: Compass,
  "book-open": BookMarked,
  scroll: ScrollText,
  "pen-tool": PenTool,
  clock: Clock,
  music: Music,
};

// Sample data (will be replaced with API data)
const sampleCategories: CategoryNode[] = [
  { id: 1, name: "العقيدة", icon: "shield", children: [
    { id: 10, name: "التوحيد", book_count: 3, poem_count: 1 },
    { id: 11, name: "الأسماء والصفات", book_count: 1 },
    { id: 12, name: "الإيمان والكفر", book_count: 2 },
  ]},
  { id: 2, name: "الفقه", icon: "scale", children: [
    { id: 20, name: "فقه العبادات", book_count: 4, poem_count: 2 },
    { id: 21, name: "فقه المعاملات", book_count: 2 },
    { id: 22, name: "فقه الأسرة", book_count: 1 },
    { id: 23, name: "فقه الجنايات" },
  ]},
  { id: 3, name: "أصول الفقه", icon: "compass", children: [
    { id: 30, name: "القواعد الأصولية", book_count: 2 },
    { id: 31, name: "مباحث الأدلة", book_count: 1 },
  ]},
  { id: 4, name: "علوم القرآن", icon: "book-open", children: [
    { id: 40, name: "التفسير", book_count: 2 },
    { id: 41, name: "علوم القرآن", book_count: 1 },
    { id: 42, name: "القراءات" },
  ]},
  { id: 5, name: "الحديث وعلومه", icon: "scroll", children: [
    { id: 50, name: "شرح الأحاديث", book_count: 3 },
    { id: 51, name: "مصطلح الحديث", book_count: 1 },
    { id: 52, name: "تخريج الأحاديث" },
  ]},
  { id: 6, name: "اللغة العربية", icon: "pen-tool", children: [
    { id: 60, name: "النحو", book_count: 2, poem_count: 1 },
    { id: 61, name: "الصرف", book_count: 1 },
    { id: 62, name: "البلاغة" },
  ]},
  { id: 7, name: "المنظومات", icon: "music", children: [
    { id: 70, name: "منظومات في العقيدة", poem_count: 3 },
    { id: 71, name: "منظومات في الفقه", poem_count: 2 },
    { id: 72, name: "منظومات في النحو", poem_count: 2 },
  ]},
  { id: 8, name: "السيرة والتاريخ", icon: "clock", book_count: 2 },
];

function FolderItem({ category, depth = 0 }: { category: CategoryNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const IconComponent = category.icon ? iconMap[category.icon] || Folder : Folder;
  const totalItems = (category.book_count || 0) + (category.poem_count || 0);

  return (
    <div>
      {/* Folder Header */}
      <motion.button
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-200
          ${isOpen
            ? "bg-[var(--color-accent)]/10 dark:bg-[var(--color-accent)]/5"
            : "hover:bg-[var(--color-bg-cream)] dark:hover:bg-[var(--color-bg-dark-surface)]"
          }
          ${depth > 0 ? "mr-6" : ""}
        `}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Expand icon */}
        {hasChildren && (
          <motion.div
            animate={{ rotate: isOpen ? -90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft size={16} className="text-[var(--color-text-muted)]" />
          </motion.div>
        )}
        {!hasChildren && <div className="w-4" />}

        {/* Folder icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isOpen
            ? "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white shadow-sm"
            : "bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]"
        }`}>
          {isOpen && hasChildren ? (
            <FolderOpen size={18} />
          ) : (
            <IconComponent size={18} />
          )}
        </div>

        {/* Name and count */}
        <span className="flex-1 font-medium text-[var(--color-primary)] dark:text-[var(--color-text-dark-primary)]">
          {category.name}
        </span>

        {totalItems > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-cream)] dark:bg-[var(--color-bg-dark-elevated)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-dark-secondary)]">
            {totalItems}
          </span>
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-r-2 border-[var(--color-accent)]/20 mr-6 pr-2"
          >
            {category.children!.map((child) => (
              <FolderItem key={child.id} category={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FolderTree() {
  return (
    <div className="space-y-1">
      {sampleCategories.map((category) => (
        <FolderItem key={category.id} category={category} />
      ))}
    </div>
  );
}
