import { useState, useEffect, useCallback, useRef } from 'react';

import {
  getSessionStatus,
  startSession,
  stopSession,
  type SessionStatus,
} from '../api';
import { POLL_INTERVAL_MS } from '../config';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConnectionState = 'connecting' | 'connected' | 'error';

export interface UseSessionReturn {
  status: SessionStatus | null;
  connection: ConnectionState;
  error: string | null;
  isStarting: boolean;
  isStopping: boolean;
  start: (minutes: number) => Promise<void>;
  stop: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages Pi session state.
 *
 * • Polls GET /session/status every POLL_INTERVAL_MS while mounted.
 * • `start` / `stop` call the API then immediately refresh status.
 */
export function useSession(): UseSessionReturn {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Keep a stable ref to the latest poll fn so start/stop can call it
  // without capturing stale state from the effect closure.
  const pollRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    let active = true;

    const poll = async () => {
      if (!active) return;
      try {
        const s = await getSessionStatus();
        if (!active) return;
        setStatus(s);
        setConnection('connected');
        setError(null);
      } catch (err: unknown) {
        if (!active) return;
        setConnection('error');
        setError(err instanceof Error ? err.message : 'Connection failed');
      }
    };

    pollRef.current = poll;
    poll(); // immediate first fetch

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []); // intentionally empty — poll fn captures setters which are stable

  const start = useCallback(async (minutes: number) => {
    setIsStarting(true);
    setError(null);
    try {
      await startSession(minutes);
      await pollRef.current();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stop = useCallback(async () => {
    setIsStopping(true);
    setError(null);
    try {
      await stopSession();
      await pollRef.current();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to stop session');
    } finally {
      setIsStopping(false);
    }
  }, []);

  return { status, connection, error, isStarting, isStopping, start, stop };
}
