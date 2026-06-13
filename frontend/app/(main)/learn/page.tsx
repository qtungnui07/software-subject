import Image from "next/image";
import Link from "next/link";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { UnitList } from "@/components/unit-list";
import { Button } from "@/components/ui/button";

import { Header } from "./header";

const mockUnits = [
  {
    id: 1,
    title: "Unit 1: The Basics",
    description:
      "Build your first words, simple grammar, and daily phrases.",
    iconSrc: "/learn.svg",
    progress: 100,
    active: false,
  },
  {
    id: 2,
    title: "Unit 2: Greetings & Introductions",
    description:
      "Practice saying hello, introducing yourself, and starting short conversations.",
    iconSrc: "/learn.svg",
    progress: 50,
    active: true,
  },
  {
    id: 3,
    title: "Unit 3: Food & Drinks",
    description: "Learn useful vocabulary for ordering meals and talking about food.",
    iconSrc: "/learn.svg",
    progress: 0,
    active: false,
  },
];

const sidebarCards = [
  {
    title: "Unlock Leaderboard",
    description: "Complete 3 more lessons to start competing with other learners.",
    iconSrc: "/leaderboard.svg",
  },
  {
    title: "Daily Quest",
    description: "Earn 70 XP today to keep your learning rhythm alive.",
    iconSrc: "/quests.svg",
  },
];

const LearnPage = () => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_425px] xl:items-start xl:gap-10">
      <FeedWrapper>
        <section className="overflow-hidden rounded-[28px] border-2 border-sky-100 bg-white shadow-sm">
          <div className="px-4 pt-3 sm:px-6">
            <Header title="Spanish" />
          </div>

          <div className="px-4 pb-6 sm:px-6 sm:pb-8">
            <div className="relative overflow-hidden rounded-[26px] border-b-4 border-[#0B6FAE] bg-[#1D9BF0] p-5 text-white shadow-[0_16px_32px_rgba(29,155,240,0.22)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/15" />
              <div className="pointer-events-none absolute -bottom-20 right-14 h-36 w-36 rounded-full bg-sky-200/20" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-100">
                    Section 1, Chapter 1
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Basic Communication
                  </h2>
                  <p className="mt-2 max-w-xl text-sm font-bold text-sky-50 sm:text-base">
                    Learn the first words you need for simple daily conversations.
                  </p>
                </div>

                <Button
                  asChild
                  variant="primary-outline"
                  className="h-[52px] rounded-2xl px-5 text-[#1486CC] shadow-sm sm:min-w-[148px]"
                >
                  <Link href="/learn">Guide</Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Current path
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
            activeCourse={{ title: "Spanish", imageSrc: "/es.svg" }}
            hearts={5}
            points={100}
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
          <h3 className="text-lg font-black text-slate-700">Create profile</h3>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
            Save your streak, progress, and rewards across all devices.
          </p>
          <div className="mt-5 grid gap-3">
            <Button asChild variant="primary" className="h-12 rounded-2xl">
              <Link href="/sign-up">Create profile</Link>
            </Button>
            <Button asChild variant="primary-outline" className="h-12 rounded-2xl">
              <Link href="/sign-in">Log in</Link>
            </Button>
          </div>
        </div>
      </StickyWrapper>
    </div>
  );
};

export default LearnPage;
