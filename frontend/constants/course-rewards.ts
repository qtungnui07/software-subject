import type { CourseRewardDefinition } from "@/types/course";

export const STREAK_FREEZE_REWARD: CourseRewardDefinition = {
  type: "streak_freeze",
  amount: 1,
  label: "+1 Streak Freeze",
  description: "Freeze sẽ tự động bảo vệ chuỗi học khi bạn bỏ lỡ một ngày.",
  icon: "freeze",
};
