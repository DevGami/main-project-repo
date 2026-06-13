const WINDOW_MS = 60_000
const MAX_REQUESTS = 12

function getStore() {
  if (!global._terseLinkRateLimits) {
    global._terseLinkRateLimits = new Map()
  }

  return global._terseLinkRateLimits
}

export function checkRateLimit(identifier) {
  const now = Date.now()
  const store = getStore()
  const current = store.get(identifier)

  if (!current || current.resetAt <= now) {
    const resetAt = now + WINDOW_MS
    store.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt }
  }

  current.count += 1
  store.set(identifier, current)

  return {
    allowed: current.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - current.count),
    resetAt: current.resetAt,
  }
}
