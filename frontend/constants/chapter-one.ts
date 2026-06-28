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
    title: "Bài 1: Từ đầu tiên",
    shortTitle: "Từ đầu tiên",
    description: "Làm quen với những từ cực ngắn, cách nghe và phát âm đầu tiên.",
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
    title: "Bài 2: Chào hỏi cơ bản",
    shortTitle: "Chào hỏi",
    description: "Học cách nói xin chào, tạm biệt và bắt đầu hội thoại ngắn.",
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
    title: "Bài 3: Giới thiệu bản thân",
    shortTitle: "Giới thiệu",
    description: "Tập nói tên, tuổi, quê quán và vài thông tin cá nhân.",
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
    title: "Rương thưởng",
    shortTitle: "Rương",
    description: "Nhận phần thưởng sau khi hoàn thành 3 bài học đầu tiên.",
    order: 4,
    unlockAfterId: "lesson-3",
    href: null,
    xp: 10,
    countsTowardProgress: false,
    initialStatus: "locked",
    x: 250,
    y: 635,
  },
  {
    id: "lesson-4",
    legacyId: 5,
    type: "lesson",
    title: "Bài 4: Hỏi tên và tuổi",
    shortTitle: "Hỏi tên tuổi",
    description: "Luyện các câu hỏi đơn giản trong cuộc trò chuyện hằng ngày.",
    order: 5,
    unlockAfterId: "chest-1",
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
    title: "Bài 5: Luyện nghe nhanh",
    shortTitle: "Luyện nghe",
    description: "Nghe những câu ngắn và chọn đáp án đúng trước khi hết thời gian.",
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
    title: "Bài 6: Ôn tập chương",
    shortTitle: "Ôn tập",
    description: "Củng cố từ vựng, mẫu câu và phản xạ trước bài kiểm tra.",
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
    title: "Kiểm tra cuối chương",
    shortTitle: "Kiểm tra",
    description: "Vượt qua bài kiểm tra cuối chương để hoàn thành Chương 1.",
    order: 8,
    unlockAfterId: "lesson-6",
    href: "/lesson?id=chapter-1-test",
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
