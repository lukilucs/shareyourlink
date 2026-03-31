type CounterState = {
  windowStartMs: number;
  count: number;
  lastTouchedMs: number;
};

type LookupFailureState = {
  failures: number;
  lastFailureAtMs: number;
  blockedUntilMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const RATE_WINDOW_MS = 60 * 1000;
const CREATE_LIMIT_PER_MIN = 5;
const READ_LIMIT_PER_MIN = 5;
const READ_FAIL_LIMIT_PER_MIN = 8;

const FAILURE_RESET_MS = 15 * 60 * 1000;
const SHORT_COOLDOWN_MS = 30 * 1000;
const MEDIUM_COOLDOWN_MS = 2 * 60 * 1000;
const LONG_COOLDOWN_MS = 10 * 60 * 1000;

const counterStore = new Map<string, CounterState>();
const lookupFailureStore = new Map<string, LookupFailureState>();

let operationCount = 0;

function toRetryAfterSeconds(milliseconds: number): number {
  return Math.max(1, Math.ceil(milliseconds / 1000));
}

function maybeCleanup(nowMs: number): void {
  operationCount += 1;
  if (operationCount % 100 !== 0) {
    return;
  }

  for (const [key, value] of counterStore) {
    if (nowMs - value.lastTouchedMs > RATE_WINDOW_MS * 2) {
      counterStore.delete(key);
    }
  }

  for (const [key, value] of lookupFailureStore) {
    const isIdle = nowMs - value.lastFailureAtMs > FAILURE_RESET_MS;
    const isUnblocked = value.blockedUntilMs <= nowMs;
    if (isIdle && isUnblocked) {
      lookupFailureStore.delete(key);
    }
  }
}

function enforceFixedWindowLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const nowMs = Date.now();
  maybeCleanup(nowMs);

  const current = counterStore.get(key);

  if (!current || nowMs - current.windowStartMs >= windowMs) {
    counterStore.set(key, {
      windowStartMs: nowMs,
      count: 1,
      lastTouchedMs: nowMs,
    });

    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: toRetryAfterSeconds(
        current.windowStartMs + windowMs - nowMs,
      ),
    };
  }

  current.count += 1;
  current.lastTouchedMs = nowMs;
  counterStore.set(key, current);

  return { allowed: true, retryAfterSeconds: 0 };
}

function bucketKey(type: "create" | "read" | "read-fail", clientId: string): string {
  return `${type}:${clientId}`;
}

export function enforceCreateRateLimit(clientId: string): RateLimitResult {
  return enforceFixedWindowLimit(
    bucketKey("create", clientId),
    CREATE_LIMIT_PER_MIN,
    RATE_WINDOW_MS,
  );
}

export function enforceReadRateLimit(clientId: string): RateLimitResult {
  return enforceFixedWindowLimit(
    bucketKey("read", clientId),
    READ_LIMIT_PER_MIN,
    RATE_WINDOW_MS,
  );
}

export function enforceReadFailureRateLimit(clientId: string): RateLimitResult {
  return enforceFixedWindowLimit(
    bucketKey("read-fail", clientId),
    READ_FAIL_LIMIT_PER_MIN,
    RATE_WINDOW_MS,
  );
}

export function getLookupCooldown(clientId: string): RateLimitResult {
  const nowMs = Date.now();
  const state = lookupFailureStore.get(clientId);

  if (!state || state.blockedUntilMs <= nowMs) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: toRetryAfterSeconds(state.blockedUntilMs - nowMs),
  };
}

export function registerLookupFailure(clientId: string): void {
  const nowMs = Date.now();
  const previous = lookupFailureStore.get(clientId);

  const isExpired =
    !previous || nowMs - previous.lastFailureAtMs > FAILURE_RESET_MS;

  const nextFailures = isExpired ? 1 : previous.failures + 1;

  let cooldownMs = 0;
  if (nextFailures >= 24) {
    cooldownMs = LONG_COOLDOWN_MS;
  } else if (nextFailures >= 16) {
    cooldownMs = MEDIUM_COOLDOWN_MS;
  } else if (nextFailures >= 8) {
    cooldownMs = SHORT_COOLDOWN_MS;
  }

  lookupFailureStore.set(clientId, {
    failures: nextFailures,
    lastFailureAtMs: nowMs,
    blockedUntilMs: Math.max(previous?.blockedUntilMs ?? 0, nowMs + cooldownMs),
  });
}

export function registerLookupSuccess(clientId: string): void {
  lookupFailureStore.delete(clientId);
}
