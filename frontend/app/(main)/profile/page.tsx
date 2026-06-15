import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserProgress } from "@/db/queries";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { ProfileForm } from "./profile-form";
import Image from "next/image";

export const dynamic = "force-dynamic";

const todayMinutes = 43;

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const userProgressData = await getUserProgress();

  // Determine fallback details if userProgress is empty/null
  const userName = userProgressData?.userName || user.name || "Học viên";
  const userImageSrc = userProgressData?.userImageSrc || user.image || "/logo.webp";
  const points = userProgressData?.points ?? 0;
  const hearts = userProgressData?.hearts ?? 5;
  const activeCourse = userProgressData?.activeCourse || {
    title: "Chưa chọn khóa học",
    imageSrc: "/logo.webp",
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_425px] xl:items-start xl:gap-10">
      <FeedWrapper>
        <section className="rounded-[28px] border-2 border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b-2 border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight sm:text-3xl">
                Thông tin hồ sơ
              </h1>
              <p className="mt-1 text-sm font-bold text-slate-400">
                Quản lý thông tin cá nhân và hình đại diện của bạn
              </p>
            </div>
          </div>

          <ProfileForm
            initialName={userName}
            initialImageSrc={userImageSrc}
            email={user.email}
          />
        </section>
      </FeedWrapper>

      <StickyWrapper>
        <div className="rounded-[24px] border-2 border-sky-100 bg-white p-4 shadow-sm">
          <UserProgress
            activeCourse={{
              title: activeCourse.title,
              imageSrc: activeCourse.imageSrc,
            }}
            hearts={hearts}
            points={points}
            todayMinutes={todayMinutes}
          />
        </div>

        <div className="rounded-[24px] border-2 border-sky-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-700 mb-4">
            Thống kê học tập
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-x-3 rounded-2xl border-2 border-orange-100 bg-orange-50/50 p-4">
              <div className="relative size-12 shrink-0">
                <Image src="/points.svg" alt="XP" fill className="object-contain" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-orange-600">
                  Tổng điểm kinh nghiệm
                </p>
                <p className="text-xl font-extrabold text-slate-700">
                  {points} XP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-x-3 rounded-2xl border-2 border-rose-100 bg-rose-50/50 p-4">
              <div className="relative size-12 shrink-0">
                <Image src="/heart.svg" alt="Hearts" fill className="object-contain" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-rose-500">
                  Số tim hiện tại
                </p>
                <p className="text-xl font-extrabold text-slate-700">
                  {hearts} / 5 Tim
                </p>
              </div>
            </div>

            <div className="flex items-center gap-x-3 rounded-2xl border-2 border-sky-100 bg-sky-50/30 p-4">
              <div className="relative size-12 shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex items-center justify-center">
                <div className="relative size-8">
                  <Image
                    src={activeCourse.imageSrc}
                    alt={activeCourse.title}
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Khóa học hiện tại
                </p>
                <p className="text-lg font-extrabold text-slate-700 truncate max-w-[200px]">
                  {activeCourse.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </StickyWrapper>
    </div>
  );
}
