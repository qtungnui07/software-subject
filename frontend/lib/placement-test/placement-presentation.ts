import type { PlacementSectionId } from "@/types/placement-test";

export type PlacementSectionPresentation = {
  shortTitle: string;
  title: string;
  level: string;
  description: string;
  accentClassName: string;
};

export const PLACEMENT_SECTION_PRESENTATION: Record<
  PlacementSectionId,
  PlacementSectionPresentation
> = {
  "english-section-1": {
    shortTitle: "Phần 1",
    title: "Phần 1 – Nền tảng",
    level: "Cơ bản",
    description:
      "Bạn nên bắt đầu với từ vựng, mẫu câu và các tình huống giao tiếp nền tảng.",
    accentClassName: "from-sky-500 to-cyan-400",
  },
  "english-section-2": {
    shortTitle: "Phần 2",
    title: "Phần 2 – Trung cấp",
    level: "Trung cấp",
    description:
      "Bạn đã có nền tảng tốt và có thể học cách kể chuyện, hỏi đường và xử lý tình huống thực tế.",
    accentClassName: "from-violet-500 to-fuchsia-400",
  },
  "english-section-3": {
    shortTitle: "Phần 3",
    title: "Phần 3 – Nâng cao",
    level: "Nâng cao",
    description:
      "Bạn đã nắm chắc kiến thức cơ bản và trung cấp, phù hợp với nội dung lập luận và phản biện.",
    accentClassName: "from-amber-500 to-orange-400",
  },
};

export const getPlacementSectionPresentation = (
  sectionId: PlacementSectionId
) => PLACEMENT_SECTION_PRESENTATION[sectionId];
