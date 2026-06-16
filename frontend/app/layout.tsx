import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const font = Nunito({
  subsets: ["latin"],
});

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
      <html lang="vi" className={`${font.className} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}