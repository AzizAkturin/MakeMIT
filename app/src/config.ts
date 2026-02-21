/**
 * PhoneLock app configuration.
 *
 * To point the app at your Raspberry Pi:
 *   1. Find the Pi's IP on your local network (run `hostname -I` on the Pi).
 *   2. Replace the value below with  http://<PI_IP>:<PORT>
 *   3. Save and reload Expo.
 */

/** Base URL of the Pi HTTP server — no trailing slash. */
export const API_BASE_URL = 'http://192.168.1.100:8080';

/** How often (ms) to poll GET /session/status while the app is open. */
export const POLL_INTERVAL_MS = 1000;

/** Fetch timeout in ms — keeps the UI responsive when the Pi is unreachable. */
export const FETCH_TIMEOUT_MS = 3000;
