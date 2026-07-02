"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Gift,
  Lock,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { UserProgress } from "@/components/user-progress";
import { lessonNodes, type LessonNode } from "@/constants/lessons";
import {
  claimChapterOneChest,
  getChapterOneNodeStatus,
  getChapterOneProgress,
  getInitialChapterOneProgress,
  setChapterOneProgressOwner,
  subscribeChapterOneProgress,
  type ChapterOneNodeStatus,
  type ChapterOneProgressState,
} from "@/lib/chapter-one-progress";

const LESSON_OBJECTIVES: Record<number, string[]> = {
  1: [
    "Làm quen với các từ vựng tiếng Anh cơ bản và cực ngắn.",
    "Luyện kỹ năng nghe và nhận dạng phát âm chuẩn của từ mới.",
    "Hình thành phản xạ chọn đáp án đúng trong hội thoại đơn giản.",
  ],
  2: [
    "Học các mẫu câu chào hỏi và tạm biệt thông dụng hằng ngày.",
    "Thực hành kỹ năng nghe và phản xạ nhanh các hội thoại giao tiếp cơ bản.",
    "Tự tin sử dụng từ vựng chào hỏi trong các tình huống thực tế.",
  ],
  3: [
    "Học cách giới thiệu bản thân cơ bản (tên, tuổi, quốc gia).",
    "Luyện hỏi và trả lời thông tin cá nhân của người đối diện.",
    "Xây dựng vốn từ vựng liên quan đến giới thiệu làm quen.",
  ],
  4: [
    "Nhận phần thưởng sau khi hoàn thành 3 bài đầu tiên.",
    "Xác nhận rương thưởng để mở phần tiếp theo của lộ trình.",
    "Giữ trạng thái tiến độ ổn định trước khi sang Bài 4.",
  ],
  5: [
    "Luyện các câu hỏi đơn giản trong cuộc trò chuyện hằng ngày.",
    "Học cách hỏi tên, tuổi và phản hồi ngắn.",
    "Củng cố phản xạ giao tiếp cơ bản.",
  ],
  6: [
    "Luyện phản xạ nghe nhanh và chọn từ chính xác.",
    "Cải thiện khả năng phân biệt các âm tiết dễ nhầm lẫn.",
    "Tăng cường độ tập trung và phản xạ nghe hiểu.",
  ],
  7: [
    "Hệ thống hóa toàn bộ từ vựng đã học trong chương.",
    "Ôn luyện lại các mẫu câu giao tiếp cơ bản.",
    "Đánh giá lại những phần kiến thức chưa vững.",
  ],
  8: [
    "Hoàn thành bài kiểm tra đánh giá năng lực cuối chương.",
    "Kiểm thử khả năng ghi nhớ và áp dụng thực tế.",
    "Đưa tiến độ Chương 1 lên 100% khi vượt qua kiểm tra.",
  ],
};

const DEFAULT_OBJECTIVES = [
  "Học các từ vựng mới liên quan đến chủ đề bài học.",
  "Luyện tập kỹ năng nghe và chọn đáp án chính xác.",
  "Luyện tập kỹ năng phản xạ và hoàn thành bài học đạt điểm số cao.",
];

type ActiveCoursePreview = {
  title: string;
  imageSrc: string;
};

type Props = {
  lessonNodeId: string;
  activeCourse: ActiveCoursePreview;
  hearts: number;
  points: number;
  progressOwnerId: string | null;
};

type DetailStatusView = {
  statusLabel: string;
  statusColor: string;
  statusDesc: string;
  StatusIcon: LucideIcon;
  ctaText: string;
  ctaVariant: "primary" | "secondary" | "danger" | "super" | "default";
  isCtaDisabled: boolean;
};

const getDetailStatusView = (
  lesson: LessonNode,
  status: ChapterOneNodeStatus
): DetailStatusView => {
  if (status === "completed") {
    if (lesson.type === "chest") {
      return {
        statusLabel: "Đã nhận rương",
        statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
        statusDesc: "Bạn đã nhận phần thưởng của rương này. Bài học tiếp theo đã được mở khóa.",
        StatusIcon: CheckCircle,
        ctaText: "Đã nhận",
        ctaVariant: "secondary",
        isCtaDisabled: true,
      };
    }

    return {
      statusLabel: "Đã hoàn thành",
      statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      statusDesc: "Bạn đã hoàn thành bài này. Bạn có thể ôn luyện lại bất cứ lúc nào để củng cố kiến thức.",
      StatusIcon: CheckCircle,
      ctaText: lesson.type === "checkpoint" ? "Làm lại kiểm tra" : "Ôn tập lại",
      ctaVariant: "secondary",
      isCtaDisabled: false,
    };
  }

  if (status === "current") {
    return {
      statusLabel: lesson.type === "checkpoint" ? "Kiểm tra cuối chương" : "Đang học",
      statusColor:
        lesson.type === "checkpoint"
          ? "bg-amber-100 text-amber-700 border-amber-200"
          : "bg-sky-100 text-sky-700 border-sky-200",
      statusDesc:
        lesson.type === "checkpoint"
          ? "Đây là bài kiểm tra tổng hợp để hoàn thành Chương 1. Hãy vượt qua để đạt 100% tiến độ."
          : "Đây là bài học hiện tại của bạn. Hãy hoàn thành bài này để tiến sâu hơn vào lộ trình học tập.",
      StatusIcon: lesson.type === "checkpoint" ? Trophy : Star,
      ctaText: lesson.type === "checkpoint" ? "Bắt đầu kiểm tra" : "Bắt đầu học",
      ctaVariant: lesson.type === "checkpoint" ? "secondary" : "primary",
      isCtaDisabled: false,
    };
  }

  if (status === "available") {
    return {
      statusLabel: "Rương sẵn sàng",
      statusColor: "bg-amber-100 text-amber-700 border-amber-200",
      statusDesc: "Rương đã mở. Nhận phần thưởng này để mở Bài 4 trong lộ trình Chương 1.",
      StatusIcon: Gift,
      ctaText: "Nhận thưởng",
      ctaVariant: "super",
      isCtaDisabled: false,
    };
  }

  if (lesson.type === "chest") {
    return {
      statusLabel: "Rương đã khóa",
      statusColor: "bg-slate-100 text-slate-500 border-slate-200",
      statusDesc: "Rương này sẽ mở sau khi bạn hoàn thành Bài 3.",
      StatusIcon: Gift,
      ctaText: "Chưa mở khóa",
      ctaVariant: "default",
      isCtaDisabled: true,
    };
  }

  if (lesson.type === "checkpoint") {
    return {
      statusLabel: "Kiểm tra đã khóa",
      statusColor: "bg-slate-100 text-slate-500 border-slate-200",
      statusDesc: "Bài kiểm tra cuối chương chỉ mở sau khi bạn hoàn thành Bài 6.",
      StatusIcon: Trophy,
      ctaText: "Chưa mở khóa",
      ctaVariant: "default",
      isCtaDisabled: true,
    };
  }

  return {
    statusLabel: "Đã khóa",
    statusColor: "bg-slate-100 text-slate-500 border-slate-200",
    statusDesc: "Bài học này hiện chưa được mở khóa. Hãy hoàn thành các bài học trước đó trong chương để tiếp tục.",
    StatusIcon: Lock,
    ctaText: "Đã bị khóa",
    ctaVariant: "default",
    isCtaDisabled: true,
  };
};

export const ChapterOneLessonDetailClient = ({
  lessonNodeId,
  activeCourse,
  hearts,
  points,
  progressOwnerId,
}: Props) => {
  const [progressState, setProgressState] = useState<ChapterOneProgressState>(
    getInitialChapterOneProgress
  );

  useEffect(() => {
    setChapterOneProgressOwner(progressOwnerId);

    const syncProgress = () => setProgressState(getChapterOneProgress());

    syncProgress();

    return subscribeChapterOneProgress(syncProgress);
  }, [progressOwnerId]);

  const lesson = lessonNodes.find((node) => node.nodeId === lessonNodeId);

  if (!lesson) return null;

  const status = getChapterOneNodeStatus(lesson.nodeId, progressState);
  const objectives = LESSON_OBJECTIVES[lesson.id] || DEFAULT_OBJECTIVES;
  const {
    statusLabel,
    statusColor,
    statusDesc,
    StatusIcon,
    ctaText,
    ctaVariant,
    isCtaDisabled,
  } = getDetailStatusView(lesson, status);

  const isChestAction = lesson.type === "chest" && status === "available";
  const isCompleted = status === "completed";
  const isLocked = status === "locked";
  const playerHref = `/lesson?id=${lesson.nodeId}`;

  const handleClaimChest = () => {
    const nextState = claimChapterOneChest(lesson.nodeId);
    setProgressState(nextState);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_425px] xl:items-start xl:gap-10">
      <FeedWrapper>
        <div className="rounded-[28px] border-2 border-sky-100 bg-white p-6 md:p-8 shadow-sm">
          <Link
            href="/learn"
            className="group inline-flex items-center gap-2 text-xs font-black tracking-wider text-slate-400 hover:text-slate-600 transition mb-6 uppercase"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3.5] transition group-hover:-translate-x-0.5" />
            Quay lại lộ trình
          </Link>

          <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-6 mb-8 pb-6 border-b-2 border-slate-100">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border-2 shadow-sm ${
                isCompleted
                  ? "bg-emerald-50 border-emerald-200 text-emerald-500"
                  : status === "current"
                    ? "bg-sky-50 border-sky-200 text-[#1486CC] animate-pulse"
                    : status === "available"
                      ? "bg-amber-50 border-amber-200 text-amber-500 animate-pulse"
                      : lesson.type === "checkpoint"
                        ? "bg-amber-50 border-amber-200 text-amber-500"
                        : lesson.type === "chest"
                          ? "bg-purple-50 border-purple-200 text-purple-500"
                          : "bg-slate-100 border-slate-200 text-slate-400"
              }`}
            >
              <StatusIcon className="h-10 w-10 stroke-[3]" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wide rounded-full border ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-800 mt-3 leading-tight">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Mô tả bài học
            </h3>
            <p className="mt-2 text-base font-bold text-slate-600 leading-relaxed">
              {lesson.description}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Mục tiêu học tập
            </h3>
            <ul className="mt-3 space-y-3">
              {objectives.map((obj) => (
                <li key={obj} className="flex items-start gap-3 text-sm font-bold text-slate-600 leading-relaxed">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                      isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-sky-100 text-sky-600"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 mb-8 ${
              isCompleted
                ? "bg-emerald-50/50 border-emerald-100 text-slate-600"
                : status === "current"
                  ? "bg-sky-50/50 border-sky-100 text-slate-600"
                  : status === "available"
                    ? "bg-amber-50/40 border-amber-100 text-slate-600"
                    : isLocked
                      ? "bg-slate-50 border-slate-100 text-slate-500"
                      : "bg-purple-50/30 border-purple-100 text-slate-600"
            }`}
          >
            <p className="text-sm font-bold leading-relaxed">{statusDesc}</p>
          </div>

          {lesson.xp > 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-orange-100 bg-orange-50/50 p-4 mb-8">
              <Image src="/points.svg" height={32} width={32} alt="XP" />
              <div>
                <h4 className="text-sm font-black text-orange-600">Điểm kinh nghiệm nhận được</h4>
                <p className="text-xs font-bold text-orange-500">
                  Hoàn thành thử thách để nhận +{lesson.xp} XP tích lũy
                </p>
              </div>
            </div>
          ) : null}

          {isCtaDisabled ? (
            <Button variant="default" disabled className="w-full h-12 rounded-2xl">
              <Lock className="mr-2 h-5 w-5 stroke-[2.5]" />
              {ctaText}
            </Button>
          ) : isChestAction ? (
            <Button
              type="button"
              variant={ctaVariant}
              className="w-full h-12 rounded-2xl"
              onClick={handleClaimChest}
            >
              <Gift className="mr-2 h-5 w-5 stroke-[2.5]" />
              {ctaText}
            </Button>
          ) : (
            <Button variant={ctaVariant} className="w-full h-12 rounded-2xl" asChild>
              <Link href={playerHref}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 stroke-[2.5]" />
              </Link>
            </Button>
          )}
        </div>
      </FeedWrapper>

      <StickyWrapper>
        <div className="rounded-[24px] border-2 border-sky-100 bg-white p-4 shadow-sm">
          <UserProgress
            activeCourse={{ title: activeCourse.title, imageSrc: activeCourse.imageSrc }}
            hearts={hearts}
            points={points}
          />
        </div>
      </StickyWrapper>
    </div>
  );
};
