"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const STEP_COUNT = 9;
const COVER_STEP_DELAY_MS = 64;
const COVER_DURATION_MS = 620;
const REVEAL_STEP_DELAY_MS = 58;
const REVEAL_DURATION_MS = 680;
const NAVIGATION_DELAY_MS = 1180;
const STORAGE_KEY = "robogo-learn-transition";
const THEME_STORAGE_KEY = "robogo-learn-transition-theme";
const POPUP_SEEN_STORAGE_KEY = "robogo-learn-popup-seen";

type TransitionPhase = "idle" | "covering" | "covered" | "revealing";
type TransitionTheme = "light" | "dark";

const isPlainLeftClick = (event: MouseEvent) => {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
};

const findLearnAnchor = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest<HTMLAnchorElement>("a[href]");
  if (!anchor) {
    return null;
  }

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname !== "/learn") {
    return null;
  }

  return { anchor, url };
};

const getTransitionTheme = (): TransitionTheme => {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("robogo-theme");

  if (html.classList.contains("dark") || html.dataset.theme === "dark") {
    return "dark";
  }

  if (savedTheme === "dark") {
    return "dark";
  }

  if (
    savedTheme === "system" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

const getTransitionPalette = (theme: TransitionTheme) => {
  if (theme === "light") {
    return {
      veil:
        "radial-gradient(circle at 68% 20%, rgba(29, 155, 240, 0.24), transparent 34%), rgba(239, 248, 255, 0.68)",
      primary:
        "linear-gradient(105deg, rgba(232, 246, 255, 0.98) 0%, rgba(149, 215, 255, 0.96) 48%, rgba(29, 155, 240, 0.96) 100%)",
      secondary:
        "linear-gradient(105deg, rgba(236, 253, 245, 0.98) 0%, rgba(125, 225, 182, 0.95) 52%, rgba(34, 197, 94, 0.96) 100%)",
      borderTop: "1px solid rgba(255, 255, 255, 0.72)",
      borderBottom: "1px solid rgba(14, 116, 144, 0.16)",
      shadow: "0 18px 58px rgba(14, 116, 144, 0.18)",
      labelBg: "rgba(255, 255, 255, 0.52)",
      labelBorder: "1px solid rgba(14, 116, 144, 0.18)",
      labelColor: "#075985",
      labelShadow: "0 22px 80px rgba(14, 116, 144, 0.2)",
      sheen:
        "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.46) 48%, transparent 78%)",
    };
  }

  return {
    veil:
      "radial-gradient(circle at 68% 20%, rgba(29, 155, 240, 0.22), transparent 34%), rgba(2, 8, 23, 0.62)",
    primary:
      "linear-gradient(105deg, rgba(4, 10, 22, 0.97) 0%, rgba(13, 41, 72, 0.95) 50%, rgba(29, 155, 240, 0.96) 100%)",
    secondary:
      "linear-gradient(105deg, rgba(5, 13, 27, 0.96) 0%, rgba(12, 54, 91, 0.94) 52%, rgba(30, 203, 115, 0.96) 100%)",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    borderBottom: "1px solid rgba(2, 8, 23, 0.42)",
    shadow: "0 18px 58px rgba(2, 8, 23, 0.2)",
    labelBg: "rgba(6, 16, 31, 0.42)",
    labelBorder: "1px solid rgba(255, 255, 255, 0.14)",
    labelColor: "#f8fafc",
    labelShadow: "0 22px 80px rgba(0, 0, 0, 0.26)",
    sheen:
      "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.26) 48%, transparent 78%)",
  };
};

const createTransitionOverlay = (
  initialState: "hidden" | "covered" = "hidden",
  theme: TransitionTheme = getTransitionTheme()
) => {
  const palette = getTransitionPalette(theme);
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.dataset.learnTransition = "true";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    display: "grid",
    gridTemplateRows: `repeat(${STEP_COUNT}, 1fr)`,
    pointerEvents: "none",
    overflow: "hidden",
    background: "transparent",
  });

  const veil = document.createElement("div");
  veil.dataset.learnTransitionVeil = "true";
  Object.assign(veil.style, {
    position: "absolute",
    inset: "0",
    zIndex: "0",
    opacity: initialState === "covered" ? "1" : "0",
    background: palette.veil,
    backdropFilter: "blur(28px) saturate(1.24)",
    WebkitBackdropFilter: "blur(28px) saturate(1.24)",
    willChange: "opacity, backdrop-filter",
  });
  overlay.appendChild(veil);

  for (let index = 0; index < STEP_COUNT; index += 1) {
    const step = document.createElement("span");
    Object.assign(step.style, {
      display: "block",
      position: "relative",
      zIndex: "1",
      transform: initialState === "covered" ? "translateX(0)" : "translateX(-105%)",
      overflow: "hidden",
      background: index % 3 === 1 ? palette.secondary : palette.primary,
      borderTop: palette.borderTop,
      borderBottom: palette.borderBottom,
      boxShadow: palette.shadow,
      backdropFilter: "blur(8px) saturate(1.2)",
      willChange: "transform",
    });

    const sheen = document.createElement("i");
    Object.assign(sheen.style, {
      position: "absolute",
      inset: "0",
      display: "block",
      transform: "translateX(-115%) skewX(-18deg)",
      background: palette.sheen,
      opacity: "0.8",
      mixBlendMode: "screen",
      willChange: "transform",
    });

    step.appendChild(sheen);
    overlay.appendChild(step);
  }

  const label = document.createElement("div");
  label.dataset.learnTransitionLabel = "true";
  label.className = "learn-transition-logo-card";

  const logo = document.createElement("img");
  logo.src = "/logo.png";
  logo.alt = "Robogo";
  logo.className = "learn-transition-logo-card__image";
  logo.draggable = false;
  logo.decoding = "async";

  label.appendChild(logo);
  Object.assign(label.style, {
    position: "absolute",
    left: "50%",
    top: "50%",
    zIndex: "2",
    transform: "translate(-50%, -50%)",
    display: "grid",
    placeItems: "center",
    width: "clamp(92px, 12vw, 142px)",
    aspectRatio: "1",
    padding: "12px",
    borderRadius: "50%",
    border: palette.labelBorder,
    background: palette.labelBg,
    color: palette.labelColor,
    boxShadow: palette.labelShadow,
    opacity: initialState === "covered" ? "1" : "0",
    backdropFilter: "blur(14px)",
    willChange: "opacity, transform",
  });
  overlay.appendChild(label);

  return overlay;
};

const getOverlayParts = (overlay: HTMLElement) => {
  const steps = Array.from(
    overlay.querySelectorAll<HTMLElement>(":scope > span")
  );
  const label = overlay.querySelector<HTMLElement>("[data-learn-transition-label]");
  const veil = overlay.querySelector<HTMLElement>("[data-learn-transition-veil]");

  return { steps, label, veil };
};

const animateCover = (overlay: HTMLElement) => {
  const { steps, label, veil } = getOverlayParts(overlay);

  for (const [index, step] of steps.entries()) {
    step.animate(
      [
        { transform: "translateX(-105%)" },
        { transform: "translateX(0)" },
      ],
      {
        duration: COVER_DURATION_MS,
        delay: index * COVER_STEP_DELAY_MS,
        easing: "cubic-bezier(0.82, 0, 0.18, 1)",
        fill: "forwards",
      }
    );

    step.querySelector("i")?.animate(
      [
        { transform: "translateX(-115%) skewX(-18deg)" },
        { transform: "translateX(115%) skewX(-18deg)" },
      ],
      {
        duration: 620,
        delay: index * COVER_STEP_DELAY_MS + 120,
        easing: "ease-out",
        fill: "forwards",
      }
    );
  }

  label?.animate(
    [
      { opacity: 0, transform: "translate(-50%, -44%) scale(0.96)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
    ],
    {
      duration: 360,
      delay: 520,
      easing: "ease-out",
      fill: "forwards",
    }
  );

  veil?.animate(
    [
      { opacity: 0, backdropFilter: "blur(0px) saturate(1)" },
      { opacity: 1, backdropFilter: "blur(28px) saturate(1.24)" },
    ],
    {
      duration: 520,
      delay: 560,
      easing: "ease-out",
      fill: "forwards",
    }
  );
};

const animateReveal = (overlay: HTMLElement, onComplete: () => void) => {
  const { steps, label, veil } = getOverlayParts(overlay);

  label?.animate(
    [
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
      { opacity: 0, transform: "translate(-50%, -56%) scale(0.96)" },
    ],
    {
      duration: 240,
      easing: "ease-in",
      fill: "forwards",
    }
  );

  const animations = steps.map((step, index) =>
    step.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(106%)" },
      ],
      {
        duration: REVEAL_DURATION_MS,
        delay: index * REVEAL_STEP_DELAY_MS,
        easing: "cubic-bezier(0.76, 0, 0.24, 1)",
        fill: "forwards",
      }
    )
  );

  veil?.animate(
    [
      { opacity: 1, backdropFilter: "blur(28px) saturate(1.24)" },
      { opacity: 0.78, backdropFilter: "blur(34px) saturate(1.2)", offset: 0.42 },
      { opacity: 0, backdropFilter: "blur(0px) saturate(1)" },
    ],
    {
      duration: 940,
      delay: 180,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    }
  );

  const lastAnimation = animations.at(-1);
  if (lastAnimation) {
    lastAnimation.finished.then(onComplete).catch(onComplete);
    return;
  }

  onComplete();
};

const animateLearnAppPopup = () => {
  if (localStorage.getItem(POPUP_SEEN_STORAGE_KEY) === "true") {
    return;
  }

  localStorage.setItem(POPUP_SEEN_STORAGE_KEY, "true");
  document.documentElement.classList.add("learn-app-pop-enter");

  window.setTimeout(() => {
    document.documentElement.classList.remove("learn-app-pop-enter");
  }, 980);
};

export const LearnRouteTransition = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isTransitioningRef = useRef(false);
  const overlayRef = useRef<HTMLElement | null>(null);
  const phaseRef = useRef<TransitionPhase>("idle");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !isPlainLeftClick(event)) {
        return;
      }

      const match = findLearnAnchor(event.target);
      if (!match || match.anchor.target || match.anchor.hasAttribute("download")) {
        return;
      }

      if (pathname !== "/" || isTransitioningRef.current) {
        return;
      }

      event.preventDefault();
      isTransitioningRef.current = true;
      phaseRef.current = "covering";
      const transitionTheme = getTransitionTheme();
      sessionStorage.setItem(STORAGE_KEY, "pending");
      sessionStorage.setItem(THEME_STORAGE_KEY, transitionTheme);
      document.documentElement.classList.add("learn-step-transition-active");

      const overlay = createTransitionOverlay("hidden", transitionTheme);
      overlayRef.current?.remove();
      overlayRef.current = overlay;
      document.body.appendChild(overlay);
      animateCover(overlay);

      window.setTimeout(() => {
        phaseRef.current = "covered";
        router.push(`${match.url.pathname}${match.url.search}${match.url.hash}`);
      }, NAVIGATION_DELAY_MS);
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [pathname, router]);

  useEffect(() => {
    if (pathname !== "/learn") {
      return;
    }

    const hasPendingTransition = sessionStorage.getItem(STORAGE_KEY) === "pending";
    if (!overlayRef.current && hasPendingTransition) {
      const storedTheme = sessionStorage.getItem(THEME_STORAGE_KEY);
      const overlay = createTransitionOverlay(
        "covered",
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : getTransitionTheme()
      );
      overlayRef.current = overlay;
      document.body.appendChild(overlay);
      document.documentElement.classList.add("learn-step-transition-active");
    }

    const overlay = overlayRef.current;
    if (!overlay || phaseRef.current === "revealing") {
      return;
    }

    phaseRef.current = "revealing";
    window.setTimeout(() => {
      animateReveal(overlay, () => {
        overlay.remove();
        overlayRef.current = null;
        phaseRef.current = "idle";
        isTransitioningRef.current = false;
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(THEME_STORAGE_KEY);
        document.documentElement.classList.remove("learn-step-transition-active");
        animateLearnAppPopup();
      });
    }, 220);
  }, [pathname]);

  return null;
};
