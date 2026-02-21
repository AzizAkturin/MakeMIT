import { API_BASE_URL, FETCH_TIMEOUT_MS } from './config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionStatus {
  locked: boolean;
  remainingSeconds: number;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** fetch() with an AbortController timeout so the app never hangs forever. */
async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Shared request helper — throws a human-readable Error on non-2xx. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out — is the Pi reachable?');
    }
    throw new Error(
      `Network error — check API_BASE_URL in src/config.ts (${
        err instanceof Error ? err.message : String(err)
      })`,
    );
  }

  if (!response.ok) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  // Some endpoints (e.g. /session/stop) may return an empty body.
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * POST /session/start
 * Instructs the Pi to lock the device and begin a countdown.
 */
export async function startSession(minutes: number): Promise<void> {
  await request<unknown>('/session/start', {
    method: 'POST',
    body: JSON.stringify({ minutes }),
  });
}

/**
 * GET /session/status
 * Returns the current lock state and seconds remaining.
 */
export async function getSessionStatus(): Promise<SessionStatus> {
  return request<SessionStatus>('/session/status');
}

/**
 * POST /session/stop
 * Unlocks the device immediately (override / emergency).
 */
export async function stopSession(): Promise<void> {
  await request<unknown>('/session/stop', { method: 'POST' });
}
