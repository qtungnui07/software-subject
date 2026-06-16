export type CourseStatus = "learning" | "completed" | "paused";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export type ProfileData = {
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    avatarSrc: string;
    roleLabel: string;
    rankLabel: string;
    joinedAt: string;
  };
  currentCourse: {
    id: string;
    title: string;
    language: string;
    level: string;
    status: CourseStatus;
    statusLabel: string;
    description: string;
  };
  learningStats: {
    streakDays: number;
    xp: number;
    todayMinutes: number;
    dailyGoalMinutes: number;
    weeklyGoalMinutes: number;
  };
  achievements: Achievement[];
};

export const profileData: ProfileData = {
  user: {
    id: "mock-user-1",
    username: "Dung",
    displayName: "Dung",
    email: "dung.robogo@example.com",
    avatarSrc: "/logo.svg",
    roleLabel: "Người học Robogo",
    rankLabel: "Chuỗi bạc",
    joinedAt: "2026-06-16",
  },
  currentCourse: {
    id: "english-basic",
    title: "Tiếng Anh - Giao tiếp cơ bản",
    language: "English",
    level: "Beginner",
    status: "learning",
    statusLabel: "Đang học",
    description:
      "Luyện giao tiếp tiếng Anh cơ bản qua các bài học ngắn, dễ theo dõi và có tiến độ rõ ràng.",
  },
  learningStats: {
    streakDays: 7,
    xp: 75,
    todayMinutes: 43,
    dailyGoalMinutes: 60,
    weeklyGoalMinutes: 300,
  },
  achievements: [
    {
      id: "first-lesson",
      title: "Bước đầu tiên",
      description: "Hoàn thành bài học đầu tiên trên Robogo.",
      icon: "🏁",
      unlocked: true,
    },
    {
      id: "streak-7",
      title: "Chuỗi 7 ngày",
      description: "Duy trì thói quen học trong 7 ngày liên tiếp.",
      icon: "🔥",
      unlocked: true,
    },
    {
      id: "xp-collector",
      title: "Tích lũy XP",
      description: "Nhận XP từ các bài học đã hoàn thành.",
      icon: "⚡",
      unlocked: true,
    },
  ],
};
