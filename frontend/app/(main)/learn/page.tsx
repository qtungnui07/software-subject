import Image from "next/image";
import Link from "next/link";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { UnitList } from "@/components/unit-list";
import { Button } from "@/components/ui/button";

import { GuideDialog } from "./guide-dialog";
import { Header } from "./header";

const todayMinutes = 43;

const mockUnits = [
  {
    id: 1,
    title: "Bài 1: Nền tảng",
    description:
      "Xây dựng những từ đầu tiên, ngữ pháp đơn giản và các mẫu câu hằng ngày.",
    iconSrc: "/learn.svg",
    progress: 100,
    active: false,
  },
  {
    id: 2,
    title: "Bài 2: Chào hỏi & Giới thiệu",
    description:
      "Luyện cách chào hỏi, giới thiệu bản thân và bắt đầu hội thoại ngắn.",
    iconSrc: "/learn.svg",
    progress: 50,
    active: true,
  },
  {
    id: 3,
    title: "Bài 3: Đồ ăn & Đồ uống",
    description: "Học từ vựng hữu ích khi gọi món và trò chuyện về đồ ăn.",
    iconSrc: "/learn.svg",
    progress: 0,
    active: false,
  },
];

const sidebarCards = [
  {
    title: "Mở khóa Bảng xếp hạng",
    description: "Hoàn thành thêm 3 bài học để bắt đầu thi đua với người học khác.",
    iconSrc: "/leaderboard.svg",
  },
  {
    title: "Nhiệm vụ hằng ngày",
    description: "Kiếm 70 XP hôm nay để giữ nhịp học tập của bạn.",
    iconSrc: "/quests.svg",
  },
];

const LearnPage = () => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_425px] xl:items-start xl:gap-10">
      <FeedWrapper>
        <section className="rounded-[28px] border-2 border-sky-100 bg-white shadow-sm">
          <div className="sticky top-[56px] z-20 rounded-t-[26px] bg-white/95 px-4 backdrop-blur sm:px-6 lg:top-8">
            <Header title="Tiếng Anh" subtitle="Giao tiếp cơ bản" />
          </div>

          <div className="px-4 pb-6 pt-5 sm:px-6 sm:pb-8">
            <div className="relative overflow-hidden rounded-[26px] border-b-4 border-[#0B6FAE] bg-[#1D9BF0] p-5 text-white shadow-[0_16px_32px_rgba(29,155,240,0.22)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/15" />
              <div className="pointer-events-none absolute -bottom-20 right-14 h-36 w-36 rounded-full bg-sky-200/20" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-100">
                    Phần 1, Chương 1
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Giao tiếp cơ bản
                  </h2>
                  <p className="mt-2 max-w-xl text-sm font-bold text-sky-50 sm:text-base">
                    Học những từ đầu tiên bạn cần dùng trong các cuộc trò chuyện hằng ngày.
                  </p>
                </div>

                <GuideDialog />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Lộ trình hiện tại
              </p>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-7">
              <UnitList units={mockUnits} />
            </div>
          </div>
        </section>
      </FeedWrapper>

      <StickyWrapper>
        <div className="rounded-[24px] border-2 border-sky-100 bg-white p-4 shadow-sm">
          <UserProgress
            activeCourse={{ title: "Tiếng Anh", imageSrc: "/globe.svg" }}
            hearts={5}
            points={100}
            todayMinutes={todayMinutes}
          />
        </div>

        {sidebarCards.map((card) => (
          <div
            key={card.title}
            className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50">
                <Image
                  src={card.iconSrc}
                  alt=""
                  width={42}
                  height={42}
                  className="drop-shadow-sm"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-700">{card.title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-700">Tạo hồ sơ</h3>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            Lưu chuỗi ngày học, tiến độ và phần thưởng trên mọi thiết bị.
          </p>
          <div className="mt-5 grid gap-3">
            <Button asChild variant="primary" className="h-12 rounded-2xl">
              <Link href="/sign-up">Tạo hồ sơ</Link>
            </Button>
            <Button asChild variant="primary-outline" className="h-12 rounded-2xl">
              <Link href="/sign-in">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </StickyWrapper>
    </div>
  );
};

export default LearnPage;
