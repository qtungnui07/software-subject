import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { profileData } from "@/data/profile-data";
import { englishProgressCourse } from "@/data/progress-data";
import { getCourseProgressSummary } from "@/lib/progress-utils";

const formatJoinedDate = (dateValue: string) => {
  const [year, month, day] = dateValue.split("-");

  return `${day}/${month}/${year}`;
};

const ProfilePage = () => {
  const { user, currentCourse, achievements } = profileData;
  const courseProgress = getCourseProgressSummary(englishProgressCourse);

  const quickStats = [
    {
      label: "Streak",
      value: `${profileData.learningStats.streakDays} ngày`,
      description: "Giữ nhịp học đều",
      icon: "🔥",
      tone: "border-orange-100 bg-orange-50 text-orange-600",
    },
    {
      label: "XP",
      value: `${courseProgress.earnedXp} XP`,
      description: "Điểm kinh nghiệm",
      icon: "⚡",
      tone: "border-sky-100 bg-sky-50 text-sky-600",
    },
    {
      label: "Hôm nay",
      value: `${profileData.learningStats.todayMinutes} phút`,
      description: "Thời gian học",
      icon: "⏱️",
      tone: "border-emerald-100 bg-emerald-50 text-emerald-600",
    },
    {
      label: "Bài học",
      value: `${courseProgress.completedLessons} / ${courseProgress.totalLessons}`,
      description: "Đã hoàn thành",
      icon: "📘",
      tone: "border-violet-100 bg-violet-50 text-violet-600",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border-2 border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-sm">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center lg:p-8">
          <div>
            <div className="inline-flex rounded-full border-2 border-sky-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-600 shadow-sm">
              Hồ sơ học tập
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl lg:text-5xl">
              Theo dõi hành trình học của bạn
            </h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-slate-500 sm:text-lg">
              Xem thông tin cá nhân, khóa học đang theo đuổi và các chỉ số học tập quan trọng của bạn trên Robogo.
            </p>
          </div>

          <div className="rounded-[28px] border-2 border-white bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-4 lg:flex-col lg:text-center">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-[28px] border-4 border-sky-100 bg-white p-3 shadow-sm sm:size-28">
                <Image
                  src={user.avatarSrc}
                  alt={`${user.displayName} avatar`}
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{user.displayName}</p>
                <p className="mt-1 text-sm font-bold text-slate-400">@{user.username}</p>
                <div className="mt-3 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
                  {user.rankLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <article className="rounded-[28px] border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-[28px] border-4 border-sky-100 bg-sky-50 p-3 shadow-sm">
                <Image
                  src={user.avatarSrc}
                  alt="Ảnh đại diện"
                  fill
                  className="object-contain p-2"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-3xl font-black text-slate-800">{user.displayName}</h2>
                  <span className="rounded-full border-2 border-sky-100 bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-600">
                    {user.roleLabel}
                  </span>
                </div>
                <p className="mt-2 break-all text-sm font-bold text-slate-400">{user.email}</p>
                <p className="mt-3 text-sm font-bold text-slate-500">
                  Tham gia Robogo từ{" "}
                  <span className="text-slate-700">{formatJoinedDate(user.joinedAt)}</span>
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border-2 border-sky-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">
                  Khóa học hiện tại
                </p>
                <h2 className="mt-3 text-2xl font-black text-slate-800">
                  {currentCourse.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-500">
                  {currentCourse.description}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                <span className="rounded-full border-2 border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-600">
                  {currentCourse.statusLabel}
                </span>
                <span className="rounded-full border-2 border-slate-100 bg-slate-50 px-4 py-2 text-sm font-black text-slate-500">
                  {currentCourse.level}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border-2 border-sky-100 bg-sky-50/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-500">
                    Tiến độ khóa học
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {courseProgress.completedLessons} / {courseProgress.totalLessons} bài học đã hoàn thành
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2 text-lg font-black text-sky-600 shadow-sm">
                  {courseProgress.completionPercent}%
                </div>
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-white shadow-inner">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-700 ease-out"
                  style={{ width: `${courseProgress.completionPercent}%` }}
                />
              </div>

              <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">
                {courseProgress.completedLessons} bài đã xong · {courseProgress.currentLessons} bài đang học · {courseProgress.lockedLessons} bài đang khóa
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Ngôn ngữ</p>
                <p className="mt-2 text-lg font-black text-slate-700">{currentCourse.language}</p>
              </div>
              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Mục tiêu ngày</p>
                <p className="mt-2 text-lg font-black text-slate-700">
                  {profileData.learningStats.dailyGoalMinutes} phút
                </p>
              </div>
              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Mục tiêu tuần</p>
                <p className="mt-2 text-lg font-black text-slate-700">
                  {profileData.learningStats.weeklyGoalMinutes} phút
                </p>
              </div>
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-[28px] border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">
                  Tổng quan
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-800">Thống kê học tập</h2>
              </div>
              <Button asChild variant="primary-outline" className="hidden rounded-2xl sm:inline-flex">
                <Link href="/learn">Tiếp tục học</Link>
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border-2 p-4 ${stat.tone}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide opacity-80">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-xl font-black text-slate-800">{stat.value}</p>
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

          <article className="rounded-[28px] border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">
              Thành tựu
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-800">Mở khóa gần đây</h2>

            <div className="mt-5 space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50/60 p-4"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    {achievement.icon}
                  </div>
                  <div>
                    <p className="font-black text-slate-700">{achievement.title}</p>
                    <p className="mt-1 text-sm font-bold leading-5 text-slate-500">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
};

export default ProfilePage;
