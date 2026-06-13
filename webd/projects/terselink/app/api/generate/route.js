
import { getLinksCollection } from "@/lib/mongodb"
import { generateAlias, validateCreateLinkInput } from "@/lib/links.mjs"
import { checkRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

const MAX_BODY_BYTES = 4096
const MAX_GENERATION_ATTEMPTS = 5

function json(body, status, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  })
}

function getClientIdentifier(request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || "anonymous"
}

export async function POST(request) {
  const contentLength = Number(request.headers.get("content-length") || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return json({ success: false, message: "Request body is too large." }, 413)
  }

  const rateLimit = checkRateLimit(getClientIdentifier(request))
  const rateLimitHeaders = {
    "X-RateLimit-Limit": "12",
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
  }

  if (!rateLimit.allowed) {
    return json(
      { success: false, message: "Too many links created. Try again in a minute." },
      429,
      rateLimitHeaders
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json(
      { success: false, message: "Request body must contain valid JSON." },
      400,
      rateLimitHeaders
    )
  }

  const validation = validateCreateLinkInput(body)
  if (validation.error) {
    return json(
      { success: false, message: validation.error },
      422,
      rateLimitHeaders
    )
  }

  try {
    const collection = await getLinksCollection()
    const requestedAlias = validation.value.shorturl

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const shorturl = requestedAlias || generateAlias()

      try {
        await collection.insertOne({
          url: validation.value.url,
          shorturl,
          createdAt: new Date(),
        })

        const shortUrl = new URL(`/${shorturl}`, request.url).toString()
        return json(
          {
            success: true,
            message: "Short link created.",
            data: {
              shorturl,
              shortUrl,
              url: validation.value.url,
            },
          },
          201,
          rateLimitHeaders
        )
      } catch (error) {
        if (error?.code !== 11000) {
          throw error
        }

        if (requestedAlias) {
          return json(
            { success: false, message: "That alias is already in use." },
            409,
            rateLimitHeaders
          )
        }
      }
    }

    return json(
      { success: false, message: "Could not generate a unique alias. Try again." },
      503,
      rateLimitHeaders
    )
  } catch (error) {
    console.error("Failed to create short link", error)
    return json(
      { success: false, message: "The link service is temporarily unavailable." },
      503,
      rateLimitHeaders
    )
  }
}
