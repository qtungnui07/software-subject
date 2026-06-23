import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ToasterLoader } from "@/components/toaster-loader";
import "./globals.css";

import Script from "next/script";

export const metadata: Metadata = {
  title: "Robogo - Learn languages every day",
  description:
    "A gamified language learning app focused on real study time, streaks, XP, and daily progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="vi" className="min-h-screen antialiased" suppressHydrationWarning>
        <head>
          <Script
            id="theme-script"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const savedTheme = localStorage.getItem('robogo-theme');
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    const resolvedTheme = savedTheme === 'dark' || (savedTheme === 'system' && prefersDark) || (!savedTheme && prefersDark) ? 'dark' : 'light';
                    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
                    document.documentElement.dataset.theme = resolvedTheme;
                  } catch (e) {}
                })();
              `
            }}
          />
        </head>
        <body className="min-h-full flex flex-col">
          <ToasterLoader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
