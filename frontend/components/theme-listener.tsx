"use client";

import { useEffect } from "react";

export const ThemeListener = () => {
  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem("robogo-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolvedTheme =
        savedTheme === "dark" ||
        (savedTheme === "system" && prefersDark) ||
        (!savedTheme && prefersDark)
          ? "dark"
          : "light";

      document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
      document.documentElement.dataset.theme = resolvedTheme;
    };

    updateTheme();

    // 1. Listen to storage changes (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "robogo-theme") {
        updateTheme();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 2. Listen to system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const savedTheme = localStorage.getItem("robogo-theme");
      // Only react if setting is system or not set yet
      if (!savedTheme || savedTheme === "system") {
        updateTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  return null;
};
