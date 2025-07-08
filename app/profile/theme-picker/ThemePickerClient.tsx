"use client";
import React, { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

// Brand colors that should always be preserved for critical elements
const BRAND_COLORS = {
  primary: "#FF6B6B",
  accent: "#6BCEF5",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

type ThemeOption = {
  name: string;
  isOfficial: boolean;
  preview: Record<string, string>;
};

type ThemeCategory = {
  name: string;
  themes: ThemeOption[];
};

const themeCategories: Record<string, ThemeCategory> = {
  xpeakOfficial: {
    name: "Xpeak Official",
    themes: [
      {
        name: "Classic",
        isOfficial: true,
        preview: {
          "--color-primary": "#FF6B6B",
          "--color-accent": "#6BCEF5",
          "--color-bg": "#FDFDFD",
          "--color-surface": "#f9fafb",
          "--color-text-primary": "#1f2937",
          "--color-text-secondary": "#6b7280",
          "--color-border": "#e5e7eb",
          // Status colors (brand-consistent)
          "--color-success": "#10b981",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e0b",
          "--color-info": "#3b82f6",
          // Interactive states
          "--color-primary-hover": "#e55a5a",
          "--color-accent-hover": "#5ab8d4",
          "--color-surface-hover": "#f3f4f6",
          // Accessibility & contrast
          "--color-text-muted": "#9ca3af",
          "--color-overlay": "rgba(0, 0, 0, 0.5)",
          "--color-shadow": "rgba(0, 0, 0, 0.1)",
          // Dark mode support
          "--color-bg-dark": "#1f2937",
          "--color-surface-dark": "#374151",
        },
      },
      {
        name: "Ocean Breeze",
        isOfficial: true,
        preview: {
          "--color-primary": "#FF6B6B", // Brand primary preserved
          "--color-accent": "#6BCEF5", // Brand accent preserved
          "--color-bg": "#f0f9ff",
          "--color-surface": "#e0f2fe",
          "--color-text-primary": "#0f172a",
          "--color-text-secondary": "#475569",
          "--color-border": "#bae6fd",
          // Status colors (brand-consistent)
          "--color-success": "#10b981",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e0b",
          "--color-info": "#3b82f6",
          // Interactive states
          "--color-primary-hover": "#e55a5a",
          "--color-accent-hover": "#5ab8d4",
          "--color-surface-hover": "#bae6fd",
          // Accessibility & contrast
          "--color-text-muted": "#64748b",
          "--color-overlay": "rgba(15, 23, 42, 0.5)",
          "--color-shadow": "rgba(30, 64, 175, 0.1)",
          // Dark mode support
          "--color-bg-dark": "#0f172a",
          "--color-surface-dark": "#1e293b",
        },
      },
      {
        name: "Warm Sunset",
        isOfficial: true,
        preview: {
          "--color-primary": "#FF6B6B", // Brand primary preserved
          "--color-accent": "#6BCEF5", // Brand accent preserved
          "--color-bg": "#fff7ed",
          "--color-surface": "#fed7aa",
          "--color-text-primary": "#451a03",
          "--color-text-secondary": "#92400e",
          "--color-border": "#fdba74",
          // Status colors (brand-consistent)
          "--color-success": "#10b981",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e0b",
          "--color-info": "#3b82f6",
          // Interactive states
          "--color-primary-hover": "#e55a5a",
          "--color-accent-hover": "#5ab8d4",
          "--color-surface-hover": "#fbbf24",
          // Accessibility & contrast
          "--color-text-muted": "#a16207",
          "--color-overlay": "rgba(69, 26, 3, 0.5)",
          "--color-shadow": "rgba(245, 158, 11, 0.1)",
          // Dark mode support
          "--color-bg-dark": "#451a03",
          "--color-surface-dark": "#92400e",
        },
      },
    ],
  },
  nature: {
    name: "Nature Themes",
    themes: [
      {
        name: "Ocean",
        isOfficial: false,
        preview: {
          "--color-primary": "#1e40af",
          "--color-accent": "#06b6d4",
          "--color-bg": "#f0f9ff",
          "--color-surface": "#e0f2fe",
          "--color-text-primary": "#0f172a",
          "--color-text-secondary": "#475569",
          "--color-border": "#bae6fd",
          "--color-success": "#059669",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#0284c7",
          "--color-primary-hover": "#1e3a8a",
          "--color-accent-hover": "#0891b2",
          "--color-surface-hover": "#bae6fd",
          "--color-text-muted": "#64748b",
          "--color-overlay": "rgba(15, 23, 42, 0.5)",
          "--color-shadow": "rgba(30, 64, 175, 0.1)",
          "--color-bg-dark": "#0f172a",
          "--color-surface-dark": "#1e293b",
        },
      },
      {
        name: "Sunset",
        isOfficial: false,
        preview: {
          "--color-primary": "#f59e0b",
          "--color-accent": "#ec4899",
          "--color-bg": "#fff7ed",
          "--color-surface": "#fed7aa",
          "--color-text-primary": "#451a03",
          "--color-text-secondary": "#92400e",
          "--color-border": "#fdba74",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#ea580c",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#d97706",
          "--color-accent-hover": "#db2777",
          "--color-surface-hover": "#fbbf24",
          "--color-text-muted": "#a16207",
          "--color-overlay": "rgba(69, 26, 3, 0.5)",
          "--color-shadow": "rgba(245, 158, 11, 0.1)",
          "--color-bg-dark": "#451a03",
          "--color-surface-dark": "#92400e",
        },
      },
      {
        name: "Forest",
        isOfficial: false,
        preview: {
          "--color-primary": "#059669",
          "--color-accent": "#65a30d",
          "--color-bg": "#f0fdf4",
          "--color-surface": "#dcfce7",
          "--color-text-primary": "#14532d",
          "--color-text-secondary": "#166534",
          "--color-border": "#bbf7d0",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#047857",
          "--color-accent-hover": "#4d7c0f",
          "--color-surface-hover": "#bbf7d0",
          "--color-text-muted": "#15803d",
          "--color-overlay": "rgba(20, 83, 45, 0.5)",
          "--color-shadow": "rgba(5, 150, 105, 0.1)",
          "--color-bg-dark": "#14532d",
          "--color-surface-dark": "#166534",
        },
      },
      {
        name: "Mountain",
        isOfficial: false,
        preview: {
          "--color-primary": "#475569",
          "--color-accent": "#3b82f6",
          "--color-bg": "#f8fafc",
          "--color-surface": "#f1f5f9",
          "--color-text-primary": "#1e293b",
          "--color-text-secondary": "#64748b",
          "--color-border": "#cbd5e1",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#334155",
          "--color-accent-hover": "#2563eb",
          "--color-surface-hover": "#e2e8f0",
          "--color-text-muted": "#94a3b8",
          "--color-overlay": "rgba(30, 41, 59, 0.5)",
          "--color-shadow": "rgba(71, 85, 105, 0.1)",
          "--color-bg-dark": "#1e293b",
          "--color-surface-dark": "#334155",
        },
      },
      {
        name: "Grassland",
        isOfficial: false,
        preview: {
          "--color-primary": "#84cc16",
          "--color-accent": "#fbbf24",
          "--color-bg": "#fefce8",
          "--color-surface": "#fef3c7",
          "--color-text-primary": "#422006",
          "--color-text-secondary": "#a16207",
          "--color-border": "#fde68a",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#65a30d",
          "--color-accent-hover": "#f59e0b",
          "--color-surface-hover": "#fde68a",
          "--color-text-muted": "#ca8a04",
          "--color-overlay": "rgba(66, 32, 6, 0.5)",
          "--color-shadow": "rgba(132, 204, 22, 0.1)",
          "--color-bg-dark": "#422006",
          "--color-surface-dark": "#a16207",
        },
      },
      {
        name: "Sunrise",
        isOfficial: false,
        preview: {
          "--color-primary": "#fbbf24",
          "--color-accent": "#f59e0b",
          "--color-bg": "#fef7ed",
          "--color-surface": "#fed7aa",
          "--color-text-primary": "#451a03",
          "--color-text-secondary": "#92400e",
          "--color-border": "#fdba74",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#ea580c",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#f59e0b",
          "--color-accent-hover": "#d97706",
          "--color-surface-hover": "#fbbf24",
          "--color-text-muted": "#a16207",
          "--color-overlay": "rgba(69, 26, 3, 0.5)",
          "--color-shadow": "rgba(251, 191, 36, 0.1)",
          "--color-bg-dark": "#451a03",
          "--color-surface-dark": "#92400e",
        },
      },
      {
        name: "Desert Bloom",
        isOfficial: false,
        preview: {
          "--color-primary": "#d97706",
          "--color-accent": "#f59e0b",
          "--color-bg": "#fef7ed",
          "--color-surface": "#fed7aa",
          "--color-text-primary": "#451a03",
          "--color-text-secondary": "#92400e",
          "--color-border": "#fdba74",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#ea580c",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#b45309",
          "--color-accent-hover": "#d97706",
          "--color-surface-hover": "#fbbf24",
          "--color-text-muted": "#a16207",
          "--color-overlay": "rgba(69, 26, 3, 0.5)",
          "--color-shadow": "rgba(217, 119, 6, 0.1)",
          "--color-bg-dark": "#451a03",
          "--color-surface-dark": "#92400e",
        },
      },
      {
        name: "Aurora",
        isOfficial: false,
        preview: {
          "--color-primary": "#0d9488",
          "--color-accent": "#7c3aed",
          "--color-bg": "#f0fdfa",
          "--color-surface": "#ccfbf1",
          "--color-text-primary": "#134e4a",
          "--color-text-secondary": "#115e59",
          "--color-border": "#99f6e4",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#0f766e",
          "--color-accent-hover": "#7c2d12",
          "--color-surface-hover": "#99f6e4",
          "--color-text-muted": "#0f766e",
          "--color-overlay": "rgba(19, 78, 74, 0.5)",
          "--color-shadow": "rgba(13, 148, 136, 0.1)",
          "--color-bg-dark": "#134e4a",
          "--color-surface-dark": "#115e59",
        },
      },
      {
        name: "Rainy Garden",
        isOfficial: false,
        preview: {
          "--color-primary": "#6b8e23", // Olive green
          "--color-accent": "#708090", // Stormy gray
          "--color-bg": "#e6f0e9", // Dew blue
          "--color-surface": "#e3e6f3", // Lavender
          "--color-text-primary": "#374151",
          "--color-text-secondary": "#64748b",
          "--color-border": "#bcd0c7",
          "--color-success": "#4ade80",
          "--color-error": "#ef4444",
          "--color-warning": "#fbbf24",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#556b2f",
          "--color-accent-hover": "#4b5563",
          "--color-surface-hover": "#d1d5db",
          "--color-text-muted": "#9ca3af",
          "--color-overlay": "rgba(107, 142, 35, 0.1)",
          "--color-shadow": "rgba(112, 128, 144, 0.1)",
          "--color-bg-dark": "#374151",
          "--color-surface-dark": "#64748b",
        },
      },
    ],
  },
  colorVibe: {
    name: "Color Vibe Themes",
    themes: [
      {
        name: "Berry Pop",
        isOfficial: false,
        preview: {
          "--color-primary": "#dc2626",
          "--color-accent": "#7c3aed",
          "--color-bg": "#fdf2f8",
          "--color-surface": "#fce7f3",
          "--color-text-primary": "#831843",
          "--color-text-secondary": "#be185d",
          "--color-border": "#fbcfe8",
          "--color-success": "#16a34a",
          "--color-error": "#b91c1c",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#b91c1c",
          "--color-accent-hover": "#7c2d12",
          "--color-surface-hover": "#f9a8d4",
          "--color-text-muted": "#ec4899",
          "--color-overlay": "rgba(131, 24, 67, 0.5)",
          "--color-shadow": "rgba(220, 38, 38, 0.1)",
          "--color-bg-dark": "#831843",
          "--color-surface-dark": "#be185d",
        },
      },
      {
        name: "Minty Fresh",
        isOfficial: false,
        preview: {
          "--color-primary": "#10b981",
          "--color-accent": "#06b6d4",
          "--color-bg": "#f0fdf4",
          "--color-surface": "#dcfce7",
          "--color-text-primary": "#14532d",
          "--color-text-secondary": "#166534",
          "--color-border": "#bbf7d0",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#0891b2",
          "--color-primary-hover": "#059669",
          "--color-accent-hover": "#0891b2",
          "--color-surface-hover": "#bbf7d0",
          "--color-text-muted": "#15803d",
          "--color-overlay": "rgba(20, 83, 45, 0.5)",
          "--color-shadow": "rgba(16, 185, 129, 0.1)",
          "--color-bg-dark": "#14532d",
          "--color-surface-dark": "#166534",
        },
      },
      {
        name: "Blush Dream",
        isOfficial: false,
        preview: {
          "--color-primary": "#ec4899",
          "--color-accent": "#f59e0b",
          "--color-bg": "#fdf2f8",
          "--color-surface": "#fce7f3",
          "--color-text-primary": "#831843",
          "--color-text-secondary": "#be185d",
          "--color-border": "#fbcfe8",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#db2777",
          "--color-accent-hover": "#d97706",
          "--color-surface-hover": "#f9a8d4",
          "--color-text-muted": "#ec4899",
          "--color-overlay": "rgba(131, 24, 67, 0.5)",
          "--color-shadow": "rgba(236, 72, 153, 0.1)",
          "--color-bg-dark": "#831843",
          "--color-surface-dark": "#be185d",
        },
      },
      {
        name: "Cocoa Mocha",
        isOfficial: false,
        preview: {
          "--color-primary": "#92400e",
          "--color-accent": "#d97706",
          "--color-bg": "#fef7ed",
          "--color-surface": "#fed7aa",
          "--color-text-primary": "#451a03",
          "--color-text-secondary": "#92400e",
          "--color-border": "#fdba74",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#ea580c",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#78350f",
          "--color-accent-hover": "#b45309",
          "--color-surface-hover": "#fbbf24",
          "--color-text-muted": "#a16207",
          "--color-overlay": "rgba(69, 26, 3, 0.5)",
          "--color-shadow": "rgba(146, 64, 14, 0.1)",
          "--color-bg-dark": "#451a03",
          "--color-surface-dark": "#92400e",
        },
      },
      {
        name: "Skyline",
        isOfficial: false,
        preview: {
          "--color-primary": "#475569",
          "--color-accent": "#3b82f6",
          "--color-bg": "#f8fafc",
          "--color-surface": "#f1f5f9",
          "--color-text-primary": "#1e293b",
          "--color-text-secondary": "#64748b",
          "--color-border": "#cbd5e1",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#334155",
          "--color-accent-hover": "#2563eb",
          "--color-surface-hover": "#e2e8f0",
          "--color-text-muted": "#94a3b8",
          "--color-overlay": "rgba(30, 41, 59, 0.5)",
          "--color-shadow": "rgba(71, 85, 105, 0.1)",
          "--color-bg-dark": "#1e293b",
          "--color-surface-dark": "#334155",
        },
      },
      {
        name: "Citrus Zest",
        isOfficial: false,
        preview: {
          "--color-primary": "#ffe066", // Lemon yellow
          "--color-accent": "#ff8c42", // Tangerine
          "--color-bg": "#fffbe6",
          "--color-surface": "#fff3cd",
          "--color-text-primary": "#7c4700",
          "--color-text-secondary": "#b45309",
          "--color-border": "#ffe29a",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#ffd700",
          "--color-accent-hover": "#ff6700",
          "--color-surface-hover": "#ffe29a",
          "--color-text-muted": "#fbbf24",
          "--color-overlay": "rgba(255, 224, 102, 0.1)",
          "--color-shadow": "rgba(255, 140, 66, 0.1)",
          "--color-bg-dark": "#7c4700",
          "--color-surface-dark": "#b45309",
        },
      },
      {
        name: "Bubblegum Pop",
        isOfficial: false,
        preview: {
          "--color-primary": "#ffb7d5", // Candy pink
          "--color-accent": "#aeefff", // Baby blue
          "--color-bg": "#fffafd",
          "--color-surface": "#e0f7fa",
          "--color-text-primary": "#7c3aed",
          "--color-text-secondary": "#be185d",
          "--color-border": "#fbcfe8",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#ff69b4",
          "--color-accent-hover": "#38bdf8",
          "--color-surface-hover": "#fbcfe8",
          "--color-text-muted": "#be185d",
          "--color-overlay": "rgba(255, 183, 213, 0.1)",
          "--color-shadow": "rgba(174, 239, 255, 0.1)",
          "--color-bg-dark": "#7c3aed",
          "--color-surface-dark": "#be185d",
        },
      },
      {
        name: "Vanilla Sky",
        isOfficial: false,
        preview: {
          "--color-primary": "#f8ede3", // Cream
          "--color-accent": "#b5d0ff", // Pale blue
          "--color-bg": "#fffdfa",
          "--color-surface": "#f3f8ff",
          "--color-text-primary": "#bfa14a",
          "--color-text-secondary": "#b5a6d6",
          "--color-border": "#f3e8ff",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#f3e8ff",
          "--color-accent-hover": "#aeefff",
          "--color-surface-hover": "#f3e8ff",
          "--color-text-muted": "#b5a6d6",
          "--color-overlay": "rgba(248, 237, 227, 0.1)",
          "--color-shadow": "rgba(181, 208, 255, 0.1)",
          "--color-bg-dark": "#bfa14a",
          "--color-surface-dark": "#b5a6d6",
        },
      },
      {
        name: "Coral Reef",
        isOfficial: false,
        preview: {
          "--color-primary": "#ff7f50", // Coral
          "--color-accent": "#7fffd4", // Aqua
          "--color-bg": "#fff6f0",
          "--color-surface": "#e0f7fa",
          "--color-text-primary": "#ff7f50",
          "--color-text-secondary": "#7fffd4",
          "--color-border": "#ffe4e1",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#ff6347",
          "--color-accent-hover": "#40e0d0",
          "--color-surface-hover": "#ffe4e1",
          "--color-text-muted": "#7fffd4",
          "--color-overlay": "rgba(255, 127, 80, 0.1)",
          "--color-shadow": "rgba(127, 255, 212, 0.1)",
          "--color-bg-dark": "#ff7f50",
          "--color-surface-dark": "#7fffd4",
        },
      },
    ],
  },
  mood: {
    name: "Mood Themes",
    themes: [
      {
        name: "Fairy Dust",
        isOfficial: false,
        preview: {
          "--color-primary": "#a855f7",
          "--color-accent": "#ec4899",
          "--color-bg": "#faf5ff",
          "--color-surface": "#f3e8ff",
          "--color-text-primary": "#581c87",
          "--color-text-secondary": "#7c3aed",
          "--color-border": "#e9d5ff",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#9333ea",
          "--color-accent-hover": "#db2777",
          "--color-surface-hover": "#e9d5ff",
          "--color-text-muted": "#a855f7",
          "--color-overlay": "rgba(88, 28, 135, 0.5)",
          "--color-shadow": "rgba(168, 85, 247, 0.1)",
          "--color-bg-dark": "#581c87",
          "--color-surface-dark": "#7c3aed",
        },
      },
      {
        name: "Starlight",
        isOfficial: false,
        preview: {
          "--color-primary": "#3730a3",
          "--color-accent": "#000000",
          "--color-bg": "#f8fafc",
          "--color-surface": "#f1f5f9",
          "--color-text-primary": "#1e293b",
          "--color-text-secondary": "#64748b",
          "--color-border": "#cbd5e1",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#312e81",
          "--color-accent-hover": "#000000",
          "--color-surface-hover": "#e2e8f0",
          "--color-text-muted": "#94a3b8",
          "--color-overlay": "rgba(30, 41, 59, 0.5)",
          "--color-shadow": "rgba(55, 48, 163, 0.1)",
          "--color-bg-dark": "#1e293b",
          "--color-surface-dark": "#334155",
        },
      },
      {
        name: "Mermaid Cove",
        isOfficial: false,
        preview: {
          "--color-primary": "#0891b2",
          "--color-accent": "#10b981",
          "--color-bg": "#f0fdfa",
          "--color-surface": "#ccfbf1",
          "--color-text-primary": "#134e4a",
          "--color-text-secondary": "#115e59",
          "--color-border": "#99f6e4",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#0891b2",
          "--color-primary-hover": "#0e7490",
          "--color-accent-hover": "#059669",
          "--color-surface-hover": "#99f6e4",
          "--color-text-muted": "#0f766e",
          "--color-overlay": "rgba(19, 78, 74, 0.5)",
          "--color-shadow": "rgba(8, 145, 178, 0.1)",
          "--color-bg-dark": "#134e4a",
          "--color-surface-dark": "#115e59",
        },
      },
      {
        name: "Lavender Field",
        isOfficial: false,
        preview: {
          "--color-primary": "#8b5cf6",
          "--color-accent": "#a855f7",
          "--color-bg": "#faf5ff",
          "--color-surface": "#f3e8ff",
          "--color-text-primary": "#581c87",
          "--color-text-secondary": "#7c3aed",
          "--color-border": "#e9d5ff",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#7c3aed",
          "--color-accent-hover": "#9333ea",
          "--color-surface-hover": "#e9d5ff",
          "--color-text-muted": "#a855f7",
          "--color-overlay": "rgba(88, 28, 135, 0.5)",
          "--color-shadow": "rgba(139, 92, 246, 0.1)",
          "--color-bg-dark": "#581c87",
          "--color-surface-dark": "#7c3aed",
        },
      },
      {
        name: "Peach Garden",
        isOfficial: false,
        preview: {
          "--color-primary": "#fb7185",
          "--color-accent": "#f59e0b",
          "--color-bg": "#fef7ed",
          "--color-surface": "#fed7aa",
          "--color-text-primary": "#451a03",
          "--color-text-secondary": "#92400e",
          "--color-border": "#fdba74",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#f43f5e",
          "--color-accent-hover": "#d97706",
          "--color-surface-hover": "#fbbf24",
          "--color-text-muted": "#a16207",
          "--color-overlay": "rgba(69, 26, 3, 0.5)",
          "--color-shadow": "rgba(251, 113, 133, 0.1)",
          "--color-bg-dark": "#451a03",
          "--color-surface-dark": "#92400e",
        },
      },
      {
        name: "Dreamcatcher",
        isOfficial: false,
        preview: {
          "--color-primary": "#b49a7a", // Warm taupe
          "--color-accent": "#1a2238", // Midnight blue
          "--color-bg": "#f5f3ea",
          "--color-surface": "#e0e7ef",
          "--color-text-primary": "#1a2238",
          "--color-text-secondary": "#b49a7a",
          "--color-border": "#e5e7eb",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#a68a64",
          "--color-accent-hover": "#0d1b2a",
          "--color-surface-hover": "#e5e7eb",
          "--color-text-muted": "#b49a7a",
          "--color-overlay": "rgba(180, 154, 122, 0.1)",
          "--color-shadow": "rgba(26, 34, 56, 0.1)",
          "--color-bg-dark": "#1a2238",
          "--color-surface-dark": "#b49a7a",
        },
      },
      {
        name: "Pastel Galaxy",
        isOfficial: false,
        preview: {
          "--color-primary": "#b39ddb", // Light purple
          "--color-accent": "#80deea", // Baby teal
          "--color-bg": "#f3e8ff",
          "--color-surface": "#e0f7fa",
          "--color-text-primary": "#7c3aed",
          "--color-text-secondary": "#80deea",
          "--color-border": "#e9d5ff",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#9575cd",
          "--color-accent-hover": "#4dd0e1",
          "--color-surface-hover": "#e9d5ff",
          "--color-text-muted": "#b39ddb",
          "--color-overlay": "rgba(179, 157, 219, 0.1)",
          "--color-shadow": "rgba(128, 222, 234, 0.1)",
          "--color-bg-dark": "#7c3aed",
          "--color-surface-dark": "#80deea",
        },
      },
      {
        name: "Cotton Candy",
        isOfficial: false,
        preview: {
          "--color-primary": "#f8bbd0", // Blush
          "--color-accent": "#b3e5fc", // Baby blue
          "--color-bg": "#fffafd",
          "--color-surface": "#f3e8ff",
          "--color-text-primary": "#be185d",
          "--color-text-secondary": "#b3e5fc",
          "--color-border": "#fbcfe8",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#f06292",
          "--color-accent-hover": "#4fc3f7",
          "--color-surface-hover": "#fbcfe8",
          "--color-text-muted": "#b3e5fc",
          "--color-overlay": "rgba(248, 187, 208, 0.1)",
          "--color-shadow": "rgba(179, 229, 252, 0.1)",
          "--color-bg-dark": "#be185d",
          "--color-surface-dark": "#b3e5fc",
        },
      },
      {
        name: "Evening Tea",
        isOfficial: false,
        preview: {
          "--color-primary": "#a47149", // Warm brown
          "--color-accent": "#a3989d", // Dusty plum
          "--color-bg": "#f5f3ea",
          "--color-surface": "#e9e4e0",
          "--color-text-primary": "#a47149",
          "--color-text-secondary": "#a3989d",
          "--color-border": "#e5e7eb",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#8d5524",
          "--color-accent-hover": "#7c3aed",
          "--color-surface-hover": "#e5e7eb",
          "--color-text-muted": "#a3989d",
          "--color-overlay": "rgba(164, 113, 73, 0.1)",
          "--color-shadow": "rgba(163, 152, 157, 0.1)",
          "--color-bg-dark": "#a47149",
          "--color-surface-dark": "#a3989d",
        },
      },
    ],
  },
  minimalChic: {
    name: "Minimal Chic Themes",
    themes: [
      {
        name: "Creamy Latte",
        isOfficial: false,
        preview: {
          "--color-primary": "#d97706",
          "--color-accent": "#92400e",
          "--color-bg": "#fef7ed",
          "--color-surface": "#fed7aa",
          "--color-text-primary": "#451a03",
          "--color-text-secondary": "#92400e",
          "--color-border": "#fdba74",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#ea580c",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#b45309",
          "--color-accent-hover": "#78350f",
          "--color-surface-hover": "#fbbf24",
          "--color-text-muted": "#a16207",
          "--color-overlay": "rgba(69, 26, 3, 0.5)",
          "--color-shadow": "rgba(217, 119, 6, 0.1)",
          "--color-bg-dark": "#451a03",
          "--color-surface-dark": "#92400e",
        },
      },
      {
        name: "Midnight Rose",
        isOfficial: false,
        preview: {
          "--color-primary": "#000000",
          "--color-accent": "#dc2626",
          "--color-bg": "#f8fafc",
          "--color-surface": "#f1f5f9",
          "--color-text-primary": "#1e293b",
          "--color-text-secondary": "#64748b",
          "--color-border": "#cbd5e1",
          "--color-success": "#16a34a",
          "--color-error": "#b91c1c",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#000000",
          "--color-accent-hover": "#b91c1c",
          "--color-surface-hover": "#e2e8f0",
          "--color-text-muted": "#94a3b8",
          "--color-overlay": "rgba(30, 41, 59, 0.5)",
          "--color-shadow": "rgba(0, 0, 0, 0.1)",
          "--color-bg-dark": "#1e293b",
          "--color-surface-dark": "#334155",
        },
      },
      {
        name: "Powder Room",
        isOfficial: false,
        preview: {
          "--color-primary": "#fbbf24",
          "--color-accent": "#ec4899",
          "--color-bg": "#fef7ed",
          "--color-surface": "#fed7aa",
          "--color-text-primary": "#451a03",
          "--color-text-secondary": "#92400e",
          "--color-border": "#fdba74",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#f59e0b",
          "--color-accent-hover": "#db2777",
          "--color-surface-hover": "#fbbf24",
          "--color-text-muted": "#a16207",
          "--color-overlay": "rgba(69, 26, 3, 0.5)",
          "--color-shadow": "rgba(251, 191, 36, 0.1)",
          "--color-bg-dark": "#451a03",
          "--color-surface-dark": "#92400e",
        },
      },
      {
        name: "Blueberry Milk",
        isOfficial: false,
        preview: {
          "--color-primary": "#6366f1",
          "--color-accent": "#8b5cf6",
          "--color-bg": "#f8fafc",
          "--color-surface": "#f1f5f9",
          "--color-text-primary": "#1e293b",
          "--color-text-secondary": "#64748b",
          "--color-border": "#cbd5e1",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#4f46e5",
          "--color-accent-hover": "#7c3aed",
          "--color-surface-hover": "#e2e8f0",
          "--color-text-muted": "#94a3b8",
          "--color-overlay": "rgba(30, 41, 59, 0.5)",
          "--color-shadow": "rgba(99, 102, 241, 0.1)",
          "--color-bg-dark": "#1e293b",
          "--color-surface-dark": "#334155",
        },
      },
      {
        name: "Frosted Pearl",
        isOfficial: false,
        preview: {
          "--color-primary": "#6b7280",
          "--color-accent": "#9ca3af",
          "--color-bg": "#f9fafb",
          "--color-surface": "#f3f4f6",
          "--color-text-primary": "#374151",
          "--color-text-secondary": "#6b7280",
          "--color-border": "#d1d5db",
          "--color-success": "#16a34a",
          "--color-error": "#dc2626",
          "--color-warning": "#d97706",
          "--color-info": "#2563eb",
          "--color-primary-hover": "#4b5563",
          "--color-accent-hover": "#6b7280",
          "--color-surface-hover": "#e5e7eb",
          "--color-text-muted": "#9ca3af",
          "--color-overlay": "rgba(55, 65, 81, 0.5)",
          "--color-shadow": "rgba(107, 114, 128, 0.1)",
          "--color-bg-dark": "#374151",
          "--color-surface-dark": "#4b5563",
        },
      },
      {
        name: "Caramel Cream",
        isOfficial: false,
        preview: {
          "--color-primary": "#c68642", // Caramel
          "--color-accent": "#e6ccb2", // Pale brown
          "--color-bg": "#f9f6f2",
          "--color-surface": "#f3e8e1",
          "--color-text-primary": "#a47149",
          "--color-text-secondary": "#e6ccb2",
          "--color-border": "#e5e7eb",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#a47149",
          "--color-accent-hover": "#bfa14a",
          "--color-surface-hover": "#e5e7eb",
          "--color-text-muted": "#e6ccb2",
          "--color-overlay": "rgba(198, 134, 66, 0.1)",
          "--color-shadow": "rgba(230, 204, 178, 0.1)",
          "--color-bg-dark": "#a47149",
          "--color-surface-dark": "#e6ccb2",
        },
      },
      {
        name: "Velvet Noir",
        isOfficial: false,
        preview: {
          "--color-primary": "#2d2d2d", // Charcoal
          "--color-accent": "#800020", // Burgundy
          "--color-bg": "#f5f5f5",
          "--color-surface": "#e5e7eb",
          "--color-text-primary": "#2d2d2d",
          "--color-text-secondary": "#800020",
          "--color-border": "#d1d5db",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#1a1a1a",
          "--color-accent-hover": "#a8324a",
          "--color-surface-hover": "#d1d5db",
          "--color-text-muted": "#800020",
          "--color-overlay": "rgba(45, 45, 45, 0.1)",
          "--color-shadow": "rgba(128, 0, 32, 0.1)",
          "--color-bg-dark": "#2d2d2d",
          "--color-surface-dark": "#800020",
        },
      },
      {
        name: "Ivory Bloom",
        isOfficial: false,
        preview: {
          "--color-primary": "#f8f4e3", // Off-white
          "--color-accent": "#f7cac9", // Petal pink
          "--color-bg": "#fffdfa",
          "--color-surface": "#f3e8e1",
          "--color-text-primary": "#bfa14a",
          "--color-text-secondary": "#f7cac9",
          "--color-border": "#f3e8e1",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#f3e8e1",
          "--color-accent-hover": "#f7cac9",
          "--color-surface-hover": "#f3e8e1",
          "--color-text-muted": "#f7cac9",
          "--color-overlay": "rgba(248, 244, 227, 0.1)",
          "--color-shadow": "rgba(247, 202, 201, 0.1)",
          "--color-bg-dark": "#bfa14a",
          "--color-surface-dark": "#f7cac9",
        },
      },
      {
        name: "Blonde Linen",
        isOfficial: false,
        preview: {
          "--color-primary": "#f5e6ca", // Light sand
          "--color-accent": "#ffd1b3", // Soft peach
          "--color-bg": "#fffdfa",
          "--color-surface": "#f3e8e1",
          "--color-text-primary": "#bfa14a",
          "--color-text-secondary": "#ffd1b3",
          "--color-border": "#f3e8e1",
          "--color-success": "#22c55e",
          "--color-error": "#ef4444",
          "--color-warning": "#f59e42",
          "--color-info": "#38bdf8",
          "--color-primary-hover": "#f3e8e1",
          "--color-accent-hover": "#ffd1b3",
          "--color-surface-hover": "#f3e8e1",
          "--color-text-muted": "#ffd1b3",
          "--color-overlay": "rgba(245, 230, 202, 0.1)",
          "--color-shadow": "rgba(255, 209, 179, 0.1)",
          "--color-bg-dark": "#bfa14a",
          "--color-surface-dark": "#ffd1b3",
        },
      },
    ],
  },
};

const categoryOrder = [
  "xpeakOfficial",
  "nature",
  "colorVibe",
  "mood",
  "minimalChic"
];

export default function ThemePickerClient() {
  const {
    theme,
    setTheme,
    customTheme,
    setCustomTheme,
    clearCustomTheme,
    isSyncing,
    lastSyncError
  } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("xpeakOfficial");

  // Helper to get themes for selected category
  const themes = themeCategories[selectedCategory]?.themes || [];

  return (
    <div className="flex gap-8">
      {/* Sidebar for categories */}
      <aside className="w-56 flex-shrink-0">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Theme Categories</h2>
          <nav className="flex flex-col gap-2">
            {categoryOrder.map((key) => (
              <button
                key={key}
                className={`text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === key
                    ? "bg-token-primary text-token-text-inverse"
                    : "bg-token-surface border border-token-border hover:bg-token-primary/10"
                }`}
                onClick={() => setSelectedCategory(key)}
              >
                {themeCategories[key]?.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Current Theme Display */}
        <div className="mb-6 p-4 bg-token-surface border border-token-border rounded-lg flex items-center justify-between">
          <div>
            <div className="text-sm text-token-text-secondary">Current Theme</div>
            <div className="font-semibold text-token-text-primary capitalize">Base Theme: {theme}</div>
            {customTheme && (
              <div className="text-token-text-secondary text-xs mt-1">
                Custom Theme: <span className="font-medium text-token-text-primary">{customTheme.name}</span>
                {customTheme.isOfficial && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-token-primary text-token-text-inverse">
                    Official
                  </span>
                )}
              </div>
            )}
          </div>
          {customTheme && (
            <button
              onClick={clearCustomTheme}
              className="px-3 py-1 text-sm bg-token-surface-hover text-token-text-secondary hover:text-token-text-primary rounded-md transition-colors"
            >
              Clear Custom
            </button>
          )}
        </div>

        {/* Sync Status */}
        {(isSyncing || lastSyncError) && (
          <div className="mb-4 bg-token-surface border border-token-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              {isSyncing && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-token-primary"></div>
                  <span className="text-sm text-token-text-secondary">
                    Syncing theme preferences to database...
                  </span>
                </>
              )}
              {lastSyncError && (
                <>
                  <div className="h-4 w-4 rounded-full bg-token-error"></div>
                  <span className="text-sm text-token-error">
                    {lastSyncError}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Theme Grid */}
        <div>
          <h3 className="text-xl font-semibold text-token-text-primary mb-4">
            {themeCategories[selectedCategory]?.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {themes.map((themeOption) => (
              <div
                key={themeOption.name}
                className={`relative bg-token-surface border rounded-lg p-4 flex flex-col items-center gap-2 transition hover:shadow-md ${
                  customTheme?.name === themeOption.name && customTheme?.category === selectedCategory
                    ? "border-token-primary ring-2 ring-token-primary/20"
                    : "border-token-border hover:border-token-primary/50"
                }`}
              >
                {/* Official Badge */}
                {themeOption.isOfficial && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-token-primary text-token-text-inverse">
                      Official
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className="flex gap-1 mb-2">
                    <span
                      className="w-4 h-4 rounded border border-token-border"
                      style={{ background: themeOption.preview["--color-primary"] }}
                    />
                    <span
                      className="w-4 h-4 rounded border border-token-border"
                      style={{ background: themeOption.preview["--color-accent"] }}
                    />
                    <span
                      className="w-4 h-4 rounded border border-token-border"
                      style={{ background: themeOption.preview["--color-bg"] }}
                    />
                    <span
                      className="w-4 h-4 rounded border border-token-border"
                      style={{ background: themeOption.preview["--color-surface"] }}
                    />
                  </div>
                  <div className="font-medium text-token-text-primary text-center">
                    {themeOption.name}
                  </div>
                  <div className="text-xs text-token-text-secondary text-center mb-2">
                    {themeOption.isOfficial ? "Full theming" : "Backgrounds & surfaces only"}
                  </div>
                  <button
                    onClick={() => setCustomTheme({
                      name: themeOption.name,
                      category: selectedCategory,
                      isOfficial: themeOption.isOfficial,
                      variables: themeOption.preview
                    })}
                    className="w-full mt-2 px-4 py-2 bg-token-primary text-token-text-inverse rounded-md hover:bg-token-primary-hover transition-colors"
                  >
                    Apply Theme
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 