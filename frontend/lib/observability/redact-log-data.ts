const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "password_hash",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "set-cookie",
  "databaseurl",
  "database_url",
  "secret",
  "internalsyncsecret",
  "answers",
  "correctoptionid",
  "acceptedanswers",
  "correctorder",
]);

const normalizeKey = (key: string) =>
  key.toLowerCase().replace(/[^a-z0-9_]/g, "");

export const redactLogData = (value: unknown, depth = 0): unknown => {
  if (depth > 6) return "[MAX_DEPTH]";
  if (value === null || value === undefined) return value;
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => redactLogData(item, depth + 1));
  }
  if (typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.has(normalizeKey(key))
        ? "[REDACTED]"
        : redactLogData(item, depth + 1),
    ]),
  );
};
