export type StudyTier = {
  icon: string;
  label: string;
  shortLabel: string;
  tone: "none" | "bronze" | "silver" | "gold";
};

export const getStudyTier = (minutes: number): StudyTier => {
  if (minutes >= 60) {
    return {
      icon: "🥇",
      label: "Chuỗi vàng",
      shortLabel: "Vàng",
      tone: "gold",
    };
  }

  if (minutes >= 30) {
    return {
      icon: "🥈",
      label: "Chuỗi bạc",
      shortLabel: "Bạc",
      tone: "silver",
    };
  }

  if (minutes >= 15) {
    return {
      icon: "🥉",
      label: "Chuỗi đồng",
      shortLabel: "Đồng",
      tone: "bronze",
    };
  }

  return {
    icon: "✕",
    label: "Chưa đạt chuỗi",
    shortLabel: "Chưa đạt",
    tone: "none",
  };
};
