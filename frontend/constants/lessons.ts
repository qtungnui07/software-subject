export type LessonStatus = "completed" | "current" | "locked" | "reward" | "checkpoint";

export type LessonNode = {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  status: LessonStatus;
  progress?: number;
  xp: number;
  x: number;
  y: number;
};

export const lessonNodes: LessonNode[] = [
  {
    id: 1,
    title: "Bài 1: Từ đầu tiên",
    shortTitle: "Từ đầu tiên",
    description: "Làm quen với những từ cực ngắn, cách nghe và phát âm đầu tiên.",
    status: "completed",
    progress: 100,
    xp: 20,
    x: 360,
    y: 110,
  },
  {
    id: 2,
    title: "Bài 2: Chào hỏi cơ bản",
    shortTitle: "Chào hỏi",
    description: "Học cách nói xin chào, tạm biệt và bắt đầu hội thoại ngắn.",
    status: "current",
    progress: 50,
    xp: 30,
    x: 470,
    y: 285,
  },
  {
    id: 3,
    title: "Bài 3: Giới thiệu bản thân",
    shortTitle: "Giới thiệu",
    description: "Tập nói tên, tuổi, quê quán và vài thông tin cá nhân.",
    status: "locked",
    xp: 30,
    x: 360,
    y: 460,
  },
  {
    id: 4,
    title: "Rương thưởng",
    shortTitle: "Rương thưởng",
    description: "Hoàn thành bài hiện tại để mở khóa phần thưởng đầu tiên.",
    status: "reward",
    xp: 0,
    x: 250,
    y: 635,
  },
  {
    id: 5,
    title: "Bài 4: Hỏi tên và tuổi",
    shortTitle: "Hỏi tên tuổi",
    description: "Luyện các câu hỏi đơn giản trong cuộc trò chuyện hằng ngày.",
    status: "locked",
    xp: 35,
    x: 360,
    y: 810,
  },
  {
    id: 6,
    title: "Bài 5: Luyện nghe nhanh",
    shortTitle: "Luyện nghe",
    description: "Nghe những câu ngắn và chọn đáp án đúng trước khi hết thời gian.",
    status: "locked",
    xp: 35,
    x: 470,
    y: 985,
  },
  {
    id: 7,
    title: "Bài 6: Ôn tập chương",
    shortTitle: "Ôn tập",
    description: "Củng cố từ vựng, mẫu câu và phản xạ trước bài kiểm tra.",
    status: "locked",
    xp: 40,
    x: 360,
    y: 1160,
  },
  {
    id: 8,
    title: "Kiểm tra chương",
    shortTitle: "Checkpoint",
    description: "Vượt qua thử thách cuối chương để mở chương tiếp theo.",
    status: "checkpoint",
    xp: 60,
    x: 360,
    y: 1335,
  },
];
