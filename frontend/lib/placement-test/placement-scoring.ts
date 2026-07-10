import type {
  PlacementBand,
  PlacementBandScores,
  PlacementScoredAnswer,
  PlacementSectionId,
} from "@/types/placement-test";

const SECTION_RANK: Record<PlacementSectionId, number> = {
  "english-section-1": 1,
  "english-section-2": 2,
  "english-section-3": 3,
};

const BAND_SCORE_KEY: Record<PlacementBand, keyof PlacementBandScores> = {
  1: "basic",
  2: "intermediate",
  3: "advanced",
};

export const calculatePlacementBandScores = (
  scoredAnswers: PlacementScoredAnswer[]
): PlacementBandScores => {
  const scores: PlacementBandScores = {
    basic: 0,
    intermediate: 0,
    advanced: 0,
  };

  for (const answer of scoredAnswers) {
    if (answer.isCorrect) {
      scores[BAND_SCORE_KEY[answer.band]] += 1;
    }
  }

  return scores;
};

export const assignPlacementSection = (
  totalCorrect: number,
  bandScores: PlacementBandScores
): PlacementSectionId => {
  if (
    totalCorrect >= 9 &&
    bandScores.basic >= 2 &&
    bandScores.intermediate >= 3 &&
    bandScores.advanced >= 3
  ) {
    return "english-section-3";
  }

  if (
    totalCorrect >= 5 &&
    bandScores.basic >= 2 &&
    bandScores.intermediate >= 2
  ) {
    return "english-section-2";
  }

  return "english-section-1";
};

export const getHigherPlacementSection = (
  left: PlacementSectionId,
  right: PlacementSectionId
): PlacementSectionId => {
  return SECTION_RANK[left] >= SECTION_RANK[right] ? left : right;
};
