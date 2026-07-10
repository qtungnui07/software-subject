import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { ProfileForm } from "./profile-form";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { getLearningProfileStats } from "@/lib/learning/profile-stats";
import { getCourseProgressForUser } from "@/services/course-progress-service";
import { getUserXpSummary } from "@/services/xp-service";
import { ProfileLearningProgress } from "./profile-learning-progress";
import { requireProfile, type Profile } from "@/services/profile-service";
import { ProfileXpPanel } from "@/components/profile/profile-xp-panel";

const ProfilePage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;
  let profile: Profile | null = null;
  try {
    profile = await requireProfile(user.id);
  } catch (error) {
    console.error("Failed to load user profile:", error);
  }

  const [genericCourseProgress, xpSummary] = await Promise.all([
    getCourseProgressForUser(user.id).catch((error) => {
      console.error("Failed to load generic course progress:", error);
      return createDefaultCourseProgress();
    }),
    getUserXpSummary({ userId: user.id }).catch(() => null),
  ]);
  const courseProgress = getLearningProfileStats(genericCourseProgress);

  const displayName = profile?.name || user.name || "User";
  const avatarSrc = profile?.imageSrc || user.image || "/logo.webp";
  const email = profile?.email || user.email || "";

  const quickStats = [
    {
      label: "Hearts",
      value: `${profile?.hearts ?? 5} ❤️`,
      description: "Mạng còn lại",
      icon: "❤️",
      tone: "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-950/40 dark:bg-rose-950/20 dark:text-rose-400",
    },
    {
      label: "Points",
      value: `${xpSummary?.totalXp ?? profile?.points ?? 0} XP`,
      description: "Điểm kinh nghiệm",
      icon: "⚡",
      tone: "border-sky-100 bg-sky-50 text-sky-600 dark:border-sky-950/40 dark:bg-sky-950/20 dark:text-sky-400",
    },
    {
      label: "Bài học",
      value: <ProfileLearningProgress variant="lessons" />,
      description: "Đã hoàn thành",
      icon: "📘",
      tone: "border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-950/40 dark:bg-violet-950/20 dark:text-violet-400",
    },
    {
      label: "Phần hiện tại",
      value: courseProgress.currentSectionTitle,
      description: `${courseProgress.unlockedSections}/3 phần đã mở`,
      icon: "🌍",
      tone: "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border-2 border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-sm dark:border-slate-800 dark:from-slate-900/60 dark:via-slate-900/60 dark:to-slate-950/60">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center lg:p-8">
          <div>
            <div className="inline-flex rounded-full border-2 border-sky-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-sky-400">
              Hồ sơ học tập
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl lg:text-5xl">
              Xin chào, {displayName}!
            </h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-slate-500 dark:text-slate-400 sm:text-lg">
              Xem và cập nhật thông tin cá nhân, khóa học đang theo đuổi và các chỉ số học tập của bạn trên Robogo.
            </p>
          </div>

          <div className="rounded-[28px] border-2 border-white bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center gap-4 lg:flex-col lg:text-center">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-[28px] border-4 border-sky-100 bg-white p-3 shadow-sm sm:size-28 dark:border-slate-800 dark:bg-slate-950">
                <Image
                  src={avatarSrc}
                  alt={`${displayName} avatar`}
                  fill
                  className="object-contain p-2"
                  priority
                  unoptimized={avatarSrc.startsWith("http")}
                />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{displayName}</p>
                <p className="mt-1 text-sm font-bold text-slate-400 dark:text-slate-500">{email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          {/* Profile Edit Form */}
          <article className="rounded-[28px] border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">
              Thông tin cá nhân
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-800 dark:text-slate-100">Chỉnh sửa hồ sơ</h2>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
              Cập nhật tên hiển thị và ảnh đại diện của bạn.
            </p>

            <div className="mt-6">
              <ProfileForm
                initialName={displayName}
                initialImageSrc={avatarSrc}
                email={email}
              />
            </div>
          </article>

          {/* Current Course */}
          {profile?.activeCourse && (
            <article className="rounded-[28px] border-2 border-sky-100 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">
                    Khóa học hiện tại
                  </p>
                  <h2 className="mt-3 text-2xl font-black text-slate-800 dark:text-slate-100">
                    {profile.activeCourse.title}
                  </h2>
                </div>

                <span className="shrink-0 rounded-full border-2 border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-600 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                  Đang học
                </span>
              </div>

              <div className="mt-6 rounded-[24px] border-2 border-sky-100 bg-sky-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-500">
                      Tiến độ khóa học
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                      <ProfileLearningProgress variant="lessonsWithLabel" />
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-lg font-black text-sky-600 shadow-sm dark:bg-slate-950 dark:text-sky-400">
                    <ProfileLearningProgress variant="percent" />
                  </div>
                </div>

                <div className="mt-4 h-4 overflow-hidden rounded-full bg-white shadow-inner dark:bg-slate-950">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-700 ease-out"
                    style={{ width: "var(--profile-course-progress-percent, 0%)" }}
                  />
                </div>
              </div>

              <div className="mt-5">
                <Button asChild variant="primary-outline" className="rounded-2xl">
                  <Link href="/learn">Tiếp tục học</Link>
                </Button>
              </div>
            </article>
          )}
        </div>

        <aside className="space-y-6">
          <ProfileXpPanel />

          <article className="rounded-[28px] border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">
                  Tổng quan
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-800 dark:text-slate-100">Thống kê học tập</h2>
              </div>
              <Button asChild variant="primary-outline" className="hidden rounded-2xl sm:inline-flex">
                <Link href="/learn">Tiếp tục học</Link>
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border-2 p-4 ${stat.tone}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-slate-950">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide opacity-80">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-xl font-black text-slate-800 dark:text-slate-200">{stat.value}</p>
                      <p className="mt-1 text-xs font-bold opacity-80">{stat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild variant="primary" className="mt-5 h-12 w-full rounded-2xl sm:hidden">
              <Link href="/learn">Tiếp tục học</Link>
            </Button>
          </article>
        </aside>
      </section>
    </main>
  );
};

export default ProfilePage;
