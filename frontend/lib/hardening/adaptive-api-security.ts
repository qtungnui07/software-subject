const PRIVILEGED_TOP_LEVEL_FIELDS = new Set([
  "userId",
  "xp",
  "earnedXp",
  "totalXp",
  "streak",
  "questProgress",
  "unlockedSectionIds",
  "currentSectionId",
  "nextSectionId",
  "assignedSectionId",
  "highestAssignedSectionId",
  "onboardingCompleted",
]);

export const findPrivilegedTopLevelFields = (value: unknown): string[] => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.keys(value).filter((key) =>
    PRIVILEGED_TOP_LEVEL_FIELDS.has(key),
  );
};

export const hasPrivilegedTopLevelFields = (value: unknown) =>
  findPrivilegedTopLevelFields(value).length > 0;

export const redactSensitiveErrorDetails = (value: unknown): string => {
  if (value instanceof Error) {
    return value.name;
  }

  return typeof value === "string" ? "string-error" : "unknown-error";
};
