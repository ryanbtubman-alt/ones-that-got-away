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
let chaosIntensity = 0.65; // 0 = real basketball, 1 = total anarchy

function gagChance() {
  return 0.12 + chaosIntensity * 0.82;
}
function chaosChance() {
  return chaosIntensity * 0.9;
}

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
  jamison: [
    { t: "🛋️ Jamison got a little too comfortable and sleepwalked through the half.", d: -4 },
    { t: "🔄 Jamison's lefty runners are falling from every angle.", d: +4 },
  ],
  chandler: [
    { t: "🤧 Chandler caught a cold and completely lost his lob timing.", d: -3 },
    { t: "🛡️ Chandler turned the paint into a no-fly zone — full DPOY mode.", d: +4 },
  ],
  harris: [
    { t: "🐌 Harris left his first step back in the locker room tonight.", d: -3 },
    { t: "💨 Harris is blowing by everybody off the bounce.", d: +3 },
  ],
  crowder: [
    { t: "📱 Crowder spent the timeout requesting a trade on Twitter.", d: -3 },
    { t: "🎯 Crowder is drilling corner threes and locking up the wing.", d: +3 },
  ],
  wood: [
    { t: "🪑 Wood got a 'coach's decision' DNP for half the game. Again.", d: -4 },
    { t: "🌳 Wood is stretching the floor and swatting shots at the rim.", d: +3 },
  ],
  sethcurry: [
    { t: "👀 Seth got distracted watching his brother's highlights at halftime.", d: -3 },
    { t: "🎯 Seth Curry literally cannot miss — the OTHER Curry is cooking.", d: +4 },
  ],
  finley: [
    { t: "📻 Finley got stuck in 2005 traffic and showed up to the arena late.", d: -3 },
    { t: "🃏 Finley turned back the clock with a smooth, efficient scoring night.", d: +3 },
  ],
  terry: [
    { t: "✈️ The Jet got grounded — zero liftoff tonight.", d: -4 },
    { t: "✈️ The Jet hit cruising altitude and is raining threes.", d: +4 },
  ],
  howard: [
    { t: "😴 Josh Howard hit snooze through the national anthem and the 1st quarter.", d: -3 },
    { t: "🔥 Josh Howard is doing All-Star things on both ends.", d: +3 },
  ],
  dsj: [
    { t: "🫠 DSJ remembered he was a draft bust and pressed all night.", d: -4 },
    { t: "🚀 DSJ went full bounce-mode with a ridiculous windmill jam!", d: +4 },
  ],
  bogdanovic: [
    { t: "🌭 Bogdan tweaked a hammy reaching for the snack table.", d: -3 },
    { t: "🔥 Bogi the microwave is scorching hot off the bench.", d: +3 },
  ],
  hield: [
    { t: "🎰 Buddy chucked 20 threes and bricked 18 of them.", d: -4 },
    { t: "🎯 Buddy is in a three-point contest with himself — and winning.", d: +4 },
  ],
  tyreke: [
    { t: "🦵 Tyreke's knees filed a formal complaint with management.", d: -4 },
    { t: "💪 Tyreke is bullying his way to the rim like it's 2010.", d: +3 },
  ],
  bibby: [
    { t: "🧓 Father Time finally caught up with Bibby in the 4th quarter.", d: -3 },
    { t: "🎯 Bibby is burying daggers like the glory-days Kings.", d: +4 },
  ],
  kmart: [
    { t: "🤕 K-Mart pulled something during warmups. Of course he did.", d: -4 },
    { t: "🪣 Kevin Martin is quietly piling up buckets in bunches.", d: +4 },
  ],
};

// A third, fully UNHINGED gag for everyone — bigger swings, zero realism.
const EXTRA_GAGS = {
  luka: [{ t: "🍺 Luka challenged a fan to a beer-chug at halftime. He won. He also can't feel his legs.", d: -7 }],
  brunson: [{ t: "🧬 Scientists confirm Brunson is now legally 5'9\" and listed as 'a tall toddler'.", d: -6 }],
  peja: [{ t: "🛂 ICE showed up courtside. Peja is now coaching via Zoom from Belgrade.", d: -7 }],
  webber: [{ t: "⏱️ Webber called THREE timeouts they didn't have. The refs gave the title away out of confusion.", d: -8 }],
  cousins: [{ t: "🌋 Boogie ejected, then ejected the referee, then ejected himself from the arena.", d: -6 }],
  artest: [{ t: "🥊 Artest fought the entire bench AND the Gatorade cooler. The cooler won.", d: -6 }],
  nash: [{ t: "🥅 Nash subbed himself out to take a penalty kick. Drilled it. Wrong sport entirely.", d: -6 }],
  haliburton: [{ t: "🎬 Haliburton stopped mid-fast-break to film a State Farm commercial.", d: -5 }],
  whiteside: [{ t: "📊 Whiteside left the game to check his fantasy stats. On himself.", d: -6 }],
  isaiahthomas: [{ t: "🧍 IT stood at center court demanding the max contract he never got. Refused to move.", d: -5 }],
  jamison: [{ t: "🛌 Jamison is now medically asleep. Doctors baffled. He still scored 8.", d: -5 }],
  chandler: [{ t: "🏗️ Chandler set a screen so hard he relocated their point guard to the parking lot.", d: +7 }],
  harris: [{ t: "🚗 Harris got traded mid-game in a deal nobody told him about. Played for both teams.", d: -5 }],
  crowder: [{ t: "📲 Crowder posted 'min restriction' on IG and benched himself out of spite.", d: -6 }],
  wood: [{ t: "👻 Wood was so deep on the bench, security asked him to leave the building.", d: -6 }],
  sethcurry: [{ t: "🎯 Seth hit 11 straight threes. Steph called him to say 'chill'.", d: +8 }],
  finley: [{ t: "🕰️ Finley reverted to 2001 and demanded the Mavs un-amnesty him on the spot.", d: +5 }],
  terry: [{ t: "✈️ The Jet declared a fuel emergency and made an unscheduled landing in the stands.", d: -6 }],
  howard: [{ t: "📵 Josh Howard went on a radio show to rip the anthem DURING the anthem.", d: -5 }],
  dsj: [{ t: "🛸 DSJ dunked so hard he hit low-earth orbit. Two points and a sonic boom.", d: +7 }],
  bogdanovic: [{ t: "🌭 Bogdan ate 14 hot dogs at the half 'for energy'. He cannot move.", d: -6 }],
  hield: [{ t: "🎰 Buddy shot a three from the TUNNEL. Swish. He shot 30 more. None fell.", d: -7 }],
  tyreke: [{ t: "🦿 Tyreke's knees unionized and went on strike at tipoff.", d: -7 }],
  bibby: [{ t: "🦴 Bibby's AARP card fell out of his shorts mid-crossover.", d: -5 }],
  kmart: [{ t: "🏥 Kevin Martin got injured in the pregame handshake line.", d: -6 }],
};
Object.keys(EXTRA_GAGS).forEach((id) => {
  if (GAGS[id]) GAGS[id].push(...EXTRA_GAGS[id]);
});

// League-wide CHAOS: fires regardless of roster. d hits you, od hits the champ.
const CHAOS = [
  { t: "🦝 A raccoon stormed the court and stole the game ball. Everyone forgot the score.", d: 0, od: 0 },
  { t: "🎰 Vegas confirms the refs have a heavy bet against you tonight.", d: -5 },
  { t: "📉 Your front office tried to trade your best player MID-GAME.", d: -6 },
  { t: "📺 The broadcast cut to the Cowboys game. Team morale collapsed.", d: -3 },
  { t: "🛸 A UFO hovered over the arena. Both teams played terrified.", d: -3, od: -3 },
  { t: "🏀 The rim mysteriously shrank to half-size — but only for the champions.", od: -6 },
  { t: "💃 The halftime act ran 40 minutes and the champs went stone cold.", od: -5 },
  { t: "🔥 The opposing superstar pulled a hammy on a between-the-legs flex dribble.", od: -7 },
  { t: "🌭 The arena ran out of nachos and the entire crowd turned feral.", d: -2, od: -2 },
  { t: "🐐 A live goat wandered onto the floor. Jordan, wherever he is, took it personally.", od: 4 },
];
function rollChaos() {
  return Math.random() < chaosChance() ? [rand(CHAOS)] : [];
}
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
// High trigger rate — the gags ARE the broadcast.
function rollGags() {
  const events = [];
  roster.forEach((p) => {
    const list = GAGS[p.id];
    if (list && list.length && Math.random() < gagChance()) {
      events.push({ name: p.name, ...rand(list) });
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
  const reel = []; // wildest moments, for the post-series recap
  let uw = 0,
    ow = 0,
    g = 0;
  while (uw < 4 && ow < 4) {
    g++;
    const { rating, notes } = gameRoll(); // varies per game if volatile (Fox)
    const gags = rollGags();
    const chaos = rollChaos();
    const userDelta =
      gags.reduce((a, x) => a + x.d, 0) +
      chaos.reduce((a, x) => a + (x.d || 0), 0);
    const oppDelta = chaos.reduce((a, x) => a + (x.od || 0), 0);
    const [u, o] = simGame(rating + userDelta, rOpp + oppDelta);
    const win = u > o;
    if (win) uw++;
    else ow++;
    games.push({ u, o, win, notes });

    // Build the play-by-play feed for this game — chaos and gags are the show.
    commentary.push({ type: "header", text: `GAME ${g} — vs ${champ.year} ${champ.name}` });
    chaos.forEach((x) => commentary.push({ type: "chaos", text: x.t }));
    notes.forEach((n) => commentary.push({ type: "streak", text: n }));
    gags.forEach((x) =>
      commentary.push({ type: x.d < 0 ? "gag-bad" : "gag-good", text: x.t })
    );
    // Only drop in generic play-by-play if nothing wild happened this game.
    if (notes.length === 0 && gags.length === 0 && chaos.length === 0)
      pbpLines(champ, 1).forEach((l) => commentary.push({ type: "pbp", text: l }));
    commentary.push({
      type: win ? "final-w" : "final-l",
      text: `${win ? "✅ WIN" : "❌ LOSS"} ${u}–${o}`,
    });

    // Collect wildest moments for the recap (by absolute rating swing).
    gags.forEach((x) => reel.push({ text: x.t, mag: Math.abs(x.d), g }));
    chaos.forEach((x) =>
      reel.push({ text: x.t, mag: Math.abs(x.d || 0) + Math.abs(x.od || 0), g })
    );
    notes.forEach((n) => reel.push({ text: n, mag: 4, g }));
  }
  reel.sort((a, b) => b.mag - a.mag);
  // De-dupe repeated incidents, keep the wildest few.
  const seen = new Set();
  const moments = reel
    .filter((r) => (seen.has(r.text) ? false : seen.add(r.text)))
    .slice(0, 3);
  const recap = { moments, count: reel.length, games: games.length };
  return { games, uw, ow, won: uw === 4, commentary, recap };
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

  const bannerText = series.won
    ? "You have overcome Nico and Vivek and saved your franchise"
    : "Nico and Vivek have taken the series and your soul";

  const medals = ["🥇", "🥈", "🥉"];
  const recapHtml = series.recap.moments.length
    ? `<div class="recap">
         <div class="recap-title">🎬 Chaos Recap — top moments</div>
         <ul class="recap-list">
           ${series.recap.moments
             .map((m, i) => `<li><span class="recap-rank">${medals[i] || "•"}</span>${m.text}</li>`)
             .join("")}
         </ul>
         <div class="recap-sub">${series.recap.count} certified ridiculous events across ${series.recap.games} games.</div>
       </div>`
    : `<div class="recap"><div class="recap-title">🎬 Chaos Recap</div><div class="recap-sub">A shockingly normal series — crank the chaos slider up.</div></div>`;

  resultEl.innerHTML = `
    <div class="result-card ${series.won ? "won-fx" : "lost-fx"}">
      <div class="banner ${series.won ? "win" : "lose"}">${bannerText}</div>
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
      ${recapHtml}
    </div>`;
  resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function launchConfetti() {
  const colors = ["#f4c430", "#36d399", "#4ea3ff", "#b07bdc", "#f87171", "#ffffff"];
  const box = document.createElement("div");
  box.className = "confetti-box";
  for (let i = 0; i < 110; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = Math.random() * 0.7 + "s";
    c.style.animationDuration = 2 + Math.random() * 1.6 + "s";
    box.appendChild(c);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4500);
}

// --- Events -----------------------------------------------------------------
rosterEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  roster = roster.filter((p) => p.id !== btn.dataset.remove);
  Sound.remove();
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
  Sound.add();
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

const chaosSlider = document.getElementById("chaosSlider");
const chaosValEl = document.getElementById("chaosVal");
function chaosLabel(v) {
  if (v <= 20) return "Real basketball 😴";
  if (v <= 45) return "Mild mischief";
  if (v <= 70) return "Unhinged";
  if (v <= 90) return "Chaos";
  return "TOTAL ANARCHY 🔥";
}
if (chaosSlider) {
  chaosSlider.addEventListener("input", () => {
    const v = Number(chaosSlider.value);
    chaosIntensity = v / 100;
    chaosValEl.textContent = chaosLabel(v);
  });
}

playBtn.addEventListener("click", () => {
  if (!isComplete()) return;
  const champ = CHAMPIONS[Math.floor(Math.random() * CHAMPIONS.length)];
  const diff = DIFFICULTIES[currentDifficulty];
  const rUser = teamRating();
  Sound.whistle();
  const series = simSeries(champ.rating, champ);
  renderSeriesResult(champ, rUser, series, diff);
  if (series.won) {
    launchConfetti();
    Sound.win();
  } else {
    Sound.lose();
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  roster = [];
  resultEl.innerHTML = "";
  renderAll();
});

const muteBtn = document.getElementById("muteBtn");
if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    const muted = Sound.toggle();
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.title = muted ? "Sound off" : "Sound on";
  });
}

renderAll();
