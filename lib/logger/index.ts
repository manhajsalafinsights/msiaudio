type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configured = (process.env.LOG_LEVEL as LogLevel | undefined) ?? "info";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[configured];
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (!shouldLog(level)) return;
  const timestamp = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta)}` : "";
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${payload}`;

  switch (level) {
    case "debug":
      console.debug(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
    default:
      console.info(line);
  }
}

/**
 * Logger antarmuka konsisten.
 * Saat ini berbasis console; bisa diganti implementasi pino tanpa
 * mengubah pemanggil (lihat architecture.md §16).
 */
export const logger = {
  debug: (message: string, meta?: LogMeta) => write("debug", message, meta),
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
};
