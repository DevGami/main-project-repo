# Redis Live Leaderboard

A mini project built to learn how Redis works in practice — using real Redis data structures (Sorted Sets, Strings) through a live Express API and an interactive dashboard.

## What This Project Teaches

| Redis Command | Endpoint | Use Case |
|---|---|---|
| `ZINCRBY` | `POST /leaderboard/score` | Add points to a user (Sorted Set) |
| `ZREVRANGE … WITHSCORES` | `GET /leaderboard` | Fetch top 10 players in order |
| `ZREVRANK` | `GET /leaderboard/:userid/rank` | Get a specific user's rank |
| `ZSCORE` | Used as guard in view endpoint | Check if user exists |
| `INCR` | `POST /post/:id/view` | Increment post view counter atomically |
| `DEL` | `DELETE /leaderboard/reset` | Wipe the leaderboard |
| `PING` | `GET /ping` | Health check |
| Pipeline | Rank + Score fetch | Batch two commands in one round-trip |

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Redis Client**: [ioredis](https://github.com/redis/ioredis)
- **Redis**: v7+ (via Docker or local install)
- **Frontend**: Vanilla HTML + CSS + JS (no framework)

---

## Project Structure

```
redis-live-leaderboard/
├── server.js          # Express server — all API endpoints
├── package.json
├── .gitignore
└── public/
    ├── index.html     # Live dashboard UI
    ├── style.css      # Dark theme with animations
    └── app.js         # Frontend logic (fetch calls + rendering)
```

---

## Getting Started

### 1. Start Redis

**Using Docker (recommended):**
```bash
docker run -d --name redis-leaderboard -p 6379:6379 redis:alpine
```

**Next time (already pulled):**
```bash
docker start redis-leaderboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
node server.js
# or for auto-restart on file change:
node --watch server.js
```

### 4. Open the dashboard
```
http://localhost:3000
```

---

## API Endpoints

### `POST /leaderboard/score`
Add points to a user. Creates the user if they don't exist yet.
```json
// Request body
{ "userId": "alice", "points": 100 }

// Response
{ "success": true, "userId": "alice", "newTotalScore": 250 }
```
**Redis:** `ZINCRBY game_leaderboard 100 alice`

---

### `GET /leaderboard`
Get the top 10 players in descending score order.
```json
{
  "leaderboard": [
    { "rank": 1, "userId": "alice", "score": 250 },
    { "rank": 2, "userId": "bob",   "score": 175 }
  ]
}
```
**Redis:** `ZREVRANGE game_leaderboard 0 9 WITHSCORES`

---

### `GET /leaderboard/:userid/rank`
Get the rank and score of a specific user.
```json
{ "userId": "alice", "rank": 1, "score": 250 }
```
**Redis:** `ZREVRANK game_leaderboard alice` + `ZSCORE` (in one pipeline)

---

### `POST /post/:id/view`
Increment the view count of a user's post. The user must already exist in the leaderboard.
```json
{ "postId": "alice", "totalViews": 5 }
```
**Redis:** `ZSCORE` (existence check) → `INCR post:alice:views`

---

### `DELETE /leaderboard/reset`
Wipe the entire leaderboard.
```json
{ "success": true, "keysDeleted": 1 }
```
**Redis:** `DEL game_leaderboard`

---

### `GET /ping`
Health check — confirms Redis connection is alive.
```json
{ "success": true, "redis": "PONG", "status": "ready" }
```

---

## Key Redis Concepts Demonstrated

### Sorted Sets
The entire leaderboard is one Redis Sorted Set (`game_leaderboard`). Redis keeps it sorted by score automatically. Insertion, update, and rank retrieval are all **O(log N)**.

### Atomic INCR
View counts use the `INCR` command — it reads and writes in a single atomic operation. No race condition possible even under concurrent requests.

### 0-indexed ranks
`ZREVRANK` returns ranks starting from 0 (first place = 0). The server adds +1 before sending to the client so users see Rank #1, #2, etc.

### Pipelines
The rank endpoint uses `redis.pipeline()` to batch `ZREVRANK + ZSCORE` into a single network round-trip instead of two.

---

## Dashboard Features

- ➕ Add score to any user
- 👁️ Increment post views (only for existing leaderboard users)
- 🔍 Look up any user's rank
- 🗑️ Clear all leaderboard data (2-click confirm, no popup)
- 📡 Redis connection status indicator
- ⌨️ Live Redis command log showing every command fired
- 🔄 Auto-refresh every 5 seconds
