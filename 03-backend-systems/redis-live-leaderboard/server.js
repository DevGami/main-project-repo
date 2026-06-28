const express = require("express");
const Redis = require("ioredis");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// ─── Redis Connection ──────────────────────────────────────────────────────────
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

redis.on("connect", () => console.log("✅ Redis connected successfully"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));

// Middleware to reject all requests if Redis is not yet ready
function requireRedis(req, res, next) {
  if (redis.status !== "ready") {
    return res.status(503).json({
      success: false,
      error: `Redis not ready (status: ${redis.status}). Is redis-server running?`,
    });
  }
  next();
}

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── LEADERBOARD KEY ──────────────────────────────────────────────────────────
const LEADERBOARD_KEY = "game_leaderboard";

// ──────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK: GET /ping
// Lightweight endpoint used by the frontend status indicator.
// Does not touch leaderboard data — just confirms Redis is alive.
// ──────────────────────────────────────────────────────────────────────────────
app.get("/ping", async (req, res) => {
  // Check status FIRST — redis.ping() with enableOfflineQueue:true (ioredis default)
  // would queue the command and hang indefinitely instead of failing fast.
  if (redis.status !== "ready") {
    return res.status(503).json({
      success: false,
      error: `Redis not ready (status: ${redis.status})`,
      status: redis.status,
    });
  }
  try {
    const pong = await redis.ping();
    res.json({ success: true, redis: pong, status: redis.status });
  } catch (err) {
    res.status(503).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// ENDPOINT 1: POST /post/:id/view
// Increment view count of a post using INCR
// Redis key pattern: post:{id}:views
// ──────────────────────────────────────────────────────────────────────────────
app.post("/post/:id/view", requireRedis, async (req, res) => {
  const { id } = req.params;
  const key = `post:${id}:views`;

  try {
    // Guard: only allow view increments for users that actually exist
    // in the leaderboard (i.e. have a score entry in the sorted set).
    // ZSCORE returns null when the member doesn't exist.
    const score = await redis.zscore(LEADERBOARD_KEY, id);
    if (score === null) {
      return res.status(404).json({
        success: false,
        error: `"${id}" is not in the leaderboard. Add them via POST /leaderboard/score first.`,
        hint: "ZSCORE returned null — member does not exist in the sorted set",
      });
    }

    // INCR atomically increments the integer at key by 1.
    // Key is auto-created at 0 if it doesn’t exist yet (first view = 1).
    const newCount = await redis.incr(key);

    res.json({
      success: true,
      postId: id,
      key,
      totalViews: newCount,
      redisCommand: `INCR ${key}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// ENDPOINT 2: POST /leaderboard/score
// Add points to a user using ZINCRBY on a Sorted Set
// Body: { userId: string, points: number }
// ──────────────────────────────────────────────────────────────────────────────
app.post("/leaderboard/score", requireRedis, async (req, res) => {
  const { userId, points } = req.body;

  // Use == null instead of !userId so that "0" or "false" are valid user IDs
  if (userId == null || String(userId).trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Request body must include userId (non-empty string)",
    });
  }
  if (points === undefined || points === null) {
    return res.status(400).json({
      success: false,
      error: "Request body must include points (number)",
    });
  }

  const numPoints = Number(points);
  if (isNaN(numPoints)) {
    return res.status(400).json({ success: false, error: "points must be a number" });
  }

  try {
    // ZINCRBY key increment member
    // Increments the score of 'userId' in the sorted set by 'numPoints'.
    // Returns the new score as a string.
    const newScore = await redis.zincrby(LEADERBOARD_KEY, numPoints, userId);

    res.json({
      success: true,
      userId,
      pointsAdded: numPoints,
      newTotalScore: parseFloat(newScore),
      redisCommand: `ZINCRBY ${LEADERBOARD_KEY} ${numPoints} ${userId}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// ENDPOINT 3: GET /leaderboard
// Get top 10 users using ZREVRANGE with WITHSCORES
// ──────────────────────────────────────────────────────────────────────────────
app.get("/leaderboard", requireRedis, async (req, res) => {
  try {
    // ZREVRANGE key start stop WITHSCORES
    // Returns members in the sorted set in descending order of score.
    // 0 = first, 9 = tenth (0-indexed). WITHSCORES includes the score values.
    // ioredis returns a flat array: [member1, score1, member2, score2, ...]
    const raw = await redis.zrevrange(LEADERBOARD_KEY, 0, 9, "WITHSCORES");

    // Convert flat array to array of objects
    const leaderboard = [];
    for (let i = 0; i < raw.length; i += 2) {
      leaderboard.push({
        rank: i / 2 + 1,        // Redis is 0-indexed → convert to 1-indexed
        userId: raw[i],
        score: parseFloat(raw[i + 1]),
      });
    }

    res.json({
      success: true,
      total: leaderboard.length,
      redisCommand: `ZREVRANGE ${LEADERBOARD_KEY} 0 9 WITHSCORES`,
      leaderboard,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// BONUS: DELETE /leaderboard/reset — reset leaderboard (for testing)
// IMPORTANT: This route MUST be registered before GET /leaderboard/:userid/rank
// Otherwise Express would never reach this handler (wildcard :userid catches it).
// ──────────────────────────────────────────────────────────────────────────────
app.delete("/leaderboard/reset", requireRedis, async (req, res) => {
  try {
    const deleted = await redis.del(LEADERBOARD_KEY);
    res.json({
      success: true,
      message: "Leaderboard cleared",
      keysDeleted: deleted,           // 1 if existed, 0 if was already empty
      redisCommand: `DEL ${LEADERBOARD_KEY}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// ENDPOINT 4: GET /leaderboard/:userid/rank
// Get the rank of a specific user using ZREVRANK
// ──────────────────────────────────────────────────────────────────────────────
app.get("/leaderboard/:userid/rank", requireRedis, async (req, res) => {
  const { userid } = req.params;

  try {
    // Use a pipeline to batch ZREVRANK + ZSCORE into a single round-trip.
    // Without pipeline these would be 2 serial network calls to Redis.
    const [[rankErr, rawRank], [scoreErr, rawScore]] = await redis
      .pipeline()
      .zrevrank(LEADERBOARD_KEY, userid)
      .zscore(LEADERBOARD_KEY, userid)
      .exec();

    if (rankErr) throw rankErr;
    if (scoreErr) throw scoreErr;

    // ZREVRANK returns null when the member doesn't exist in the sorted set
    if (rawRank === null) {
      return res.status(404).json({
        success: false,
        userId: userid,
        error: "User not found in leaderboard",
      });
    }

    res.json({
      success: true,
      userId: userid,
      rank: rawRank + 1,    // +1 because Redis is 0-indexed
      score: parseFloat(rawScore),
      redisCommand: `ZREVRANK ${LEADERBOARD_KEY} ${userid}  (+ ZSCORE in pipeline)`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// BONUS: GET /post/:id/views  — see view count of a post
// ──────────────────────────────────────────────────────────────────────────────
app.get("/post/:id/views", requireRedis, async (req, res) => {
  const { id } = req.params;
  const key = `post:${id}:views`;
  try {
    const count = await redis.get(key);
    res.json({
      success: true,
      postId: id,
      // Use Number() not parseInt() — parseInt("10abc") silently returns 10
      // which would hide Redis key corruption. Number() returns NaN for bad data.
      totalViews: count !== null ? Number(count) : 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard:      http://localhost:${PORT}/`);
  console.log(`\n📚 Redis Commands in use:`);
  console.log(`   INCR post:{id}:views`);
  console.log(`   ZINCRBY ${LEADERBOARD_KEY} {points} {userId}`);
  console.log(`   ZREVRANGE ${LEADERBOARD_KEY} 0 9 WITHSCORES`);
  console.log(`   ZREVRANK ${LEADERBOARD_KEY} {userId}`);
});
