import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Lock, Star, Trophy, Gift, ArrowRight, Play, CheckCircle } from "lucide-react";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Button } from "@/components/ui/button";
import { lessonNodes } from "@/constants/lessons";
import { getUserProgress } from "@/db/queries";

type Props = {
  params: Promise<{
    lessonId: string;
  }>;
};

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
    "Mở rộng vốn từ vựng về giao tiếp hàng ngày.",
    "Rèn luyện cấu trúc câu hỏi han sức khỏe và công việc.",
    "Nâng cao sự tự tin khi nói chuyện trực tiếp.",
  ],
  5: [
    "Luyện phản xạ nghe nhanh và chọn từ chính xác.",
    "Cải thiện khả năng phân biệt các âm tiết dễ nhầm lẫn.",
    "Tăng cường độ tập trung và phản xạ nghe hiểu.",
  ],
  6: [
    "Hệ thống hóa toàn bộ từ vựng đã học trong chương.",
    "Ôn luyện lại các mẫu câu giao tiếp cơ bản.",
    "Đánh giá lại những phần kiến thức chưa vững.",
  ],
  7: [
    "Chuẩn bị kỹ năng làm bài kiểm tra tổng hợp.",
    "Tổng ôn kiến thức ngữ pháp và phản xạ nghe nói.",
    "Nâng cao điểm số và tự tin trước khi thi chương.",
  ],
  8: [
    "Hoàn thành bài kiểm tra đánh giá năng lực cuối chương.",
    "Kiểm thử khả năng ghi nhớ và áp dụng thực tế.",
    "Mở khóa chương mới tiếp theo của lộ trình.",
  ],
};

const DEFAULT_OBJECTIVES = [
  "Học các từ vựng mới liên quan đến chủ đề bài học.",
  "Luyện tập kỹ năng nghe và chọn đáp án chính xác.",
  "Luyện tập kỹ năng phản xạ và hoàn thành bài học đạt điểm số cao.",
];

const LessonDetailPage = async ({ params }: Props) => {
  const { lessonId } = await params;
  const id = parseInt(lessonId, 10);
  const lesson = lessonNodes.find((node) => node.id === id);

  if (!lesson) {
    notFound();
  }

  // Get user progress dynamically if logged in
  let userProgressData = null;
  try {
    userProgressData = await getUserProgress();
  } catch (error) {
    console.error("Failed to load user progress:", error);
  }

  const todayMinutes = 43; // mock
  const activeCourse = userProgressData?.activeCourse || { title: "Tiếng Anh", imageSrc: "/globe.svg" };
  const hearts = userProgressData?.hearts ?? 5;
  const points = userProgressData?.points ?? 100;

  const objectives = LESSON_OBJECTIVES[id] || DEFAULT_OBJECTIVES;

  // Render variables based on status
  let statusLabel = "";
  let statusColor = "";
  let statusDesc = "";
  let StatusIcon = Play;
  let ctaText = "Bắt đầu học";
  let ctaVariant: "primary" | "secondary" | "danger" | "super" | "default" = "primary";
  let isCtaDisabled = false;

  switch (lesson.status) {
    case "completed":
      statusLabel = "Đã hoàn thành";
      statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/30";
      statusDesc = "Bạn đã hoàn thành xuất sắc bài học này! Bạn có thể ôn luyện lại bất cứ lúc nào để củng cố kiến thức.";
      StatusIcon = CheckCircle;
      ctaText = "Ôn tập lại";
      ctaVariant = "secondary";
      break;
    case "current":
      statusLabel = "Đang học";
      statusColor = "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/30";
      statusDesc = "Đây là bài học hiện tại của bạn. Hãy hoàn thành bài học này để tiến sâu hơn vào lộ trình học tập!";
      StatusIcon = Star;
      ctaText = "Bắt đầu học";
      ctaVariant = "primary";
      break;
    case "locked":
      statusLabel = "Đã khóa";
      statusColor = "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700";
      statusDesc = "Bài học này hiện tại chưa được mở khóa. Hãy hoàn thành các bài học trước đó trong chương để tiếp tục.";
      StatusIcon = Lock;
      ctaText = "Đã bị khóa";
      ctaVariant = "default";
      isCtaDisabled = true;
      break;
    case "reward":
      statusLabel = "Rương phần thưởng";
      statusColor = "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/30";
      statusDesc = "Rương chứa phần thưởng hấp dẫn. Hoàn thành bài học hiện tại để có cơ hội mở và nhận thưởng nhé!";
      StatusIcon = Gift;
      ctaText = "Mở rương";
      ctaVariant = "super";
      break;
    case "checkpoint":
      statusLabel = "Bài kiểm tra chương";
      statusColor = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30";
      statusDesc = "Bài thi checkpoint tổng hợp để vượt qua chương hiện tại. Thử thách kiến thức của bạn!";
      StatusIcon = Trophy;
      ctaText = "Bắt đầu kiểm tra";
      ctaVariant = "secondary";
      break;
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_425px] xl:items-start xl:gap-10">
      <FeedWrapper>
        <div className="rounded-[28px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-6 md:p-8 shadow-sm">
          {/* Back button */}
          <Link
            href="/learn"
            className="group inline-flex items-center gap-2 text-xs font-black tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition mb-6 uppercase"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3.5] transition group-hover:-translate-x-0.5" />
            Quay lại lộ trình
          </Link>

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-6 mb-8 pb-6 border-b-2 border-slate-100 dark:border-slate-800">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border-2 shadow-sm ${
              lesson.status === "completed" ? "bg-emerald-50 border-emerald-200 text-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400" :
              lesson.status === "current" ? "bg-sky-50 border-sky-200 text-[#1486CC] dark:bg-sky-950/20 dark:border-sky-800/40 dark:text-[#38bdf8] animate-pulse" :
              lesson.status === "locked" ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-500" :
              lesson.status === "reward" ? "bg-purple-50 border-purple-200 text-purple-500 dark:bg-purple-950/20 dark:border-purple-800/40 dark:text-purple-400" :
              "bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-400"
            }`}>
              <StatusIcon className="h-10 w-10 stroke-[3]" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wide rounded-full border ${statusColor}`}>
                  {statusLabel}
                </span>
                {lesson.progress !== undefined && lesson.progress > 0 && (
                  <span className="px-3 py-1 text-xs font-black uppercase tracking-wide bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30 rounded-full">
                    Tiến độ: {lesson.progress}%
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 mt-3 leading-tight">
                {lesson.title}
              </h1>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">
              Mô tả bài học
            </h3>
            <p className="mt-2 text-base font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              {lesson.description}
            </p>
          </div>

          {/* Objectives */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">
              Mục tiêu học tập
            </h3>
            <ul className="mt-3 space-y-3">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                    lesson.status === "completed" 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" 
                      : "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                  }`}>
                    <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Status Message Info Box */}
          <div className={`p-4 rounded-2xl border-2 mb-8 ${
            lesson.status === "completed" ? "bg-emerald-50/50 border-emerald-100 text-slate-600 dark:bg-emerald-950/10 dark:border-emerald-950/30 dark:text-slate-300" :
            lesson.status === "current" ? "bg-sky-50/50 border-sky-100 text-slate-600 dark:bg-sky-950/10 dark:border-sky-950/30 dark:text-slate-300" :
            lesson.status === "locked" ? "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-900/30 dark:border-slate-800/50 dark:text-slate-400" :
            lesson.status === "reward" ? "bg-purple-50/30 border-purple-100 text-slate-600 dark:bg-purple-950/10 dark:border-purple-950/30 dark:text-slate-300" :
            "bg-amber-50/30 border-amber-100 text-slate-600 dark:bg-amber-950/10 dark:border-amber-950/30 dark:text-slate-300"
          }`}>
            <p className="text-sm font-bold leading-relaxed">
              {statusDesc}
            </p>
          </div>

          {/* XP Rewards Box */}
          {lesson.xp > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-orange-100 dark:border-orange-950/30 bg-orange-50/50 dark:bg-orange-950/10 p-4 mb-8">
              <Image src="/points.svg" height={32} width={32} alt="XP" />
              <div>
                <h4 className="text-sm font-black text-orange-600 dark:text-orange-400">Điểm kinh nghiệm nhận được</h4>
                <p className="text-xs font-bold text-orange-500 dark:text-orange-500/80">
                  Hoàn thành thử thách để nhận +{lesson.xp} XP tích lũy
                </p>
              </div>
            </div>
          )}

          {/* CTA Action Button */}
          {isCtaDisabled ? (
            <Button
              variant="default"
              disabled
              className="w-full h-12 rounded-2xl"
            >
              <Lock className="mr-2 h-5 w-5 stroke-[2.5]" />
              {ctaText}
            </Button>
          ) : (
            <Button
              variant={ctaVariant}
              className="w-full h-12 rounded-2xl"
              asChild
            >
              <Link href={`/lesson?id=${lesson.id}`}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 stroke-[2.5]" />
              </Link>
            </Button>
          )}
        </div>
      </FeedWrapper>

      <StickyWrapper>
        <div className="rounded-[24px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-4 shadow-sm">
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

export default LessonDetailPage;
