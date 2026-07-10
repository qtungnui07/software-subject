export type NormalizeTextAnswerOptions = {
  caseSensitive?: boolean;
  ignoreTerminalPunctuation?: boolean;
};

const normalizeApostrophes = (value: string) => value.replace(/[‘’]/g, "'");

export const normalizeTextAnswer = (
  value: string,
  options: NormalizeTextAnswerOptions = {}
) => {
  const { caseSensitive = false, ignoreTerminalPunctuation = true } = options;

  let normalized = normalizeApostrophes(value)
    .trim()
    .replace(/\s+/g, " ");

  if (ignoreTerminalPunctuation) {
    normalized = normalized.replace(/[.!?]+$/g, "").trim();
  }

  return caseSensitive ? normalized : normalized.toLocaleLowerCase("en-US");
};
