/**
 * Mock API layer — simulates a real backend so the frontend feels
 * server-backed even though everything is localStorage under the hood.
 *
 * - Every call returns a Promise.
 * - Each call sleeps for 150–450ms (configurable) to look real.
 * - Occasional simulated network errors (configurable rate, default 0%).
 * - All real backend swaps happen here — UI components never touch
 *   localStorage directly. To go to a real API, change one function.
 *
 * Usage:
 *   const result = await api.placeOrder(payload);
 *   if (!result.ok) toast.error(result.error);
 */

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiErr {
  ok: false;
  error: string;
  /** Optional HTTP-ish status code for downstream branching. */
  status?: number;
}

export type ApiResult<T> = ApiOk<T> | ApiErr;

interface ApiConfig {
  minDelayMs: number;
  maxDelayMs: number;
  /** 0.0–1.0 — probability of a simulated network failure */
  failureRate: number;
}

let CONFIG: ApiConfig = {
  minDelayMs: 150,
  maxDelayMs: 450,
  failureRate: 0,
};

export function configureMockApi(patch: Partial<ApiConfig>): void {
  CONFIG = { ...CONFIG, ...patch };
}

function randDelay(): number {
  return Math.floor(
    CONFIG.minDelayMs + Math.random() * (CONFIG.maxDelayMs - CONFIG.minDelayMs),
  );
}

function shouldFail(): boolean {
  return CONFIG.failureRate > 0 && Math.random() < CONFIG.failureRate;
}

/** Sleep helper. Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Wrap a synchronous "thunk" as an async API call with realistic delay +
 * occasional failures. Used by every domain-level helper below.
 */
export async function call<T>(
  thunk: () => T | Promise<T>,
  options?: { errorMessage?: string },
): Promise<ApiResult<T>> {
  await sleep(randDelay());
  if (shouldFail()) {
    return {
      ok: false,
      error: options?.errorMessage ?? "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন",
      status: 503,
    };
  }
  try {
    const data = await thunk();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "অজানা সমস্যা",
      status: 500,
    };
  }
}

/**
 * Typed error helper for domain code that needs to short-circuit early.
 */
export function apiError(error: string, status = 400): ApiErr {
  return { ok: false, error, status };
}

/**
 * Typed success helper.
 */
export function apiOk<T>(data: T): ApiOk<T> {
  return { ok: true, data };
}
