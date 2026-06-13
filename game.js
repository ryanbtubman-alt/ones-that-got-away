// Game logic for "The Ones That Got Away" — positionless build + series vs a champion

const ROSTER_SIZE = 5;

// --- Rating model -----------------------------------------------------------
// Overall is derived from real peak per-game production + real accolade weight.
function overall(p) {
  if (p.ovrOverride) return p.ovrOverride; // manual anchor when box score undersells
  const s = p.stats;
  const production =
    s.pts * 1.0 + s.reb * 0.7 + s.ast * 1.1 + s.stl * 2.0 + s.blk * 2.0;
  const raw = 44 + production + p.accoladeBonus;
  return Math.max(62, Math.min(99, Math.round(raw)));
}
PLAYERS.forEach((p) => (p.overall = overall(p)));

// --- State ------------------------------------------------------------------
let roster = []; // array of player objects, max ROSTER_SIZE (positionless)
let teamFilter = "ALL"; // ALL | DAL | SAC

function pickedIds() {
  return roster.map((p) => p.id);
}
function teamRating() {
  if (roster.length === 0) return 0;
  return Math.round(roster.reduce((a, p) => a + p.overall, 0) / roster.length);
}
function isComplete() {
  return roster.length === ROSTER_SIZE;
}

// --- Series simulation ------------------------------------------------------
// Each game: score ~ base + rating edge + noise. First to 4 wins.
function noise() {
  // ~bell-shaped, std around 9 points
  return (Math.random() + Math.random() + Math.random() - 1.5) * 9;
}
function simGame(rUser, rOpp) {
  let a = Math.round(101 + (rUser - 87) * 1.6 + noise());
  let b = Math.round(101 + (rOpp - 87) * 1.6 + noise());
  if (a === b) a += 1; // no ties in basketball
  return [a, b];
}
function simSeries(rUser, rOpp) {
  const games = [];
  let uw = 0,
    ow = 0;
  while (uw < 4 && ow < 4) {
    const [u, o] = simGame(rUser, rOpp);
    if (u > o) uw++;
    else ow++;
    games.push({ u, o, win: u > o });
  }
  return { games, uw, ow, won: uw === 4 };
}

// --- Rendering --------------------------------------------------------------
const rosterEl = document.getElementById("roster");
const poolEl = document.getElementById("pool");
const ratingEl = document.getElementById("teamRating");
const verdictEl = document.getElementById("verdict");
const resultEl = document.getElementById("result");
const playBtn = document.getElementById("playBtn");

function teamBadge(team) {
  return team === "DAL"
    ? `<span class="badge dal">DAL</span>`
    : `<span class="badge sac">SAC</span>`;
}
function viaTag(p) {
  const label = p.via === "trade" ? "TRADED" : "WALKED (FA)";
  return `<span class="via ${p.via}">${label} · ${p.year} → ${p.to}</span>`;
}

function renderRoster() {
  let html = "";
  for (let i = 0; i < ROSTER_SIZE; i++) {
    const p = roster[i];
    if (p) {
      html += `
        <div class="slot filled">
          <div class="slot-ovr">${p.overall}</div>
          <div class="slot-body">
            <div class="slot-name">${p.name} ${teamBadge(p.team)}</div>
            <div class="slot-meta">${p.stats.pts} PPG · ${p.stats.reb} RPG · ${p.stats.ast} APG</div>
          </div>
          <button class="remove" data-remove="${p.id}" title="Remove">✕</button>
        </div>`;
    } else {
      html += `
        <div class="slot empty">
          <div class="slot-ovr">–</div>
          <div class="slot-body"><div class="slot-empty-label">Empty — pick any player</div></div>
        </div>`;
    }
  }
  rosterEl.innerHTML = html;
  playBtn.disabled = !isComplete();
  playBtn.textContent = isComplete()
    ? "🏀 Play a champion (best of 7)"
    : `Pick ${ROSTER_SIZE - roster.length} more to play`;
}

function renderPool() {
  const used = pickedIds();
  let list = PLAYERS.filter((p) => !used.includes(p.id));
  if (teamFilter !== "ALL") list = list.filter((p) => p.team === teamFilter);
  list.sort((a, b) => b.overall - a.overall);

  const hint = isComplete()
    ? `Roster full — remove someone to swap`
    : `Tap any player to add (positionless — stack as many guards as you want)`;

  poolEl.innerHTML =
    `<div class="pool-hint">${hint}</div>` +
    (list.length === 0
      ? `<div class="pool-empty">No players left for this filter.</div>`
      : list
          .map(
            (p) => `
        <button class="card" data-add="${p.id}" ${isComplete() ? "disabled" : ""}>
          <div class="card-top">
            <span class="ovr">${p.overall}</span>
            <span class="card-name">${p.name}</span>
            ${teamBadge(p.team)}
          </div>
          <div class="card-stats">${p.stats.pts} pts · ${p.stats.reb} reb · ${p.stats.ast} ast <span class="dim">(${p.peakSeason})</span></div>
          ${viaTag(p)}
          <div class="card-roast">${p.roast}</div>
        </button>`
          )
          .join(""));
}

function renderScore() {
  const r = teamRating();
  ratingEl.textContent = r || "—";
  ratingEl.className = "rating " + (isComplete() ? "complete" : "");
  if (!isComplete())
    verdictEl.textContent = `Build a 5-man squad of castoffs, then test it against a champion.`;
  else verdictEl.textContent = `Team rating ${r}. Ready to face a champion.`;
}

function renderAll() {
  renderRoster();
  renderPool();
  renderScore();
}

function renderSeriesResult(champ, rUser, series) {
  const champStars = champ.players
    .map((p) => `${p.name} <span class="dim">${p.ovr}</span>`)
    .join(" · ");

  const verdict = series.won
    ? series.uw - series.ow >= 3
      ? "🏆 SWEPT THE LEGENDS. The castoffs cooked."
      : "🏆 RING. Your pile of regret beat a real champion."
    : series.ow - series.uw >= 3
    ? "💀 Got dismantled. Some teams are champs for a reason."
    : "😤 Heartbreaker. So close — one or two bounces from a ring.";

  const gamesHtml = series.games
    .map(
      (g, i) => `
      <div class="game ${g.win ? "w" : "l"}">
        <span class="gnum">G${i + 1}</span>
        <span class="gscore">${g.u}–${g.o}</span>
        <span class="gres">${g.win ? "W" : "L"}</span>
      </div>`
    )
    .join("");

  resultEl.innerHTML = `
    <div class="result-card">
      <div class="matchup">
        <div class="side you">
          <div class="side-label">YOUR CASTOFFS</div>
          <div class="side-rating">${rUser}</div>
        </div>
        <div class="vs">${series.uw}–${series.ow}</div>
        <div class="side opp">
          <div class="side-label">${champ.year} ${champ.name}</div>
          <div class="side-rating">${champ.rating}</div>
        </div>
      </div>
      <div class="champ-blurb">${champ.blurb}</div>
      <div class="champ-stars">${champStars}</div>
      <div class="games">${gamesHtml}</div>
      <div class="result-verdict ${series.won ? "won" : "lost"}">${verdict}</div>
    </div>`;
  resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// --- Events -----------------------------------------------------------------
rosterEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  roster = roster.filter((p) => p.id !== btn.dataset.remove);
  renderAll();
});

poolEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn || isComplete()) return;
  const player = PLAYERS.find((p) => p.id === btn.dataset.add);
  if (player && !pickedIds().includes(player.id)) {
    roster.push(player);
    renderAll();
  }
});

document.querySelectorAll("[data-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    teamFilter = btn.dataset.filter;
    document
      .querySelectorAll("[data-filter]")
      .forEach((b) => b.classList.toggle("on", b === btn));
    renderPool();
  });
});

playBtn.addEventListener("click", () => {
  if (!isComplete()) return;
  const champ = CHAMPIONS[Math.floor(Math.random() * CHAMPIONS.length)];
  const rUser = teamRating();
  const series = simSeries(rUser, champ.rating);
  renderSeriesResult(champ, rUser, series);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  roster = [];
  resultEl.innerHTML = "";
  renderAll();
});

renderAll();
