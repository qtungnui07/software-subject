export const normalizeStudySeconds = (value: unknown) => {
  const seconds = Number(value);

  if (!Number.isFinite(seconds)) {
    return 0;
  }

  return Math.max(0, Math.trunc(seconds));
};

export const getWholeStudyMinutes = (seconds: unknown) =>
  Math.floor(normalizeStudySeconds(seconds) / 60);

export const formatStudyDuration = (seconds: unknown) => {
  const totalMinutes = getWholeStudyMinutes(seconds);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} phút`;
  }

  if (minutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${minutes} phút`;
};
