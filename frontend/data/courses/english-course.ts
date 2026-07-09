import { chapterOneDemoScope } from "@/constants/chapter-one";
import { getAdaptedChapterOneNodes } from "@/lib/courses/chapter-one-adapter";
import type {
  CourseDefinition,
  LearningNodeDefinition,
  SectionDefinition,
} from "@/types/course";

const createReadySectionNodes = (
  sectionNumber: 2 | 3,
  lessonTitles: string[],
  lessonDescriptions: string[],
  checkpointTitle: string,
  checkpointDescription: string
): LearningNodeDefinition[] => {
  const lessonNodes = lessonTitles.map<LearningNodeDefinition>((title, index) => {
    const lessonNumber = index + 1;
    const id = `en-s${sectionNumber}-c1-lesson-${lessonNumber}`;

    return {
      id,
      type: "lesson",
      title: `Bài ${lessonNumber}: ${title}`,
      shortTitle: title,
      description: lessonDescriptions[index] ?? title,
      order: lessonNumber,
      unlockAfterId:
        lessonNumber === 1
          ? null
          : `en-s${sectionNumber}-c1-lesson-${lessonNumber - 1}`,
      href: `/lesson?id=${id}`,
      xp: 40 + index * 5,
      countsTowardProgress: true,
      contentStatus: "ready",
    };
  });

  const checkpointId = `en-s${sectionNumber}-c1-checkpoint`;

  return [
    ...lessonNodes,
    {
      id: checkpointId,
      type: "checkpoint",
      title: checkpointTitle,
      shortTitle: "Kiểm tra",
      description: checkpointDescription,
      order: lessonNodes.length + 1,
      unlockAfterId: lessonNodes.at(-1)?.id ?? null,
      href: `/lesson?id=${checkpointId}`,
      xp: sectionNumber === 2 ? 70 : 80,
      countsTowardProgress: true,
      contentStatus: "ready",
    },
  ];
};

const sectionOne: SectionDefinition = {
  id: "english-section-1",
  courseId: "english",
  order: 1,
  level: "beginner",
  title: "Phần 1: Nền tảng",
  description: "Làm quen với từ vựng và giao tiếp tiếng Anh cơ bản.",
  contentStatus: "ready",
  chapter: {
    id: "english-section-1-chapter-1",
    sectionId: "english-section-1",
    order: 1,
    title: chapterOneDemoScope.chapterTitle,
    description:
      "Học lời chào, giới thiệu bản thân và các mẫu hội thoại nền tảng.",
    nodes: getAdaptedChapterOneNodes(),
  },
};

const sectionTwo: SectionDefinition = {
  id: "english-section-2",
  courseId: "english",
  order: 2,
  level: "intermediate",
  title: "Phần 2: Trung cấp",
  description: "Kể chuyện và xử lý các tình huống giao tiếp thường gặp.",
  contentStatus: "ready",
  chapter: {
    id: "english-section-2-chapter-1",
    sectionId: "english-section-2",
    order: 1,
    title: "Kể chuyện và xử lý tình huống",
    description:
      "Luyện quá khứ, chỉ đường, mua sắm, kế hoạch và phản xạ giao tiếp.",
    nodes: createReadySectionNodes(
      2,
      [
        "Một ngày đã qua",
        "Du lịch và hỏi đường",
        "Nhà hàng và mua sắm",
        "Kế hoạch tương lai",
        "Tình huống thường ngày",
      ],
      [
        "Kể lại hoạt động đã xảy ra bằng thì quá khứ đơn.",
        "Hỏi đường, hiểu chỉ dẫn và sử dụng từ vựng giao thông.",
        "Gọi món, hỏi giá và đưa ra yêu cầu lịch sự.",
        "Nói về dự định bằng will và be going to.",
        "Dùng so sánh, modal verbs và lời nhờ giúp đỡ.",
      ],
      "Kiểm tra cuối Phần 2",
      "Tổng hợp các tình huống và cấu trúc trọng tâm của Phần 2."
    ),
  },
};

const sectionThree: SectionDefinition = {
  id: "english-section-3",
  courseId: "english",
  order: 3,
  level: "advanced",
  title: "Phần 3: Nâng cao",
  description:
    "Trình bày quan điểm và sử dụng cấu trúc tiếng Anh phức tạp hơn.",
  contentStatus: "ready",
  chapter: {
    id: "english-section-3-chapter-1",
    sectionId: "english-section-3",
    order: 1,
    title: "Quan điểm và phản biện",
    description:
      "Nêu ý kiến, phản biện lịch sự và xây dựng kết luận có lý do.",
    nodes: createReadySectionNodes(
      3,
      [
        "Nêu ý kiến cá nhân",
        "Đồng ý và phản đối",
        "Công nghệ và mạng xã hội",
        "Giáo dục và môi trường",
        "Lập luận và kết luận",
      ],
      [
        "Trình bày quan điểm và giải thích lý do rõ ràng.",
        "Đồng ý hoặc phản đối một cách lịch sự, có lập luận.",
        "Thảo luận lợi ích, rủi ro và quyền riêng tư số.",
        "Dùng mệnh đề quan hệ và đề xuất giải pháp.",
        "Sử dụng reported speech và từ nối để kết luận.",
      ],
      "Kiểm tra cuối Phần 3",
      "Đánh giá khả năng hiểu quan điểm, phản biện và kết luận."
    ),
  },
};

export const englishCourse: CourseDefinition = {
  id: "english",
  legacyIds: [chapterOneDemoScope.courseId],
  languageCode: "en",
  title: chapterOneDemoScope.courseTitle,
  imageSrc: "/gb.svg",
  sections: [sectionOne, sectionTwo, sectionThree],
};
