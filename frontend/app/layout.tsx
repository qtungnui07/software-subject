import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ToasterLoader } from "@/components/toaster-loader";
import { ThemeListener } from "@/components/theme-listener";
import { LearnRouteTransition } from "@/components/learn-route-transition";
import { SessionResetGuard } from "@/components/session-reset-guard";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robogo - Learn languages every day",
  description:
    "A gamified language learning app focused on real study time, streaks, XP, and daily progress.",
  icons: {
    icon: "/Robogo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialHomeLoaderScript = `
    (() => {
      const loader = document.getElementById("robogo-initial-home-loader");
      if (!loader) return;

      const hideLoader = () => {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        loader.style.pointerEvents = "none";
        loader.style.display = "none";
      };

      if (window.location.pathname !== "/") {
        hideLoader();
        return;
      }

      let hasCompletedLoad = document.readyState === "complete";
      let hasCompletedIntro = false;
      let hasDismissed = false;
      const logo = loader.querySelector(".initial-home-loader__logo");
      const letters = Array.from(loader.querySelectorAll(".initial-home-loader__letters span"));
      const subtitle = loader.querySelector(".initial-home-loader__wordmark small");
      const introAnimations = [];

      const animateHomeContent = () => {
        const shell = document.querySelector(".marketing-shell");
        const pieces = [
          shell,
          shell?.querySelector("header"),
          shell?.querySelector("main"),
          shell?.querySelector("footer")
        ].filter(Boolean);

        pieces.forEach((piece, index) => {
          piece.animate(
            [
              { opacity: index === 0 ? 0.42 : 0, transform: "translateY(24px) scale(0.98)", filter: "blur(10px)" },
              { opacity: 1, transform: "translateY(-3px) scale(1.004)", filter: "blur(0)", offset: 0.58 },
              { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" }
            ],
            {
              duration: index === 0 ? 900 : 760,
              delay: index * 80,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both"
            }
          );
        });
      };

      if (logo) {
        introAnimations.push(logo.animate(
          [
            { opacity: 0, transform: "translateY(42px) rotate(-8deg) scale(0.72)", filter: "blur(12px)" },
            { opacity: 1, transform: "translateY(-8px) rotate(3deg) scale(1.06)", filter: "blur(0)", offset: 0.72 },
            { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)", filter: "blur(0)" }
          ],
          { duration: 820, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "forwards" }
        ));
      }

      letters.forEach((letter, index) => {
        introAnimations.push(letter.animate(
          [
            { opacity: 0, transform: "translateY(36px) scale(0.92)", filter: "blur(8px)" },
            { opacity: 1, transform: "translateY(-4px) scale(1.04)", filter: "blur(0)", offset: 0.72 },
            { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" }
          ],
          {
            duration: 680,
            delay: 560 + index * 90,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "forwards"
          }
        ));
      });

      if (subtitle) {
        introAnimations.push(subtitle.animate(
          [
            { opacity: 0, transform: "translateY(12px)", filter: "blur(6px)" },
            { opacity: 0.62, transform: "translateY(0)", filter: "blur(0)" }
          ],
          { duration: 620, delay: 1320, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
        ));
      }

      Promise.allSettled(introAnimations.map((animation) => animation.finished)).then(() => {
        hasCompletedIntro = true;
        dismiss();
      });

      const dismiss = () => {
        if (hasDismissed || !hasCompletedLoad || !hasCompletedIntro) return;

        hasDismissed = true;
        animateHomeContent();

        const fadeAnimations = [
          loader.animate(
            [
              { opacity: 1, filter: "blur(0)" },
              { opacity: 0, filter: "blur(18px)" }
            ],
            { duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
          )
        ];

        if (logo) {
          fadeAnimations.push(logo.animate(
            [
              { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)", filter: "blur(0)" },
              { opacity: 1, transform: "translateY(-8px) rotate(180deg) scale(1.06)", filter: "blur(0)", offset: 0.46 },
              { opacity: 0, transform: "translateY(-18px) rotate(360deg) scale(0.82)", filter: "blur(10px)" }
            ],
            { duration: 720, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" }
          ));
        }

        Promise.allSettled(fadeAnimations.map((animation) => animation.finished)).then(hideLoader);
      };

      window.setTimeout(() => {
        hasCompletedLoad = true;
        hasCompletedIntro = true;
        dismiss();
      }, 4400);

      if (hasCompletedLoad) {
        window.requestAnimationFrame(dismiss);
      } else {
        window.addEventListener("load", () => {
          hasCompletedLoad = true;
          dismiss();
        }, { once: true });
      }
    })();
  `;

  return (
    <ClerkProvider>
      <html lang="vi" className="min-h-screen antialiased" suppressHydrationWarning>
        <head>
          <script
            id="robogo-theme-init"
            dangerouslySetInnerHTML={{
              __html: `
                (() => {
                  try {
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
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-screen flex flex-col">
          <div
            id="robogo-initial-home-loader"
            className="initial-home-loader"
            aria-label="Đang tải Robogo"
            role="status"
            suppressHydrationWarning
            style={{
              position: "fixed",
              inset: "0",
              zIndex: "2147483646",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              background: "#eef8ff",
            }}
          >
            <div
              className="initial-home-loader__glow"
              aria-hidden="true"
              style={{
                position: "absolute",
                width: "min(58vw, 640px)",
                aspectRatio: "1",
                borderRadius: "999px",
              }}
            />
            <div
              className="initial-home-loader__stage"
              style={{
                position: "relative",
                display: "grid",
                placeItems: "center",
                width: "clamp(118px, 16vw, 184px)",
                aspectRatio: "1",
              }}
            >
              <div
                className="initial-home-loader__orbit"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: "-18%",
                  borderRadius: "999px",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Robogo.svg"
                alt="Robogo"
                className="initial-home-loader__logo"
                draggable={false}
                style={{
                  position: "relative",
                  zIndex: "1",
                  width: "100%",
                  height: "100%",
                  maxWidth: "100%",
                  display: "block",
                  objectFit: "contain",
                  opacity: "0",
                  transform: "translateY(42px) rotate(-8deg) scale(0.72)",
                }}
              />
            </div>
            <div
              className="initial-home-loader__wordmark"
              style={{
                position: "absolute",
                left: "50%",
                top: "calc(50% + clamp(100px, 14vw, 160px))",
                display: "grid",
                gap: "6px",
                transform: "translateX(-50%)",
                textAlign: "center",
              }}
            >
              <span className="initial-home-loader__letters" aria-label="Robogo">
                <span style={{ opacity: "0", transform: "translateY(36px) scale(0.92)" }}>R</span>
                <span style={{ opacity: "0", transform: "translateY(36px) scale(0.92)" }}>o</span>
                <span style={{ opacity: "0", transform: "translateY(36px) scale(0.92)" }}>b</span>
                <span style={{ opacity: "0", transform: "translateY(36px) scale(0.92)" }}>o</span>
                <span style={{ opacity: "0", transform: "translateY(36px) scale(0.92)" }}>g</span>
                <span style={{ opacity: "0", transform: "translateY(36px) scale(0.92)" }}>o</span>
              </span>
              <small style={{ opacity: "0", transform: "translateY(12px)" }}>Learn smarter</small>
            </div>
          </div>
          <Script
            id="robogo-initial-home-loader-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: initialHomeLoaderScript }}
          />
          <SessionResetGuard />
          <ToasterLoader />
          <ThemeListener />
          <LearnRouteTransition />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
