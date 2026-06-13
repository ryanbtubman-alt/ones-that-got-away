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

// Difficulty = restrictions on who you can roster. A "star" is 90+ OVR.
// Harder levels force you to build from the deeper (worse) castoff pool.
const STAR = 90;
const DIFFICULTIES = [
  { name: "Rookie", maxStars: Infinity, desc: "No limits — pick anyone." },
  { name: "Pro", maxStars: 2, desc: "Max two 90+ OVR stars." },
  { name: "All-Star", maxStars: 1, desc: "Only one 90+ OVR star allowed." },
  { name: "Legend", maxStars: 0, desc: "No 90+ stars. Role players only." },
];
let currentDifficulty = 1; // Pro by default

function isStar(p) {
  return p.overall >= STAR;
}
function starCount() {
  return roster.filter(isStar).length;
}
function maxStars() {
  return DIFFICULTIES[currentDifficulty].maxStars;
}
// Can this player be added under the current difficulty + roster state?
function canAdd(p) {
  if (roster.length >= ROSTER_SIZE) return false;
  if (isStar(p) && starCount() >= maxStars()) return false;
  return true;
}
// Trim roster to satisfy a (newly selected) difficulty; returns removed players.
function enforceRestriction() {
  const removed = [];
  let stars = roster.filter(isStar).sort((a, b) => a.overall - b.overall); // weakest first
  while (roster.filter(isStar).length > maxStars() && stars.length) {
    const drop = stars.shift();
    roster = roster.filter((p) => p.id !== drop.id);
    removed.push(drop);
  }
  return removed;
}

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

// --- Comedy gags: random per-game incidents tied to specific players ---------
// delta adjusts that game's team rating (so the gag actually matters).
const GAGS = {
  luka: [
    { t: "🍔 Luka rolled in carrying some serious offseason weight — a half-step slow all game.", d: -5 },
    { t: "🪄 Luka pulls up from the logo and steps back into MVP form.", d: +4 },
  ],
  brunson: [
    { t: "📏 Brunson mysteriously woke up 3 inches shorter — getting his stuff swatted.", d: -5 },
    { t: "🦴 Captain Brunson is bullying every guard who switches onto him.", d: +4 },
  ],
  peja: [
    { t: "🛂 Peja got deported mid-series and missed the entire game.", d: -6 },
    { t: "🎯 Peja is unconscious from deep — literally cannot miss.", d: +4 },
  ],
  webber: [
    { t: "⏱️ Webber called a timeout they didn't have. Technical foul. Of course.", d: -5 },
    { t: "👑 Webber is dominating the glass and orchestrating the offense.", d: +4 },
  ],
  cousins: [
    { t: "🗣️ Boogie picked up his second technical for jawing at the refs.", d: -4 },
    { t: "💪 Boogie is posting up and abusing the champs in the paint.", d: +4 },
  ],
  artest: [
    { t: "🥊 Artest went into the stands and got ejected. Malice flashback.", d: -6 },
    { t: "🔒 Artest has completely erased their best scorer tonight.", d: +4 },
  ],
  nash: [
    { t: "⚽ Nash got distracted starting a soccer club at halftime.", d: -3 },
    { t: "🎩 Nash is carving the defense apart — vintage MVP wizardry.", d: +4 },
  ],
  haliburton: [
    { t: "📉 Haliburton's hamstring tightened up — visibly limited.", d: -5 },
    { t: "🎯 Haliburton is running a clinic, piling up double-digit dimes.", d: +4 },
  ],
  whiteside: [
    { t: "📱 Whiteside seems more worried about his own stat line than the score.", d: -4 },
    { t: "🚫 Whiteside is swatting everything that comes near the rim.", d: +4 },
  ],
  isaiahthomas: [
    { t: "🩹 IT's hip flared up again — playing through visible pain.", d: -4 },
    { t: "🥺 IT, playing with a chip on his shoulder, is scoring in bunches.", d: +4 },
  ],
  cuban_generic: [],
};
// Generic play-by-play templates: {R} = your player, {C} = champion player.
const PBP = [
  "{R} drills a tough fadeaway over {C}.",
  "{C} answers right back with a deep three.",
  "{R} throws down a poster dunk on {C}!",
  "Turnover — {C} leaks out in transition for the slam.",
  "{R} threads a no-look dime for an easy bucket.",
  "Defensive stop by {R}, and the building erupts.",
  "{C} gets to the line and calmly knocks down both.",
  "{R} hits a step-back at the shot-clock buzzer.",
  "Scramble for the loose ball — {R} comes up with it.",
  "{C} splashes a corner triple to swing the momentum.",
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pbpLines(champ, n = 2) {
  const mine = roster.map((p) => p.name.split(" ").pop());
  const theirs = champ.players.map((p) => p.name.split(" ").pop());
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(
      rand(PBP).replace("{R}", rand(mine)).replace("{C}", rand(theirs))
    );
  }
  return out;
}
// Roll comedy incidents for this game from rostered players who have gags.
function rollGags() {
  const events = [];
  roster.forEach((p) => {
    const list = GAGS[p.id];
    if (list && list.length && Math.random() < 0.22) {
      events.push(rand(list));
    }
  });
  return events;
}
// Volatile players (e.g. De'Aaron Fox) re-roll their rating every single game.
function rollOvr(p) {
  if (p.volatile) {
    const { min, max } = p.volatile;
    return Math.floor(min + Math.random() * (max - min + 1));
  }
  return p.overall;
}
// One game's roster rating + any "hot/cold" flavor notes from volatile players.
function gameRoll() {
  let sum = 0;
  const notes = [];
  roster.forEach((p) => {
    const r = rollOvr(p);
    sum += r;
    if (p.volatile) {
      const last = p.name.split(" ").pop();
      if (r >= 92) notes.push(`🔥 ${last} went NUCLEAR (${r})`);
      else if (r >= 86) notes.push(`✅ ${last} cooking (${r})`);
      else if (r <= 74) notes.push(`🥶 ${last} ICE COLD (${r})`);
      else notes.push(`😐 ${last} quiet (${r})`);
    }
  });
  return { rating: Math.round(sum / roster.length), notes };
}
function simSeries(rOpp, champ) {
  const games = [];
  const commentary = [];
  let uw = 0,
    ow = 0,
    g = 0;
  while (uw < 4 && ow < 4) {
    g++;
    const { rating, notes } = gameRoll(); // varies per game if volatile (Fox)
    const gags = rollGags();
    const gameRating = rating + gags.reduce((a, x) => a + x.d, 0);
    const [u, o] = simGame(gameRating, rOpp);
    const win = u > o;
    if (win) uw++;
    else ow++;
    games.push({ u, o, win, notes });

    // Build the play-by-play feed for this game.
    commentary.push({ type: "header", text: `GAME ${g} — vs ${champ.year} ${champ.name}` });
    pbpLines(champ).forEach((l) => commentary.push({ type: "pbp", text: l }));
    notes.forEach((n) => commentary.push({ type: "streak", text: n }));
    gags.forEach((x) =>
      commentary.push({ type: x.d < 0 ? "gag-bad" : "gag-good", text: x.t })
    );
    commentary.push({
      type: win ? "final-w" : "final-l",
      text: `${win ? "✅ WIN" : "❌ LOSS"} ${u}–${o}`,
    });
  }
  return { games, uw, ow, won: uw === 4, commentary };
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
function volatileTag(p) {
  if (!p.volatile) return "";
  return `<span class="streaky" title="Re-rolls ${p.volatile.min}-${p.volatile.max} OVR every game">🎲 STREAKY</span>`;
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
            <div class="slot-name">${p.name} ${teamBadge(p.team)} ${volatileTag(p)}</div>
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

  const full = isComplete();
  const cap = maxStars();
  const starsHint =
    cap === Infinity
      ? `90+ stars: unlimited`
      : `90+ stars: ${starCount()}/${cap}`;
  const hint = full
    ? `Roster full — remove someone to swap`
    : `Tap any player to add · <b>${starsHint}</b>`;

  poolEl.innerHTML =
    `<div class="pool-hint">${hint}</div>` +
    (list.length === 0
      ? `<div class="pool-empty">No players left for this filter.</div>`
      : list
          .map((p) => {
            const starLocked = !full && isStar(p) && starCount() >= cap;
            const disabled = full || starLocked;
            return `
        <button class="card ${starLocked ? "locked" : ""}" data-add="${p.id}" ${disabled ? "disabled" : ""}>
          <div class="card-top">
            <span class="ovr">${p.overall}</span>
            <span class="card-name">${p.name}</span>
            ${teamBadge(p.team)}
            ${volatileTag(p)}
            ${starLocked ? `<span class="lock">🔒 star limit</span>` : ""}
          </div>
          <div class="card-stats">${p.stats.pts} pts · ${p.stats.reb} reb · ${p.stats.ast} ast <span class="dim">(${p.peakSeason})</span></div>
          ${viaTag(p)}
          <div class="card-roast">${p.roast}</div>
        </button>`;
          })
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

function renderSeriesResult(champ, rUser, series, diff) {
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
        <div class="grow">
          <span class="gnum">G${i + 1}</span>
          <span class="gscore">${g.u}–${g.o}</span>
          <span class="gres">${g.win ? "W" : "L"}</span>
        </div>
        ${g.notes && g.notes.length ? `<div class="gnote">${g.notes.join(" · ")}</div>` : ""}
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
      <div class="diff-tag">⚙️ ${diff.name} difficulty</div>
      <div class="champ-blurb">${champ.blurb}</div>
      <div class="champ-stars">${champStars}</div>
      <div class="games">${gamesHtml}</div>
      <div class="commentary">
        <div class="comm-title">📻 Series play-by-play</div>
        <div class="comm-feed">
          ${series.commentary
            .map((c) => `<div class="comm ${c.type}">${c.text}</div>`)
            .join("")}
        </div>
      </div>
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
  if (!btn) return;
  const player = PLAYERS.find((p) => p.id === btn.dataset.add);
  if (!player || pickedIds().includes(player.id)) return;
  if (!canAdd(player)) {
    if (isStar(player))
      verdictEl.textContent = `🔒 ${player.name} is a 90+ star — ${DIFFICULTIES[currentDifficulty].name} allows only ${maxStars()}. Lower the difficulty or pick a role player.`;
    return;
  }
  roster.push(player);
  renderAll();
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

const diffDescEl = document.getElementById("diffDesc");
document.querySelectorAll("[data-diff]").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentDifficulty = Number(btn.dataset.diff);
    document
      .querySelectorAll("[data-diff]")
      .forEach((b) => b.classList.toggle("on", b === btn));
    if (diffDescEl) diffDescEl.textContent = DIFFICULTIES[currentDifficulty].desc;
    const removed = enforceRestriction();
    renderAll();
    if (removed.length)
      verdictEl.textContent = `Removed ${removed
        .map((p) => p.name)
        .join(", ")} — over the ${DIFFICULTIES[currentDifficulty].name} star limit.`;
  });
});

playBtn.addEventListener("click", () => {
  if (!isComplete()) return;
  const champ = CHAMPIONS[Math.floor(Math.random() * CHAMPIONS.length)];
  const diff = DIFFICULTIES[currentDifficulty];
  const rUser = teamRating();
  const series = simSeries(champ.rating, champ);
  renderSeriesResult(champ, rUser, series, diff);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  roster = [];
  resultEl.innerHTML = "";
  renderAll();
});

renderAll();
