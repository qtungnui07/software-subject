import { redactLogData } from "@/lib/observability/redact-log-data";

type LogLevel = "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const emit = (level: LogLevel, event: string, context: LogContext = {}) => {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(redactLogData(context) as Record<string, unknown>),
  });

  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
};

export const logger = {
  info: (event: string, context?: LogContext) => emit("info", event, context),
  warn: (event: string, context?: LogContext) => emit("warn", event, context),
  error: (event: string, context?: LogContext) => emit("error", event, context),
};
