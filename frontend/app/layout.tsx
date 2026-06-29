import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ToasterLoader } from "@/components/toaster-loader";
import { ThemeListener } from "@/components/theme-listener";
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
        </head>
        <body className="min-h-screen flex flex-col">
          <ToasterLoader />
          <ThemeListener />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
