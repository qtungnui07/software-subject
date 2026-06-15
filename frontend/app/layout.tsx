import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ToasterLoader } from "@/components/toaster-loader";
import "./globals.css";

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
      <html lang="vi" className="h-full antialiased">
        <body className="min-h-full flex flex-col">
          <ToasterLoader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
