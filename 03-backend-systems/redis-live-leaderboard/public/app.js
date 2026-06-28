// ─────────────────────────────────────────────────────────────────────────────
// Redis Leaderboard — Frontend JS
// Connects to the Express/ioredis backend and drives the dashboard UI.
// ─────────────────────────────────────────────────────────────────────────────

const API = "";  // Same origin — no prefix needed

// Guard: prevent overlapping concurrent leaderboard fetches
let fetchInFlight = false;

// Avatar colours cycling for player cards
const AVATAR_COLORS = [
  "#7c3aed","#0891b2","#059669","#d97706",
  "#db2777","#4f46e5","#0e7490","#b45309",
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function avatarColor(userId) {
  let hash = 0;
  for (const c of String(userId)) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function avatarInitials(userId) {
  return String(userId).slice(0, 2).toUpperCase();
}

function fmtTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function rankClass(rank) {
  if (rank === 1) return "rank-1";
  if (rank === 2) return "rank-2";
  if (rank === 3) return "rank-3";
  return "rank-n";
}

function rankEmoji(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

// ─── Command Log ──────────────────────────────────────────────────────────────

function log(msg, type = "info") {
  const logEl = document.getElementById("commandLog");
  const entry = document.createElement("div");
  entry.className = `log-entry log-${type}`;
  entry.textContent = `[${fmtTime()}] ${msg}`;
  // Prepend so newest is at top
  logEl.insertBefore(entry, logEl.firstChild);
  // Cap at 50 entries
  while (logEl.children.length > 50) logEl.removeChild(logEl.lastChild);
}

function clearLog() {
  document.getElementById("commandLog").innerHTML =
    '<div class="log-entry log-info">Log cleared.</div>';
}

// ─── Response Box Helper ──────────────────────────────────────────────────────

function showResponse(id, data, isError = false) {
  const el = document.getElementById(id);
  el.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  el.className = `response-box show ${isError ? "error" : "ok"}`;
}

// ─── Redis Status ─────────────────────────────────────────────────────────────

async function checkStatus() {
  const dot = document.getElementById("redisDot");
  const statusText = document.getElementById("redisStatus");
  try {
    // Use the lightweight /ping endpoint — avoids a full ZREVRANGE just to test connectivity
    const res  = await fetch(`${API}/ping`);
    const data = await res.json();
    if (res.ok && data.success) {
      dot.className = "redis-dot connected";
      statusText.textContent = "Redis Connected";
    } else {
      throw new Error(data.error ?? "not ok");
    }
  } catch {
    dot.className = "redis-dot error";
    statusText.textContent = "Redis Offline";
  }
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function updateStats(leaderboard) {
  document.getElementById("totalPlayers").textContent = leaderboard.length;
  document.getElementById("topPlayer").textContent    = leaderboard[0]?.userId ?? "—";
  document.getElementById("topScore").textContent     = leaderboard[0]?.score  ?? "—";
  document.getElementById("lastUpdated").textContent  = fmtTime();
}

// ─── Leaderboard Fetch & Render ───────────────────────────────────────────────

// silent=true suppresses the log line — used by the auto-refresh interval
async function fetchLeaderboard(silent = false) {
  // Prevent multiple overlapping requests (e.g. auto-refresh + manual click)
  if (fetchInFlight) return;
  fetchInFlight = true;

  const refreshIcon = document.getElementById("refreshIcon");
  refreshIcon.className = "spinning";

  try {
    if (!silent) log("GET /leaderboard  →  ZREVRANGE game_leaderboard 0 9 WITHSCORES", "cmd");
    const res  = await fetch(`${API}/leaderboard`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    renderLeaderboard(data.leaderboard);
    updateStats(data.leaderboard);
    if (!silent) log(`✅ Fetched ${data.leaderboard.length} players`, "success");
  } catch (err) {
    log(`❌ Leaderboard fetch error: ${err.message}`, "error");
  } finally {
    fetchInFlight = false;
    refreshIcon.className = "";
    refreshIcon.textContent = "↻";
  }
}

function renderLeaderboard(leaderboard) {
  const list = document.getElementById("leaderboardList");

  if (!leaderboard.length) {
    list.innerHTML = `
      <div class="lb-empty">
        <div class="lb-empty-icon">📭</div>
        <p>No players yet.</p>
        <p class="lb-empty-sub">Add some scores using the panel on the left!</p>
      </div>`;
    return;
  }

  const maxScore = leaderboard[0]?.score || 1;

  list.innerHTML = leaderboard.map((player, i) => {
    const color = avatarColor(player.userId);
    const barPct = Math.max(5, (player.score / maxScore) * 100).toFixed(1);
    const delay  = i * 40;                          // staggered animation

    return `
    <div class="lb-item" style="animation-delay:${delay}ms; position:relative;">
      <div class="lb-rank ${rankClass(player.rank)}">${rankEmoji(player.rank)}</div>
      <div class="lb-avatar" style="background:${color};">${avatarInitials(player.userId)}</div>
      <div class="lb-info">
        <div class="lb-user">${escHtml(player.userId)}</div>
        <div class="lb-meta" style="position:relative; height:6px; margin-top:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
          <div style="position:absolute; top:0; left:0; height:100%; width:${barPct}%; background:${color}; border-radius:3px; transition: width 0.5s ease;"></div>
        </div>
      </div>
      <div class="lb-score">
        <div class="lb-score-val" style="color:${color};">${player.score.toLocaleString()}</div>
        <div class="lb-score-label">pts</div>
      </div>
    </div>`;
  }).join("");
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Add Score (ZINCRBY) ──────────────────────────────────────────────────────

async function addScore() {
  const userId     = document.getElementById("scoreUserId").value.trim();
  const rawPoints  = document.getElementById("scorePoints").value.trim();

  if (!userId)              return showResponse("addScoreResponse", "⚠️ Enter a User ID", true);
  if (rawPoints === "")     return showResponse("addScoreResponse", "⚠️ Enter a points value", true);
  const points = Number(rawPoints);
  if (isNaN(points))        return showResponse("addScoreResponse", "⚠️ Points must be a number", true);

  try {
    log(`POST /leaderboard/score  { userId: "${userId}", points: ${points} }  →  ZINCRBY game_leaderboard ${points} ${userId}`, "cmd");

    const res  = await fetch(`${API}/leaderboard/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, points }),
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    showResponse("addScoreResponse", `✅ ${userId}  →  New score: ${data.newTotalScore}`);
    log(`✅ ${userId} now has ${data.newTotalScore} pts`, "success");
    await fetchLeaderboard();  // Refresh leaderboard to show updated ranking
  } catch (err) {
    showResponse("addScoreResponse", `❌ ${err.message}`, true);
    log(`❌ ${err.message}`, "error");
  }
}

// ─── Increment View (INCR) ────────────────────────────────────────────────────

async function incrementView() {
  const postId = document.getElementById("postId").value.trim();
  if (!postId) return showResponse("viewResponse", "⚠️ Enter a Post ID", true);

  try {
    log(`POST /post/${postId}/view  →  ZSCORE check then INCR post:${postId}:views`, "cmd");

    // encodeURIComponent prevents IDs with / or spaces from breaking the URL
    const res  = await fetch(`${API}/post/${encodeURIComponent(postId)}/view`, { method: "POST" });
    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    showResponse("viewResponse", `✅ post:${postId}:views  →  ${data.totalViews} views`);
    log(`✅ post:${postId}:views = ${data.totalViews}`, "success");
  } catch (err) {
    showResponse("viewResponse", `❌ ${err.message}`, true);
    log(`❌ ${err.message}`, "error");
  }
}

// ─── Rank Lookup (ZREVRANK) ───────────────────────────────────────────────────

async function lookupRank() {
  const userId = document.getElementById("rankUserId").value.trim();
  if (!userId) return showResponse("rankResponse", "⚠️ Enter a User ID", true);

  try {
    log(`GET /leaderboard/${userId}/rank  →  ZREVRANK game_leaderboard ${userId}`, "cmd");

    // encodeURIComponent prevents IDs with / or spaces from breaking the URL
    const res  = await fetch(`${API}/leaderboard/${encodeURIComponent(userId)}/rank`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    showResponse("rankResponse", `✅ ${userId}  →  Rank #${data.rank}  (${data.score} pts)`);
    log(`✅ ${userId} is Rank #${data.rank} with ${data.score} pts`, "success");
  } catch (err) {
    showResponse("rankResponse", `❌ ${err.message}`, true);
    log(`❌ ${err.message}`, "error");
  }
}

// ─── Reset (DEL) ──────────────────────────────────────────────────────────────

let _resetPending = false;       // tracks whether first click already happened
let _resetTimer   = null;        // auto-cancels the confirm after 3s

async function resetLeaderboard() {
  const btn = document.getElementById("resetBtn");

  if (!_resetPending) {
    // ── First click: enter "confirm" state ─────────────────────────────────
    _resetPending = true;
    btn.innerHTML = '<span>⚠️ Click again to confirm</span><span class="btn-arrow">✓</span>';
    btn.style.background = "linear-gradient(135deg, #b45309, #f59e0b)";

    // Auto-cancel after 3 seconds if user doesn't click again
    _resetTimer = setTimeout(() => {
      _resetPending = false;
      btn.innerHTML = '<span>Clear All Data</span><span class="btn-arrow">→</span>';
      btn.style.background = "";
    }, 3000);
    return;
  }

  // ── Second click: execute the delete ──────────────────────────────────────
  clearTimeout(_resetTimer);
  _resetPending = false;
  btn.innerHTML = '<span>Clear All Data</span><span class="btn-arrow">→</span>';
  btn.style.background = "";

  try {
    log("DELETE /leaderboard/reset  →  DEL game_leaderboard", "cmd");
    const res  = await fetch(`${API}/leaderboard/reset`, { method: "DELETE" });
    const data = await res.json();

    if (!data.success) throw new Error(data.error ?? "Reset failed");

    log(`✅ Leaderboard cleared (${data.keysDeleted} key deleted from Redis)`, "success");

    // Render empty state directly — avoids the fetchInFlight race condition
    renderLeaderboard([]);
    updateStats([]);
  } catch (err) {
    log(`❌ Reset error: ${err.message}`, "error");
  }
}

// ─── Enter key shortcuts ──────────────────────────────────────────────────────

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const active = document.activeElement;
  if (active?.id === "scoreUserId" || active?.id === "scorePoints") addScore();
  if (active?.id === "postId")    incrementView();
  if (active?.id === "rankUserId") lookupRank();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

(async function init() {
  await checkStatus();
  await fetchLeaderboard();

  // Auto-refresh leaderboard every 5 seconds (silent=true suppresses log spam)
  setInterval(() => fetchLeaderboard(true), 5000);
  // Recheck Redis status every 10 seconds
  setInterval(checkStatus, 10000);

  log("🚀 Dashboard ready — auto-refresh every 5s", "success");
})();
