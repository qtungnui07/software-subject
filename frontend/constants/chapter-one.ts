import { STREAK_FREEZE_REWARD } from "@/constants/course-rewards";
import type { CourseRewardDefinition } from "@/types/course";

export type ChapterOneNodeType = "lesson" | "chest" | "checkpoint";
export type ChapterOneInitialStatus = "current" | "locked";

export type ChapterOneNode = {
  /** Stable string id used by demo progress, XP and unlock logic. */
  id: string;
  /** Legacy numeric id kept so older UI/routes can keep working during the migration. */
  legacyId: number;
  type: ChapterOneNodeType;
  title: string;
  shortTitle: string;
  description: string;
  order: number;
  unlockAfterId: string | null;
  href: string | null;
  xp: number;
  countsTowardProgress: boolean;
  rewards?: CourseRewardDefinition[];
  initialStatus: ChapterOneInitialStatus;
  x: number;
  y: number;
};

export const chapterOneDemoScope = {
  courseId: "english-basic",
  courseTitle: "Tiếng Anh",
  sectionLabel: "Phần 1, Chương 1",
  chapterTitle: "Giao tiếp cơ bản",
  unitTitle: "Cửa 1",
  isDemoOnly: true,
  allowOtherCourses: false,
  allowChapterTwo: false,
  allowUnitTwo: false,
} as const;

export const chapterOneNodes: ChapterOneNode[] = [
  {
    id: "lesson-1",
    legacyId: 1,
    type: "lesson",
    title: "Bài 1: Gặp một người bạn mới",
    shortTitle: "Làm quen",
    description: "Chào hỏi, giới thiệu bản thân và nói về sở thích đơn giản.",
    order: 1,
    unlockAfterId: null,
    href: "/lesson?id=lesson-1",
    xp: 20,
    countsTowardProgress: true,
    initialStatus: "current",
    x: 360,
    y: 110,
  },
  {
    id: "lesson-2",
    legacyId: 2,
    type: "lesson",
    title: "Bài 2: Một ngày của tôi",
    shortTitle: "Ngày thường",
    description: "Nói về lịch sinh hoạt, thời gian và thói quen hằng ngày.",
    order: 2,
    unlockAfterId: "lesson-1",
    href: "/lesson?id=lesson-2",
    xp: 30,
    countsTowardProgress: true,
    initialStatus: "locked",
    x: 470,
    y: 285,
  },
  {
    id: "lesson-3",
    legacyId: 3,
    type: "lesson",
    title: "Bài 3: Tại quán cà phê",
    shortTitle: "Gọi món",
    description: "Đọc menu, gọi món và hỏi giá một cách lịch sự.",
    order: 3,
    unlockAfterId: "lesson-2",
    href: "/lesson?id=lesson-3",
    xp: 30,
    countsTowardProgress: true,
    initialStatus: "locked",
    x: 360,
    y: 460,
  },
  {
    id: "chest-1",
    legacyId: 4,
    type: "chest",
    title: "Rương Freeze",
    shortTitle: "Rương",
    description: "Nhận +1 Streak Freeze sau khi hoàn thành 3 bài học đầu tiên.",
    order: 4,
    unlockAfterId: "lesson-3",
    href: null,
    xp: 0,
    countsTowardProgress: false,
    rewards: [STREAK_FREEZE_REWARD],
    initialStatus: "locked",
    x: 250,
    y: 635,
  },
  {
    id: "lesson-4",
    legacyId: 5,
    type: "lesson",
    title: "Bài 4: Đi quanh thành phố",
    shortTitle: "Chỉ đường",
    description: "Hỏi vị trí, đọc mô tả khu phố và chỉ đường rõ ràng.",
    order: 5,
    unlockAfterId: "lesson-3",
    href: "/lesson?id=lesson-4",
    xp: 35,
    countsTowardProgress: true,
    initialStatus: "locked",
    x: 360,
    y: 810,
  },
  {
    id: "lesson-5",
    legacyId: 6,
    type: "lesson",
    title: "Bài 5: Lên kế hoạch",
    shortTitle: "Hẹn gặp",
    description: "Mời bạn, kiểm tra lịch và thống nhất thời gian gặp.",
    order: 6,
    unlockAfterId: "lesson-4",
    href: "/lesson?id=lesson-5",
    xp: 35,
    countsTowardProgress: true,
    initialStatus: "locked",
    x: 470,
    y: 985,
  },
  {
    id: "lesson-6",
    legacyId: 7,
    type: "lesson",
    title: "Bài 6: Nhiệm vụ cuối tuần",
    shortTitle: "Cuối tuần",
    description: "Kết hợp thời gian, địa điểm, ngân sách và chỉ đường.",
    order: 7,
    unlockAfterId: "lesson-5",
    href: "/lesson?id=lesson-6",
    xp: 40,
    countsTowardProgress: true,
    initialStatus: "locked",
    x: 360,
    y: 1160,
  },
  {
    id: "chapter-1-test",
    legacyId: 8,
    type: "checkpoint",
    title: "A2 Checkpoint",
    shortTitle: "A2 Checkpoint",
    description: "Đạt ít nhất 70% trong 12 hoạt động tổng hợp để mở khóa Section 2.",
    order: 8,
    unlockAfterId: "lesson-6",
    href: "/checkpoint/chapter-1-test",
    xp: 60,
    countsTowardProgress: true,
    initialStatus: "locked",
    x: 360,
    y: 1335,
  },
];

export const CHAPTER_ONE_MAIN_PROGRESS_TOTAL = chapterOneNodes.filter(
  (node) => node.countsTowardProgress
).length;

export const getChapterOneNodeById = (nodeId: string) => {
  return chapterOneNodes.find((node) => node.id === nodeId);
};

export const getChapterOneNodeByLegacyId = (legacyId: number) => {
  return chapterOneNodes.find((node) => node.legacyId === legacyId);
};
