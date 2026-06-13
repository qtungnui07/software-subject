import type { CSSProperties, ElementType } from "react";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  Gamepad2,
  GraduationCap,
  LineChart,
  Medal,
  MessageCircle,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

const languageItems = [
  { label: "Tiếng Anh", code: "us", description: "Giao tiếp cơ bản" },
  { label: "Tiếng Nhật", code: "jp", description: "Bảng chữ cái & mẫu câu" },
  { label: "Tiếng Hàn", code: "kr", description: "Phát âm & hội thoại" },
  { label: "Tiếng Trung", code: "cn", description: "Pinyin & chữ Hán" },
  { label: "Tiếng Pháp", code: "fr", description: "Từ vựng nhập môn" },
  { label: "Tiếng Đức", code: "de", description: "Cấu trúc câu cơ bản" },
];

const courses = [
  {
    title: "Tiếng Anh",
    description: "Lộ trình nền tảng cho người mới, tập trung nghe - nói - từ vựng hằng ngày.",
    lessons: "64 bài học",
    level: "Cơ bản",
    code: "us",
    gradient: "from-sky-50 to-blue-100 dark:from-sky-950/50 dark:to-blue-950/30",
  },
  {
    title: "Tiếng Nhật",
    description: "Học bảng chữ cái, mẫu câu thông dụng và phản xạ giao tiếp từng bước.",
    lessons: "48 bài học",
    level: "Beginner",
    code: "jp",
    gradient: "from-rose-50 to-orange-100 dark:from-rose-950/40 dark:to-orange-950/30",
  },
  {
    title: "Tiếng Hàn",
    description: "Luyện phát âm, từ vựng quen thuộc và hội thoại ngắn dễ áp dụng.",
    lessons: "52 bài học",
    level: "Sơ cấp",
    code: "kr",
    gradient: "from-indigo-50 to-violet-100 dark:from-indigo-950/40 dark:to-violet-950/30",
  },
  {
    title: "Tiếng Trung",
    description: "Làm quen pinyin, chữ Hán cơ bản và các câu giao tiếp thường gặp.",
    lessons: "56 bài học",
    level: "Nhập môn",
    code: "cn",
    gradient: "from-red-50 to-yellow-100 dark:from-red-950/40 dark:to-yellow-950/30",
  },
];

const features: {
  title: string;
  description: string;
  icon: ElementType;
  color: string;
}[] = [
    {
      title: "Bài học ngắn, ít ngán",
      description: "Mỗi bài được chia thành nhiệm vụ nhỏ để người học có thể hoàn thành nhanh nhưng vẫn thấy mình tiến bộ.",
      icon: BookOpen,
      color: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    },
    {
      title: "Streak dựa trên thời gian học thật",
      description: "Robogo không khuyến khích vào điểm danh cho có. Chuỗi học được tính bằng 15–60 phút luyện tập mỗi ngày.",
      icon: Flame,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
    },
    {
      title: "Nhiệm vụ giống game",
      description: "XP, thử thách ngày và phần thưởng nhỏ giúp việc học bớt khô, nhưng không biến nó thành trò chơi vô nghĩa.",
      icon: Gamepad2,
      color: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    },
    {
      title: "Theo dõi tiến độ rõ ràng",
      description: "Người học biết tuần này mình học bao lâu, giữ streak đến đâu và cần làm gì để không rơi nhịp.",
      icon: BarChart3,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
  ];

const streakTiers = [
  {
    title: "Streak Đồng",
    minutes: "15 phút/ngày",
    description: "Mốc nhẹ để bắt đầu đều đặn mà không bị quá tải.",
    icon: "🥉",
    progress: "33%",
    ring: "ring-amber-200 dark:ring-amber-500/30",
  },
  {
    title: "Streak Bạc",
    minutes: "30 phút/ngày",
    description: "Mốc cân bằng cho người muốn học nghiêm túc hơn.",
    icon: "🥈",
    progress: "66%",
    ring: "ring-slate-300 dark:ring-slate-500/40",
  },
  {
    title: "Streak Vàng",
    minutes: "60 phút/ngày",
    description: "Mốc thử thách cho người muốn tăng tốc mỗi tuần.",
    icon: "🥇",
    progress: "100%",
    ring: "ring-yellow-200 dark:ring-yellow-500/30",
  },
];

const weeklyProgress = [
  { day: "T2", minutes: 20, height: "h-16" },
  { day: "T3", minutes: 35, height: "h-24" },
  { day: "T4", minutes: 15, height: "h-12" },
  { day: "T5", minutes: 45, height: "h-32" },
  { day: "T6", minutes: 30, height: "h-20" },
  { day: "T7", minutes: 60, height: "h-40" },
  { day: "CN", minutes: 25, height: "h-16" },
];

const leaderboard = [
  { rank: 1, name: "Minh Anh", xp: "420 XP", badge: "bg-yellow-100 text-yellow-700" },
  { rank: 2, name: "Tuấn", xp: "390 XP", badge: "bg-slate-100 text-slate-700" },
  { rank: 3, name: "Dũng", xp: "360 XP", badge: "bg-orange-100 text-orange-700" },
];

const FlagIcon = ({ code, className = "" }: { code: string; className?: string }) => {
  const baseClass =
    "relative flex h-9 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700";

  if (code === "jp") {
    return (
      <span className={`${baseClass} ${className} items-center justify-center bg-white`}>
        <span className="h-4 w-4 rounded-full bg-red-500" />
      </span>
    );
  }

  if (code === "fr") {
    return (
      <span className={`${baseClass} ${className}`}>
        <span className="h-full flex-1 bg-blue-600" />
        <span className="h-full flex-1 bg-white" />
        <span className="h-full flex-1 bg-red-500" />
      </span>
    );
  }

  if (code === "de") {
    return (
      <span className={`${baseClass} ${className} flex-col`}>
        <span className="h-1/3 w-full bg-slate-950" />
        <span className="h-1/3 w-full bg-red-500" />
        <span className="h-1/3 w-full bg-yellow-300" />
      </span>
    );
  }

  if (code === "cn") {
    return (
      <span className={`${baseClass} ${className} items-start bg-red-600 px-1.5 py-1`}>
        <span className="text-[12px] leading-none text-yellow-300">★</span>
      </span>
    );
  }

  if (code === "kr") {
    return (
      <span className={`${baseClass} ${className} items-center justify-center bg-white`}>
        <span className="h-5 w-5 rounded-full bg-gradient-to-b from-red-500 to-blue-600" />
      </span>
    );
  }

  const usStyle: CSSProperties = {
    background:
      "repeating-linear-gradient(to bottom, #ef4444 0 3px, #ffffff 3px 6px)",
  };

  return (
    <span className={`${baseClass} ${className}`} style={usStyle}>
      <span className="absolute left-0 top-0 h-5 w-6 bg-blue-700" />
    </span>
  );
};

const PrimaryCta = ({ className = "" }: { className?: string }) => {
  return (
    <Link
      href="/sign-up"
      className={`group inline-flex min-h-[60px] items-center justify-center gap-2 rounded-2xl border-b-4 border-[#0B6FAE] bg-[#1D9BF0] px-8 text-base font-black text-white shadow-[0_16px_32px_rgba(29,155,240,0.26)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#1486CC] active:translate-y-0.5 active:border-b-2 ${className}`}
    >
      Bắt đầu miễn phí
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </Link>
  );
};

const SecondaryCta = ({ className = "" }: { className?: string }) => {
  return (
    <Link
      href="/sign-in"
      className={`inline-flex min-h-[60px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 text-base font-black text-[#1486CC] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800 ${className}`}
    >
      Tôi đã có tài khoản
    </Link>
  );
};

const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className="mb-4 inline-flex rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-[#1486CC] dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
        {eyebrow}
      </p>
      <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-lg font-medium leading-8 text-slate-500 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
};

export default function Home() {
  return (
    <main className="w-full overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <style>{`
        @keyframes heroShellGlow {
          0%, 100% {
            box-shadow: 0 28px 90px rgba(15, 23, 42, 0.08), 0 0 0 rgba(29,155,240,0);
            transform: translateY(0);
          }
          50% {
            box-shadow: 0 34px 110px rgba(29,155,240,0.20), 0 0 70px rgba(29,155,240,0.12);
            transform: translateY(-4px);
          }
        }

        @keyframes heroArtFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          25% { transform: translate3d(8px, -14px, 0) rotate(1.2deg) scale(1.015); }
          50% { transform: translate3d(0, -22px, 0) rotate(-0.8deg) scale(1.02); }
          75% { transform: translate3d(-8px, -10px, 0) rotate(0.8deg) scale(1.01); }
        }

        @keyframes floatCardA {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-1.5deg); }
          50% { transform: translate3d(12px, -18px, 0) rotate(1.6deg); }
        }

        @keyframes floatCardB {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(1.2deg); }
          50% { transform: translate3d(-14px, -16px, 0) rotate(-1.4deg); }
        }

        @keyframes floatCardC {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(16px, 10px, 0) rotate(1.5deg); }
        }

        @keyframes popMetric {
          0% { opacity: 0; transform: translateY(26px) scale(.88); }
          70% { opacity: 1; transform: translateY(-6px) scale(1.055); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes metricLivePulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 8px 24px rgba(15,23,42,.06); }
          50% { transform: translateY(-6px); box-shadow: 0 18px 42px rgba(29,155,240,.16); }
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes pillBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes cardRise {
          0% { opacity: 0; transform: translateY(34px) scale(.965); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes cardHoverBreath {
          0%, 100% { box-shadow: 0 8px 24px rgba(15,23,42,.06); }
          50% { box-shadow: 0 18px 44px rgba(29,155,240,.12); }
        }

        @keyframes shineSweep {
          0% { transform: translateX(-140%) rotate(10deg); opacity: 0; }
          18% { opacity: .9; }
          52% { opacity: .35; }
          100% { transform: translateX(160%) rotate(10deg); opacity: 0; }
        }

        @keyframes streakRail {
          0% { transform: scaleX(0); opacity: .35; }
          25%, 100% { transform: scaleX(1); opacity: 1; }
        }

        @keyframes streakDotLoop {
          0% { transform: translateX(0) scale(.7); opacity: 0; }
          12% { opacity: 1; }
          78% { opacity: 1; }
          100% { transform: translateX(260px) scale(1.08); opacity: 0; }
        }

        @keyframes streakCardLoop {
          0% { opacity: 0; transform: translateX(46px) rotate(1.2deg) scale(.96); }
          12% { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
          50% { opacity: 1; transform: translateY(-10px) rotate(-.8deg) scale(1.012); }
          88% { opacity: 1; transform: translateY(0) rotate(.6deg) scale(1); }
          100% { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
        }

        @keyframes streakFillLoop {
          0% { transform: scaleX(0); filter: brightness(1); }
          35% { transform: scaleX(1); filter: brightness(1.18); }
          70% { transform: scaleX(1); filter: brightness(1.42); }
          100% { transform: scaleX(1); filter: brightness(1); }
        }

        @keyframes iconPop {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-7px) scale(1.08); }
        }

        @keyframes dashboardBreath {
          0%, 100% { transform: translateY(0); box-shadow: 0 24px 70px rgba(15,23,42,.14); }
          50% { transform: translateY(-8px); box-shadow: 0 34px 90px rgba(29,155,240,.18); }
        }

        @keyframes chartGrowLoop {
          0% { transform: scaleY(.08); filter: brightness(.9); opacity: .65; }
          28% { transform: scaleY(1.06); filter: brightness(1.15); opacity: 1; }
          40% { transform: scaleY(1); filter: brightness(1.05); opacity: 1; }
          82% { transform: scaleY(1); filter: brightness(1.18); opacity: 1; }
          100% { transform: scaleY(.08); filter: brightness(.95); opacity: .72; }
        }

        @keyframes chartSpark {
          0% { transform: translateY(20px); opacity: 0; }
          25% { opacity: 1; }
          65% { opacity: .8; }
          100% { transform: translateY(-110px); opacity: 0; }
        }

        @keyframes finalGlow {
          0%, 100% { box-shadow: 0 28px 90px rgba(29,155,240,.30); }
          50% { box-shadow: 0 36px 120px rgba(29,155,240,.48); }
        }

        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .dinogo-hero-shell {
          animation: heroShellGlow 6s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .dinogo-hero-art {
          animation: heroArtFloat 6.2s cubic-bezier(.45,0,.25,1) infinite;
          transform-origin: center;
          will-change: transform;
        }

        .dinogo-float-card-a {
          animation: floatCardA 4.4s ease-in-out infinite;
          will-change: transform;
        }

        .dinogo-float-card-b {
          animation: floatCardB 4.8s ease-in-out infinite;
          will-change: transform;
        }

        .dinogo-float-card-c {
          animation: floatCardC 5.2s ease-in-out infinite;
          will-change: transform;
        }

        .dinogo-orbit-ring::before {
          content: "";
          position: absolute;
          inset: 12%;
          border: 2px dashed rgba(29,155,240,.13);
          border-radius: 9999px;
          animation: slowSpin 22s linear infinite;
        }

        .dinogo-metric-pop {
          animation: popMetric 720ms cubic-bezier(.2,1.2,.3,1) both, metricLivePulse 4.8s ease-in-out 1.1s infinite;
          will-change: transform, opacity, box-shadow;
        }

        .dinogo-marquee-track {
          animation: marquee 22s linear infinite;
          will-change: transform;
        }

        .dinogo-marquee-track:hover {
          animation-play-state: paused;
        }

        .dinogo-language-pill {
          animation: pillBounce 4.2s ease-in-out infinite;
          will-change: transform;
        }

        .dinogo-reveal-card {
          animation: cardRise .75s cubic-bezier(.22,1,.36,1) both, cardHoverBreath 5.2s ease-in-out 1.2s infinite;
          will-change: transform, opacity, box-shadow;
        }

        .dinogo-card-shine {
          animation: shineSweep 6.6s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .dinogo-streak-line {
          transform-origin: left center;
          animation: streakRail 3.8s cubic-bezier(.22,1,.36,1) infinite;
          will-change: transform, opacity;
        }

        .dinogo-dot-travel {
          animation: streakDotLoop 3.8s cubic-bezier(.4,0,.2,1) infinite;
          will-change: transform, opacity;
        }

        .dinogo-streak-card {
          animation: streakCardLoop 5.8s cubic-bezier(.22,1,.36,1) infinite;
          will-change: transform, opacity;
        }

        .dinogo-streak-progress {
          transform-origin: left center;
          animation: streakFillLoop 5.8s cubic-bezier(.22,1,.36,1) infinite;
          will-change: transform, filter;
        }

        .dinogo-icon-pop {
          animation: iconPop 3s ease-in-out infinite;
          will-change: transform;
        }

        .dinogo-dashboard-card {
          animation: dashboardBreath 6.2s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .dinogo-chart-bar {
          transform-origin: bottom;
          animation: chartGrowLoop 5.6s cubic-bezier(.22,1,.36,1) infinite;
          will-change: transform, filter, opacity;
        }

        .dinogo-chart-spark {
          animation: chartSpark 3.2s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .dinogo-final-cta {
          animation: finalGlow 4.8s ease-in-out infinite;
          will-change: box-shadow;
        }

        .dinogo-shine {
          animation: shineSweep 4.6s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @media (max-width: 768px) {
          .dinogo-marquee-track {
            animation-duration: 28s;
          }

          .dinogo-hero-art {
            animation-duration: 7s;
          }

          .dinogo-streak-card,
          .dinogo-chart-bar,
          .dinogo-dashboard-card {
            animation-duration: 6.8s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dinogo-marquee-track,
          .dinogo-hero-art,
          .dinogo-float-card-a,
          .dinogo-float-card-b,
          .dinogo-float-card-c,
          .dinogo-streak-card,
          .dinogo-streak-progress,
          .dinogo-chart-bar,
          .dinogo-dashboard-card,
          .dinogo-final-cta {
            animation-duration: 14s !important;
          }

          .dinogo-card-shine,
          .dinogo-shine,
          .dinogo-chart-spark,
          .dinogo-dot-travel {
            animation: none !important;
          }
        }
      `}</style>

      <section className="relative border-b border-slate-100 bg-[radial-gradient(circle_at_12%_18%,#dff4ff_0,transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 pb-16 pt-10 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_12%_18%,rgba(29,155,240,0.22)_0,transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] lg:px-8 lg:pb-20 lg:pt-14">
        <div className="pointer-events-none absolute left-0 top-20 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/10" />
        <div className="pointer-events-none absolute bottom-12 right-10 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/10" />

        <div className="mx-auto grid max-w-[1500px] items-center gap-10 rounded-[2.2rem] border border-sky-100/70 bg-white/75 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur dinogo-hero-shell md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:p-14 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="relative order-2 mx-auto flex min-h-[360px] w-full max-w-[650px] items-center justify-center sm:min-h-[460px] lg:order-1 lg:min-h-[540px]">
            <div className="absolute inset-3 rounded-[2.5rem] bg-gradient-to-br dinogo-orbit-ring from-sky-100 via-white to-blue-50 shadow-inner sm:inset-8 sm:rounded-[3rem] dark:from-sky-950/50 dark:via-slate-900 dark:to-blue-950/40" />
            <div className="absolute left-0 top-7 z-10 rounded-3xl bg-white px-4 py-3 shadow-2xl ring-1 ring-slate-100 dinogo-float-card-a sm:left-2 sm:top-10 sm:px-5 sm:py-4 dark:bg-slate-900 dark:ring-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <Flame className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Streak</p>
                  <p className="text-base font-black text-slate-800 dark:text-white">12 ngày liên tục</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-7 right-0 z-10 rounded-3xl bg-white px-4 py-3 shadow-2xl ring-1 ring-slate-100 dinogo-float-card-b sm:bottom-12 sm:px-5 sm:py-4 dark:bg-slate-900 dark:ring-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
                  <Zap className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Hôm nay</p>
                  <p className="text-base font-black text-slate-800 dark:text-white">+120 XP</p>
                </div>
              </div>
            </div>

            <div className="absolute right-12 top-14 z-10 hidden rounded-3xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-100 dinogo-float-card-c dark:bg-slate-900 dark:ring-slate-800 sm:block">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">15 phút đã hoàn thành</span>
              </div>
            </div>

            <div className="relative h-[310px] w-[310px] dinogo-hero-art sm:h-[430px] sm:w-[430px] md:h-[500px] md:w-[500px] lg:h-[580px] lg:w-[580px]">
              <Image
                src="/hero.svg"
                alt="Nhân vật Dinogo đang học ngôn ngữ"
                fill
                priority
                className="object-contain drop-shadow-[0_28px_38px_rgba(29,155,240,0.18)]"
              />
            </div>
          </div>

          <div className="order-1 mx-auto max-w-3xl text-center lg:order-2 lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-black text-[#1486CC] shadow-sm dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
              <Sparkles className="h-4 w-4" />
              Học đều hơn, bỏ cuộc ít hơn
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950 dark:text-white md:text-6xl xl:text-7xl">
              Biến 15 phút mỗi ngày thành năng lực ngoại ngữ thật.
            </h1>

            <p className="mt-7 max-w-2xl text-lg font-medium leading-9 text-slate-600 dark:text-slate-300 md:text-xl">
              Robogo giúp bạn học ngoại ngữ bằng bài học ngắn, nhiệm vụ giống game và hệ thống streak tính theo thời gian học thật — không chỉ mở app để điểm danh.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <PrimaryCta className="w-full sm:w-auto" />
              <SecondaryCta className="w-full sm:w-auto" />
            </div>

            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ["15+", "phút/ngày"],
                ["4", "khóa chính"],
                ["3M+", "người dùng"],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm dinogo-metric-pop transition-transform hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
                  style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                >
                  <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#075985] py-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-[1500px] overflow-hidden px-4 lg:px-8">
          <div className="flex w-max gap-4 dinogo-marquee-track">
            {[...languageItems, ...languageItems].map((language, index) => (
              <Link
                key={`${language.label}-${index}`}
                href="#courses"
                className="group flex min-w-[220px] items-center gap-4 rounded-2xl border border-white/15 bg-white px-5 py-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-slate-950"
              >
                <FlagIcon code={language.code} />
                <span>
                  <span className="block text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">
                    {language.label}
                  </span>
                  <span className="block text-xs font-bold text-slate-500 group-hover:text-[#1486CC] dark:text-slate-400">
                    {language.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="courses" className="px-4 py-24 dark:bg-slate-950 lg:px-8">
        <SectionHeading
          eyebrow="Catalog khóa học"
          title="Bắt đầu từ ngôn ngữ bạn thích"
          description="Dinogo tập trung vào những lộ trình phổ biến với người học Việt Nam: rõ mục tiêu, dễ bắt đầu và có nhịp học hằng ngày."
        />

        <div className="mx-auto grid max-w-[1500px] gap-6 md:grid-cols-2 xl:grid-cols-4">
          {courses.map((course, index) => (
            <article
              key={course.title}
              className={`group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br ${course.gradient} p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800`}
              style={{ animationDelay: `${index * 0.08}s, ${1 + index * 0.12}s` }}
            >
              <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-white/50 blur-2xl" />
              <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-white/35 blur-xl dinogo-card-shine" />
              <div className="relative flex items-start justify-between gap-4">
                <FlagIcon code={course.code} className="h-12 w-16" />
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase text-slate-500 shadow-sm dark:bg-slate-900/70 dark:text-slate-300">
                  {course.level}
                </span>
              </div>

              <h3 className="relative mt-8 text-2xl font-black text-slate-950 dark:text-white">
                {course.title}
              </h3>
              <p className="relative mt-3 min-h-[96px] text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">
                {course.description}
              </p>

              <div className="relative mt-6 flex items-center justify-between">
                <span className="text-sm font-black text-[#1486CC]">{course.lessons}</span>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1 text-sm font-black text-slate-700 transition-colors group-hover:text-[#1486CC] dark:text-slate-200"
                >
                  Xem lộ trình
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="bg-slate-50 px-4 py-24 dark:bg-slate-900/50 lg:px-8">
        <SectionHeading
          eyebrow="Tính năng nổi bật"
          title="Học như chơi, nhưng tiến bộ thật"
          description="Mục tiêu của Dinogo không phải giữ bạn bấm app cho vui. Mục tiêu là giúp bạn duy trì thời gian học đủ đều để kỹ năng thật sự tăng lên."
        />

        <div className="mx-auto grid max-w-[1500px] gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dinogo-reveal-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-sky-100/40 blur-xl dinogo-card-shine" />
                <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="relative text-xl font-black text-slate-950 dark:text-white">
                  {feature.title}
                </h3>
                <p className="relative mt-3 text-sm font-semibold leading-7 text-slate-500 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="streak" className="relative overflow-hidden bg-[#083c5d] px-4 py-24 text-white lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.35)_0,transparent_28%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.28)_0,transparent_26%)]" />
        <div className="relative mx-auto max-w-[1500px]">
          <div className="grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-sky-200">
                Streak học thật
              </p>
              <h2 className="text-4xl font-black leading-tight md:text-5xl">
                Giữ chuỗi bằng thời gian học, không phải bằng điểm danh.
              </h2>
              <p className="mt-5 text-lg font-medium leading-8 text-sky-100">
                Ba cấp độ Đồng, Bạc, Vàng giúp người học chọn nhịp phù hợp: bắt đầu nhẹ, tăng đều, rồi duy trì lâu dài mà không bị quá sức.
              </p>
            </div>

            <div className="relative grid gap-5 md:grid-cols-3">
              <div className="pointer-events-none absolute left-8 right-8 top-10 hidden h-1 origin-left rounded-full bg-white/20 dinogo-streak-line md:block" />
              <div className="pointer-events-none absolute left-8 top-[2.35rem] hidden h-3 w-3 rounded-full bg-sky-200 shadow-[0_0_18px_rgba(186,230,253,.9)] dinogo-dot-travel md:block" />
              {streakTiers.map((tier, index) => (
                <article
                  key={tier.title}
                  className={`rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl ring-4 dinogo-streak-card ${tier.ring} transition-transform duration-300 hover:-translate-y-2 dark:bg-slate-950 dark:text-white`}
                  style={{
                    animationDelay: `${index * 0.42}s`,
                  }}
                >
                  <div className="mb-5 text-5xl dinogo-icon-pop">
                    {tier.icon}
                  </div>
                  <h3 className="text-xl font-black">{tier.title}</h3>
                  <p className="mt-1 text-sm font-black text-[#1486CC]">{tier.minutes}</p>
                  <p className="mt-4 min-h-[72px] text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">
                    {tier.description}
                  </p>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full origin-left rounded-full bg-[#1D9BF0] shadow-[0_0_18px_rgba(29,155,240,0.45)] dinogo-streak-progress"
                      style={{
                        width: tier.progress,
                        animationDelay: `${0.2 + index * 0.45}s`,
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="progress" className="px-4 py-24 dark:bg-slate-950 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-[#1486CC] dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
              Theo dõi tiến độ
            </p>
            <h2 className="text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-5xl">
              Nhìn thấy mình đang tiến bộ từng tuần.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-500 dark:text-slate-300">
              Dinogo gom thời gian học, mục tiêu ngày, XP và streak vào một dashboard dễ hiểu, để người học biết mình đang tiến bộ thật chứ không chỉ hoàn thành nhiệm vụ cho có.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [Target, "Mục tiêu ngày", "Chọn 15, 30 hoặc 60 phút."],
                [LineChart, "Biểu đồ học", "Theo dõi nhịp học trong tuần."],
              ].map(([Icon, title, text]) => {
                const TypedIcon = Icon as ElementType;
                return (
                  <div key={title as string} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <TypedIcon className="h-7 w-7 text-[#1486CC]" />
                    <h3 className="mt-4 font-black text-slate-950 dark:text-white">{title as string}</h3>
                    <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-300">{text as string}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl dinogo-dashboard-card dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase text-slate-400">Tuần này</p>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white">235 phút học</h3>
              </div>
              <div className="rounded-2xl bg-sky-50 px-4 py-2 text-sm font-black text-[#1486CC] dark:bg-sky-500/10 dark:text-sky-300">
                +32% so với tuần trước
              </div>
            </div>

            <div className="relative flex h-56 items-end justify-between gap-2 overflow-hidden rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-950 sm:gap-3 sm:p-5">
              <div className="pointer-events-none absolute inset-x-5 top-1/4 border-t border-slate-200/70 dark:border-slate-800" />
              <div className="pointer-events-none absolute inset-x-5 top-1/2 border-t border-slate-200/70 dark:border-slate-800" />
              <div className="pointer-events-none absolute inset-x-5 top-3/4 border-t border-slate-200/70 dark:border-slate-800" />
              <div className="pointer-events-none absolute bottom-9 left-[18%] h-2 w-2 rounded-full bg-sky-300/80 dinogo-chart-spark" />
              <div className="pointer-events-none absolute bottom-11 left-[52%] h-2 w-2 rounded-full bg-sky-300/80 dinogo-chart-spark" style={{ animationDelay: "1.1s" }} />
              <div className="pointer-events-none absolute bottom-8 left-[78%] h-2 w-2 rounded-full bg-sky-300/80 dinogo-chart-spark" style={{ animationDelay: "2s" }} />
              {weeklyProgress.map((item, index) => (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-40 items-end">
                    <div
                      title={`${item.minutes} phút`}
                      className={`${item.height} w-6 origin-bottom rounded-t-2xl bg-gradient-to-t from-[#1486CC] to-sky-300 shadow-lg dinogo-chart-bar transition-all hover:scale-105 sm:w-10`}
                      style={{
                        animationDelay: `${index * 0.18}s`,
                      }}
                    />
                  </div>
                  <p className="text-xs font-black text-slate-500 dark:text-slate-400">{item.day}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["12", "ngày streak"],
                ["840", "XP tháng"],
                ["7/7", "ngày học"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-950">
                  <p className="text-xl font-black text-slate-950 dark:text-white">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="bg-slate-50 px-4 py-24 dark:bg-slate-900/50 lg:px-8">
        <SectionHeading
          eyebrow="Cộng đồng"
          title="Học một mình rất dễ bỏ. Học cùng nhau thì dễ quay lại hơn."
          description="Dinogo dùng bảng xếp hạng, thử thách nhóm và bạn học cùng mục tiêu để tạo động lực vừa đủ, không biến việc học thành áp lực."
        />

        <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase text-slate-400">Bảng xếp hạng tuần</p>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white">Nhóm học Tiếng Anh</h3>
              </div>
              <Trophy className="h-9 w-9 text-yellow-500" />
            </div>

            <div className="space-y-3">
              {leaderboard.map((member) => (
                <div key={member.rank} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${member.badge}`}>
                      #{member.rank}
                    </span>
                    <div>
                      <p className="font-black text-slate-950 dark:text-white">{member.name}</p>
                      <p className="text-xs font-bold text-slate-400">Đang giữ streak</p>
                    </div>
                  </div>
                  <p className="font-black text-[#1486CC]">{member.xp}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              [Users, "Bạn học cùng mục tiêu", "Tìm người học cùng ngôn ngữ để duy trì nhịp mỗi ngày."],
              [MessageCircle, "Thử thách nhóm", "Hoàn thành mục tiêu tuần để mở huy hiệu và phần thưởng."],
              [Medal, "Huy hiệu thành tích", "Ghi nhận những cột mốc nhỏ để người học không mất động lực."],
              [Rocket, "Lộ trình tăng dần", "Bắt đầu nhẹ, tăng độ khó theo thời gian học và kết quả."],
            ].map(([Icon, title, text]) => {
              const TypedIcon = Icon as ElementType;
              return (
                <article key={title as string} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
                  <TypedIcon className="h-8 w-8 text-[#1486CC]" />
                  <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">{title as string}</h3>
                  <p className="relative mt-3 text-sm font-semibold leading-7 text-slate-500 dark:text-slate-300">{text as string}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 dark:bg-slate-950 lg:px-8">
        <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2.5rem] bg-[#1D9BF0] p-10 text-center shadow-[0_28px_90px_rgba(29,155,240,0.32)] dinogo-final-cta md:p-16">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-white/10 blur-3xl dinogo-shine" />
          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 text-white">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Sẵn sàng học đều mỗi ngày?
            </h2>
            <p className="mt-5 text-lg font-semibold leading-8 text-sky-50">
              Bắt đầu miễn phí với Dinogo và biến việc học ngoại ngữ thành một thói quen có thể giữ lâu dài.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex min-h-[60px] items-center justify-center rounded-2xl border-b-4 border-slate-200 bg-white px-8 text-base font-black text-[#1486CC] shadow-xl transition-all hover:-translate-y-1 active:translate-y-0.5 active:border-b-2"
              >
                Bắt đầu miễn phí
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex min-h-[60px] items-center justify-center rounded-2xl border-2 border-white/40 px-8 text-base font-black text-white transition-all hover:-translate-y-1 hover:bg-white/10"
              >
                Tôi đã có tài khoản
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
