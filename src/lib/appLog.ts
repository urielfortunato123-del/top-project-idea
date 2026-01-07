// Lightweight in-app logging that can be downloaded from mobile.
// Stores a rolling buffer in-memory and in localStorage.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type AppLogEntry = {
  ts: string;
  level: LogLevel;
  message: string;
  data?: unknown;
};

const STORAGE_KEY = 'app_log_v1';
const MAX_ENTRIES = 800;

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '"[unserializable]"';
  }
}

function loadInitial(): AppLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_ENTRIES) as AppLogEntry[];
  } catch {
    return [];
  }
}

let buffer: AppLogEntry[] = loadInitial();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, safeJson(buffer.slice(-MAX_ENTRIES)));
  } catch {
    // ignore quota/security errors
  }
}

function add(level: LogLevel, message: string, data?: unknown) {
  const entry: AppLogEntry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(data !== undefined ? { data } : {}),
  };

  buffer = [...buffer, entry].slice(-MAX_ENTRIES);
  persist();
}

export const appLog = {
  debug: (message: string, data?: unknown) => add('debug', message, data),
  info: (message: string, data?: unknown) => add('info', message, data),
  warn: (message: string, data?: unknown) => add('warn', message, data),
  error: (message: string, data?: unknown) => add('error', message, data),
  clear: () => {
    buffer = [];
    persist();
  },
  getEntries: () => [...buffer],
  getText: () =>
    buffer
      .map((e) => {
        const data = e.data !== undefined ? ` | data=${safeJson(e.data)}` : '';
        return `${e.ts} [${e.level.toUpperCase()}] ${e.message}${data}`;
      })
      .join('\n'),
};

export function downloadAppLog(filename = `log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`) {
  const text = appLog.getText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
