import type { ProgressCourse, ProgressLesson, ProgressUnit } from "@/data/progress-data";

export type UnitStatus = "completed" | "active" | "locked";

export type CourseProgressSummary = {
  courseId?: string;
  totalLessons: number;
  completedLessons: number;
  currentLessons: number;
  availableLessons: number;
  lockedLessons: number;
  completionPercent: number;
  earnedXp: number;
  totalXp: number;
  completedMinutes: number;
  totalMinutes: number;
  currentLesson?: ProgressLesson;
  currentUnit?: ProgressUnit;
};

export type UnitProgressSummary = {
  unitId: number;
  totalLessons: number;
  completedLessons: number;
  currentLessons: number;
  availableLessons: number;
  lockedLessons: number;
  completionPercent: number;
  earnedXp: number;
  totalXp: number;
  completedMinutes: number;
  totalMinutes: number;
  status: UnitStatus;
};

const percent = (value: number, total: number) => {
  if (total <= 0) return 0;

  return Math.round((value / total) * 100);
};

export const getAllLessons = (units: ProgressUnit[]) => {
  return units.flatMap((unit) => unit.lessons);
};

export const getTotalLessons = (units: ProgressUnit[]) => {
  return getAllLessons(units).length;
};

export const getLessonsByStatus = (
  units: ProgressUnit[],
  status: ProgressLesson["status"]
) => {
  return getAllLessons(units).filter((lesson) => lesson.status === status);
};

export const getCompletedLessons = (units: ProgressUnit[]) => {
  return getLessonsByStatus(units, "completed").length;
};

export const getCurrentLessons = (units: ProgressUnit[]) => {
  return getLessonsByStatus(units, "current").length;
};

export const getAvailableLessons = (units: ProgressUnit[]) => {
  return getLessonsByStatus(units, "available").length;
};

export const getLockedLessons = (units: ProgressUnit[]) => {
  return getLessonsByStatus(units, "locked").length;
};

export const getCompletionPercent = (units: ProgressUnit[]) => {
  return percent(getCompletedLessons(units), getTotalLessons(units));
};

export const getEarnedXp = (units: ProgressUnit[]) => {
  return getLessonsByStatus(units, "completed").reduce(
    (total, lesson) => total + lesson.xpReward,
    0
  );
};

export const getTotalXp = (units: ProgressUnit[]) => {
  return getAllLessons(units).reduce(
    (total, lesson) => total + lesson.xpReward,
    0
  );
};

export const getCompletedMinutes = (units: ProgressUnit[]) => {
  return getLessonsByStatus(units, "completed").reduce(
    (total, lesson) => total + lesson.estimatedMinutes,
    0
  );
};

export const getTotalMinutes = (units: ProgressUnit[]) => {
  return getAllLessons(units).reduce(
    (total, lesson) => total + lesson.estimatedMinutes,
    0
  );
};

export const getCurrentLesson = (units: ProgressUnit[]) => {
  return getAllLessons(units).find((lesson) => lesson.status === "current");
};

export const getCurrentUnit = (units: ProgressUnit[]) => {
  return units.find((unit) =>
    unit.lessons.some((lesson) => lesson.status === "current")
  );
};

export const getCourseProgressSummary = (
  courseOrUnits: ProgressCourse | ProgressUnit[]
): CourseProgressSummary => {
  const units = Array.isArray(courseOrUnits) ? courseOrUnits : courseOrUnits.units;

  return {
    courseId: Array.isArray(courseOrUnits) ? undefined : courseOrUnits.id,
    totalLessons: getTotalLessons(units),
    completedLessons: getCompletedLessons(units),
    currentLessons: getCurrentLessons(units),
    availableLessons: getAvailableLessons(units),
    lockedLessons: getLockedLessons(units),
    completionPercent: getCompletionPercent(units),
    earnedXp: getEarnedXp(units),
    totalXp: getTotalXp(units),
    completedMinutes: getCompletedMinutes(units),
    totalMinutes: getTotalMinutes(units),
    currentLesson: getCurrentLesson(units),
    currentUnit: getCurrentUnit(units),
  };
};

export const getUnitCompletedLessons = (unit: ProgressUnit) => {
  return unit.lessons.filter((lesson) => lesson.status === "completed").length;
};

export const getUnitCurrentLessons = (unit: ProgressUnit) => {
  return unit.lessons.filter((lesson) => lesson.status === "current").length;
};

export const getUnitAvailableLessons = (unit: ProgressUnit) => {
  return unit.lessons.filter((lesson) => lesson.status === "available").length;
};

export const getUnitLockedLessons = (unit: ProgressUnit) => {
  return unit.lessons.filter((lesson) => lesson.status === "locked").length;
};

export const getUnitCompletionPercent = (unit: ProgressUnit) => {
  return percent(getUnitCompletedLessons(unit), unit.lessons.length);
};

export const getUnitEarnedXp = (unit: ProgressUnit) => {
  return unit.lessons
    .filter((lesson) => lesson.status === "completed")
    .reduce((total, lesson) => total + lesson.xpReward, 0);
};

export const getUnitTotalXp = (unit: ProgressUnit) => {
  return unit.lessons.reduce((total, lesson) => total + lesson.xpReward, 0);
};

export const getUnitCompletedMinutes = (unit: ProgressUnit) => {
  return unit.lessons
    .filter((lesson) => lesson.status === "completed")
    .reduce((total, lesson) => total + lesson.estimatedMinutes, 0);
};

export const getUnitTotalMinutes = (unit: ProgressUnit) => {
  return unit.lessons.reduce(
    (total, lesson) => total + lesson.estimatedMinutes,
    0
  );
};

export const getUnitStatus = (unit: ProgressUnit): UnitStatus => {
  const totalLessons = unit.lessons.length;
  const completedLessons = getUnitCompletedLessons(unit);
  const activeLessons = getUnitCurrentLessons(unit) + getUnitAvailableLessons(unit);

  if (totalLessons > 0 && completedLessons === totalLessons) {
    return "completed";
  }

  if (completedLessons > 0 || activeLessons > 0) {
    return "active";
  }

  return "locked";
};

export const getUnitProgressSummary = (
  unit: ProgressUnit
): UnitProgressSummary => {
  return {
    unitId: unit.id,
    totalLessons: unit.lessons.length,
    completedLessons: getUnitCompletedLessons(unit),
    currentLessons: getUnitCurrentLessons(unit),
    availableLessons: getUnitAvailableLessons(unit),
    lockedLessons: getUnitLockedLessons(unit),
    completionPercent: getUnitCompletionPercent(unit),
    earnedXp: getUnitEarnedXp(unit),
    totalXp: getUnitTotalXp(unit),
    completedMinutes: getUnitCompletedMinutes(unit),
    totalMinutes: getUnitTotalMinutes(unit),
    status: getUnitStatus(unit),
  };
};

export const getAllUnitProgressSummaries = (units: ProgressUnit[]) => {
  return units.map((unit) => getUnitProgressSummary(unit));
};

export const isLessonCompleted = (lesson: ProgressLesson) => {
  return lesson.status === "completed";
};

export const isLessonUnlocked = (lesson: ProgressLesson) => {
  return lesson.status !== "locked";
};

export const isUnitUnlocked = (unit: ProgressUnit) => {
  return getUnitStatus(unit) !== "locked";
};
