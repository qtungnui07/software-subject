import { chapterOneDemoScope, chapterOneNodes } from "@/constants/chapter-one";

export type LessonStatus = "completed" | "current" | "available" | "locked";

export type LessonType = "lesson" | "review" | "story" | "unit-review" | "boss";

export type ProgressLesson = {
  id: number;
  title: string;
  description: string;
  type: LessonType;
  status: LessonStatus;
  href: string;
  objectives: string[];
  estimatedMinutes: number;
  xpReward: number;
};

export type ProgressUnit = {
  id: number;
  title: string;
  description: string;
  iconSrc: string;
  lessons: ProgressLesson[];
};

export type ProgressCourse = {
  id: string;
  title: string;
  nativeTitle: string;
  level: string;
  description: string;
  imageSrc: string;
  units: ProgressUnit[];
};

export const englishProgressCourse: ProgressCourse = {
  id: "english-basic",
  title: "English",
  nativeTitle: "Tiếng Anh",
  level: "Giao tiếp cơ bản",
  description:
    "Lộ trình tiếng Anh cơ bản theo hướng ngắn, rõ, có tiến độ và phần thưởng để người học quay lại mỗi ngày.",
  imageSrc: "/gb.svg",
  units: [
    {
      id: 1,
      title: "Unit 1: Nền tảng cơ bản",
      description:
        "Làm quen với từ vựng đầu tiên, câu chào hỏi và cách giới thiệu bản thân.",
      iconSrc: "/learn.svg",
      lessons: [
        {
          id: 1,
          title: "First Words",
          description: "Nhận diện các từ tiếng Anh ngắn và dễ dùng nhất.",
          type: "lesson",
          status: "completed",
          href: "/lesson/1",
          objectives: [
            "Nhận diện các từ cơ bản",
            "Ghép từ với nghĩa đúng",
            "Hoàn thành bài luyện tập ngắn",
          ],
          estimatedMinutes: 5,
          xpReward: 10,
        },
        {
          id: 2,
          title: "Basic Greetings",
          description: "Học cách chào hỏi, tạm biệt và cảm ơn trong hội thoại ngắn.",
          type: "lesson",
          status: "completed",
          href: "/lesson/2",
          objectives: [
            "Dùng các câu chào hỏi phổ biến",
            "Hiểu phản hồi trong hội thoại cơ bản",
            "Ghép câu chào với tình huống phù hợp",
          ],
          estimatedMinutes: 7,
          xpReward: 10,
        },
        {
          id: 3,
          title: "Introduce Yourself",
          description: "Nói tên, tuổi và một vài thông tin cá nhân đơn giản.",
          type: "lesson",
          status: "completed",
          href: "/lesson/3",
          objectives: [
            "Nói tên của bản thân",
            "Hỏi tên người khác",
            "Tạo câu giới thiệu ngắn",
          ],
          estimatedMinutes: 8,
          xpReward: 10,
        },
        {
          id: 4,
          title: "A Short Talk",
          description: "Đọc một đoạn hội thoại ngắn giữa hai người mới gặp.",
          type: "story",
          status: "completed",
          href: "/lesson/4",
          objectives: [
            "Đọc hiểu hội thoại đơn giản",
            "Nhận biết câu chào và câu giới thiệu",
            "Chọn phản hồi đúng theo ngữ cảnh",
          ],
          estimatedMinutes: 10,
          xpReward: 15,
        },
        {
          id: 5,
          title: "Unit 1 Review",
          description: "Ôn lại toàn bộ nội dung nền tảng của Unit 1.",
          type: "unit-review",
          status: "completed",
          href: "/lesson/5",
          objectives: [
            "Ôn lại từ vựng chính",
            "Ôn lại mẫu câu chào hỏi",
            "Hoàn thành bài tổng kết Unit 1",
          ],
          estimatedMinutes: 12,
          xpReward: 20,
        },
      ],
    },
    {
      id: 2,
      title: "Unit 2: Giao tiếp hằng ngày",
      description:
        "Luyện các câu hỏi và câu trả lời thường gặp trong sinh hoạt hằng ngày.",
      iconSrc: "/learn.svg",
      lessons: [
        {
          id: 6,
          title: "Numbers & Age",
          description: "Học số cơ bản và cách nói tuổi trong tiếng Anh.",
          type: "lesson",
          status: "completed",
          href: "/lesson/6",
          objectives: [
            "Nhận diện số từ 1 đến 20",
            "Hỏi tuổi người khác",
            "Trả lời tuổi bằng câu đơn giản",
          ],
          estimatedMinutes: 8,
          xpReward: 10,
        },
        {
          id: 7,
          title: "Family Words",
          description: "Làm quen với các từ vựng cơ bản về gia đình.",
          type: "lesson",
          status: "current",
          href: "/lesson/7",
          objectives: [
            "Nhận diện từ vựng gia đình",
            "Nói về thành viên trong gia đình",
            "Hoàn thành câu mô tả ngắn",
          ],
          estimatedMinutes: 9,
          xpReward: 10,
        },
        {
          id: 8,
          title: "Daily Routine",
          description: "Học cách nói về một vài hoạt động hằng ngày.",
          type: "lesson",
          status: "available",
          href: "/lesson/8",
          objectives: [
            "Nhận diện động từ sinh hoạt cơ bản",
            "Nói về thói quen đơn giản",
            "Sắp xếp câu theo đúng thứ tự",
          ],
          estimatedMinutes: 10,
          xpReward: 10,
        },
        {
          id: 9,
          title: "Small Conversation",
          description: "Luyện một đoạn hội thoại ngắn về gia đình và sinh hoạt.",
          type: "story",
          status: "locked",
          href: "/lesson/9",
          objectives: [
            "Đọc hiểu hội thoại ngắn",
            "Chọn câu trả lời phù hợp",
            "Nhận biết từ khóa theo ngữ cảnh",
          ],
          estimatedMinutes: 12,
          xpReward: 15,
        },
        {
          id: 10,
          title: "Daily Life Checkpoint",
          description: "Bài kiểm tra nhỏ để mở khóa Unit tiếp theo.",
          type: "boss",
          status: "locked",
          href: "/lesson/10",
          objectives: [
            "Kiểm tra từ vựng Unit 2",
            "Kiểm tra mẫu câu giao tiếp hằng ngày",
            "Đạt điểm đủ để mở khóa Unit 3",
          ],
          estimatedMinutes: 15,
          xpReward: 25,
        },
      ],
    },
    {
      id: 3,
      title: "Unit 3: Ăn uống và mua sắm",
      description:
        "Học cách gọi món, hỏi giá và dùng những câu đơn giản khi mua sắm.",
      iconSrc: "/learn.svg",
      lessons: [
        {
          id: 11,
          title: "Food & Drinks",
          description: "Nhận diện từ vựng về đồ ăn và thức uống phổ biến.",
          type: "lesson",
          status: "locked",
          href: "/lesson/11",
          objectives: [
            "Nhận diện từ vựng đồ ăn",
            "Nhận diện từ vựng đồ uống",
            "Ghép món ăn với hình ảnh phù hợp",
          ],
          estimatedMinutes: 8,
          xpReward: 10,
        },
        {
          id: 12,
          title: "Ordering Food",
          description: "Luyện câu đơn giản khi gọi món ở quán ăn.",
          type: "lesson",
          status: "locked",
          href: "/lesson/12",
          objectives: [
            "Dùng mẫu câu gọi món",
            "Hỏi món ăn đơn giản",
            "Chọn phản hồi phù hợp khi đặt món",
          ],
          estimatedMinutes: 10,
          xpReward: 10,
        },
        {
          id: 13,
          title: "Shopping Phrases",
          description: "Học cách hỏi giá và nói nhu cầu mua hàng cơ bản.",
          type: "lesson",
          status: "locked",
          href: "/lesson/13",
          objectives: [
            "Hỏi giá sản phẩm",
            "Nói mình muốn mua gì",
            "Hiểu câu trả lời ngắn của người bán",
          ],
          estimatedMinutes: 9,
          xpReward: 10,
        },
        {
          id: 14,
          title: "At The Store",
          description: "Đọc một đoạn hội thoại ngắn tại cửa hàng.",
          type: "story",
          status: "locked",
          href: "/lesson/14",
          objectives: [
            "Đọc hiểu hội thoại mua sắm",
            "Nhận diện câu hỏi giá",
            "Chọn câu trả lời đúng theo tình huống",
          ],
          estimatedMinutes: 12,
          xpReward: 15,
        },
        {
          id: 15,
          title: "Unit 3 Review",
          description: "Ôn lại nội dung ăn uống và mua sắm.",
          type: "unit-review",
          status: "locked",
          href: "/lesson/15",
          objectives: [
            "Ôn lại từ vựng chính",
            "Ôn lại mẫu câu gọi món",
            "Hoàn thành bài tổng kết Unit 3",
          ],
          estimatedMinutes: 12,
          xpReward: 20,
        },
      ],
    },
    {
      id: 4,
      title: "Unit 4: Du lịch cơ bản",
      description:
        "Luyện các cụm từ cần thiết khi hỏi đường, đi phương tiện công cộng và đặt vé.",
      iconSrc: "/learn.svg",
      lessons: [
        {
          id: 16,
          title: "Places In Town",
          description: "Học tên các địa điểm phổ biến trong thành phố.",
          type: "lesson",
          status: "locked",
          href: "/lesson/16",
          objectives: [
            "Nhận diện tên địa điểm",
            "Hỏi nơi chốn đơn giản",
            "Ghép địa điểm với mô tả phù hợp",
          ],
          estimatedMinutes: 8,
          xpReward: 10,
        },
        {
          id: 17,
          title: "Directions",
          description: "Hỏi và hiểu chỉ dẫn đường đi cơ bản.",
          type: "lesson",
          status: "locked",
          href: "/lesson/17",
          objectives: [
            "Hỏi đường đến một địa điểm",
            "Hiểu trái, phải và đi thẳng",
            "Sắp xếp câu chỉ đường đúng thứ tự",
          ],
          estimatedMinutes: 10,
          xpReward: 10,
        },
        {
          id: 18,
          title: "Transport",
          description: "Làm quen với từ vựng về xe buýt, tàu, taxi và vé.",
          type: "lesson",
          status: "locked",
          href: "/lesson/18",
          objectives: [
            "Nhận diện từ vựng phương tiện",
            "Hỏi thông tin vé đơn giản",
            "Chọn phương tiện phù hợp theo tình huống",
          ],
          estimatedMinutes: 10,
          xpReward: 10,
        },
        {
          id: 19,
          title: "Travel Dialogue",
          description: "Đọc đoạn hội thoại ngắn giữa khách du lịch và người hướng dẫn.",
          type: "story",
          status: "locked",
          href: "/lesson/19",
          objectives: [
            "Đọc hiểu hội thoại du lịch",
            "Nhận diện câu hỏi đường",
            "Chọn phản hồi đúng theo ngữ cảnh",
          ],
          estimatedMinutes: 12,
          xpReward: 15,
        },
        {
          id: 20,
          title: "Basic Travel Checkpoint",
          description: "Bài kiểm tra cuối lộ trình giao tiếp cơ bản.",
          type: "boss",
          status: "locked",
          href: "/lesson/20",
          objectives: [
            "Kiểm tra từ vựng du lịch",
            "Kiểm tra mẫu câu hỏi đường",
            "Hoàn thành checkpoint cuối lộ trình",
          ],
          estimatedMinutes: 15,
          xpReward: 30,
        },
      ],
    },
  ],
};

export const progressUnits = englishProgressCourse.units;


export const chapterOneProgressCourse: ProgressCourse = {
  id: chapterOneDemoScope.courseId,
  title: "English",
  nativeTitle: chapterOneDemoScope.courseTitle,
  level: chapterOneDemoScope.chapterTitle,
  description:
    "Phạm vi demo hiện tại chỉ gồm Tiếng Anh / Chương 1 / Cửa 1.",
  imageSrc: "/globe.svg",
  units: [
    {
      id: 1,
      title: `${chapterOneDemoScope.unitTitle}: ${chapterOneDemoScope.chapterTitle}`,
      description:
        "Hoàn thành 6 bài học và 1 bài kiểm tra cuối chương. Rương thưởng không tính vào tiến độ chính.",
      iconSrc: "/learn.svg",
      lessons: chapterOneNodes
        .filter((node) => node.countsTowardProgress)
        .map((node) => ({
          id: node.legacyId,
          title: node.title,
          description: node.description,
          type: node.type === "checkpoint" ? "boss" : "lesson",
          status: node.initialStatus === "current" ? "current" : "locked",
          href: node.href ?? `/lesson?id=${node.id}`,
          objectives: [
            "Hoàn thành bài học trong luồng Chương 1.",
            "Đạt đủ điểm để mở khóa node tiếp theo.",
            "Giữ tiến độ demo ổn định từ đầu đến cuối chương.",
          ],
          estimatedMinutes: node.type === "checkpoint" ? 12 : 7,
          xpReward: node.xp,
        })),
    },
  ],
};

export const chapterOneProgressUnits = chapterOneProgressCourse.units;
