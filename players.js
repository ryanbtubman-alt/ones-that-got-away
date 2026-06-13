// The Ones That Got Away — eligible player pool.
// Eligibility rule: player LEFT the Dallas Mavericks or Sacramento Kings via TRADE or FREE AGENCY.
//
// Stats are real PEAK-SEASON per-game numbers (the season that best represents how good they
// became). `accoladeBonus` reflects real hardware/recognition (MVP, All-NBA, All-Star, DPOY...).
// The overall rating is computed from these in game.js, so everything here is editable + honest.
//
// pos: array of eligible lineup slots — PG, SG, SF, PF, C.
// team: "DAL" or "SAC".  via: "trade" or "fa".

const PLAYERS = [
  // ---------------- DALLAS MAVERICKS castoffs ----------------
  {
    id: "nash",
    name: "Steve Nash",
    team: "DAL", via: "fa", year: 2004, to: "Phoenix Suns",
    pos: ["PG"],
    peakSeason: "2006-07",
    stats: { pts: 18.6, reb: 3.5, ast: 11.6, stl: 0.8, blk: 0.1 },
    accoladeBonus: 14, // 2x MVP (both after leaving Dallas)
    roast: "Dallas let a back-to-back MVP walk for nothing. Cuban still has nightmares.",
  },
  {
    id: "luka",
    name: "Luka Dončić",
    team: "DAL", via: "trade", year: 2025, to: "Los Angeles Lakers",
    pos: ["PG", "SG", "SF"],
    peakSeason: "2023-24",
    stats: { pts: 33.9, reb: 9.2, ast: 9.8, stl: 1.4, blk: 0.5 },
    accoladeBonus: 13, // multiple All-NBA First Teams, scoring champ
    roast: "Traded a 25-year-old franchise pillar. The trade that launched a thousand memes.",
  },
  {
    id: "brunson",
    name: "Jalen Brunson",
    team: "DAL", via: "fa", year: 2022, to: "New York Knicks",
    pos: ["PG", "SG"],
    peakSeason: "2023-24",
    stats: { pts: 28.7, reb: 3.6, ast: 6.7, stl: 0.9, blk: 0.2 },
    accoladeBonus: 9, // All-NBA, All-Star, Knicks captain
    roast: "Wouldn't pay him. He became an All-NBA Knicks legend the next year.",
  },
  {
    id: "jamison",
    name: "Antawn Jamison",
    team: "DAL", via: "trade", year: 2003, to: "Washington Wizards",
    pos: ["PF", "SF"],
    peakSeason: "2004-05",
    stats: { pts: 19.6, reb: 8.4, ast: 1.6, stl: 0.9, blk: 0.4 },
    accoladeBonus: 6, // 2x All-Star, 6th Man of Year
    roast: "Flipped to Washington, immediately turned into a two-time All-Star.",
  },
  {
    id: "chandler",
    name: "Tyson Chandler",
    team: "DAL", via: "trade", year: 2011, to: "New York Knicks",
    pos: ["C"],
    peakSeason: "2011-12",
    stats: { pts: 11.3, reb: 9.9, ast: 0.9, stl: 0.9, blk: 1.4 },
    accoladeBonus: 8, // Defensive Player of the Year
    ovrOverride: 85, // anchor center / DPOY value beyond raw box score
    roast: "Won a title for Dallas, got shipped out, won DPOY in New York. Cool.",
  },
  {
    id: "harris",
    name: "Devin Harris",
    team: "DAL", via: "trade", year: 2008, to: "New Jersey Nets",
    pos: ["PG"],
    peakSeason: "2008-09",
    stats: { pts: 21.3, reb: 3.3, ast: 6.9, stl: 1.7, blk: 0.2 },
    accoladeBonus: 4, // All-Star
    roast: "The headliner going out in the Jason Kidd deal. Made an All-Star team in Jersey.",
  },
  {
    id: "crowder",
    name: "Jae Crowder",
    team: "DAL", via: "trade", year: 2014, to: "Boston Celtics",
    pos: ["SF", "PF"],
    peakSeason: "2016-17",
    stats: { pts: 13.9, reb: 5.8, ast: 2.2, stl: 1.0, blk: 0.3 },
    accoladeBonus: 2, // 3-and-D starter, Finals runs
    roast: "Throw-in piece in the Rondo trade. Became a real 3-and-D playoff connector.",
  },
  {
    id: "wood",
    name: "Christian Wood",
    team: "DAL", via: "trade", year: 2023, to: "Los Angeles Lakers",
    pos: ["PF", "C"],
    peakSeason: "2020-21",
    stats: { pts: 21.0, reb: 9.6, ast: 1.7, stl: 0.6, blk: 1.2 },
    accoladeBonus: 1,
    roast: "Couldn't find him minutes, let him go for spare parts.",
  },
  {
    id: "sethcurry",
    name: "Seth Curry",
    team: "DAL", via: "trade", year: 2020, to: "Philadelphia 76ers",
    pos: ["SG", "PG"],
    peakSeason: "2020-21",
    stats: { pts: 12.5, reb: 2.3, ast: 2.7, stl: 0.7, blk: 0.2 },
    accoladeBonus: 1, // elite shooter (one of best 3P% ever)
    roast: "One of the best shooters alive, traded away. The other Curry sting.",
  },

  {
    id: "finley",
    name: "Michael Finley",
    team: "DAL", via: "fa", year: 2005, to: "San Antonio Spurs",
    pos: ["SG", "SF"],
    peakSeason: "2000-01",
    stats: { pts: 22.6, reb: 5.3, ast: 3.6, stl: 1.2, blk: 0.3 },
    accoladeBonus: 5, // 2x All-Star
    roast: "Amnestied by Dallas — then won a ring with the rival Spurs. Oops.",
  },
  {
    id: "terry",
    name: "Jason Terry",
    team: "DAL", via: "fa", year: 2012, to: "Boston Celtics",
    pos: ["PG", "SG"],
    peakSeason: "2008-09",
    stats: { pts: 19.6, reb: 2.4, ast: 3.4, stl: 1.0, blk: 0.2 },
    accoladeBonus: 5, // Sixth Man of the Year
    roast: "The Jet won them a title, then was let walk a year later. The flight left.",
  },
  {
    id: "howard",
    name: "Josh Howard",
    team: "DAL", via: "trade", year: 2010, to: "Washington Wizards",
    pos: ["SF", "PF"],
    peakSeason: "2007-08",
    stats: { pts: 19.9, reb: 7.0, ast: 2.0, stl: 1.2, blk: 1.0 },
    accoladeBonus: 4, // All-Star
    roast: "An All-Star wing in his prime, dealt at the deadline for spare change.",
  },
  {
    id: "dsj",
    name: "Dennis Smith Jr.",
    team: "DAL", via: "trade", year: 2019, to: "New York Knicks",
    pos: ["PG"],
    peakSeason: "2017-18",
    stats: { pts: 15.2, reb: 3.8, ast: 5.2, stl: 1.0, blk: 0.4 },
    accoladeBonus: 0,
    roast: "Drafted as the future, flipped in the Porzingis deal. Bounced ever since.",
  },

  // ---------------- SACRAMENTO KINGS castoffs ----------------
  {
    id: "fox",
    name: "De'Aaron Fox",
    team: "SAC", via: "trade", year: 2025, to: "San Antonio Spurs",
    pos: ["PG"],
    peakSeason: "2023-24",
    stats: { pts: 26.6, reb: 4.6, ast: 5.6, stl: 2.0, blk: 0.4 },
    accoladeBonus: 7, // All-NBA 3rd Team, All-Star, inaugural Clutch Player of the Year
    roast: "Ended the playoff drought, then got shipped to San Antonio in his prime. Light the beam.",
    // Special: Fox is wildly streaky. His rating re-rolls every game between a
    // disaster night and a superstar night. High risk, high reward.
    volatile: { min: 68, max: 99 },
  },
  {
    id: "haliburton",
    name: "Tyrese Haliburton",
    team: "SAC", via: "trade", year: 2022, to: "Indiana Pacers",
    pos: ["PG", "SG"],
    peakSeason: "2023-24",
    stats: { pts: 20.1, reb: 3.9, ast: 10.9, stl: 1.2, blk: 0.7 },
    accoladeBonus: 9, // All-NBA, All-Star, assist leader, Finals run
    roast: "Traded a 22-year-old All-Star to chase a vibe. He led the league in assists.",
  },
  {
    id: "cousins",
    name: "DeMarcus Cousins",
    team: "SAC", via: "trade", year: 2017, to: "New Orleans Pelicans",
    pos: ["C", "PF"],
    peakSeason: "2016-17",
    stats: { pts: 27.0, reb: 11.0, ast: 4.6, stl: 1.4, blk: 1.3 },
    accoladeBonus: 8, // 4x All-Star, multiple All-NBA
    roast: "Traded their franchise center at the All-Star break for pennies on the dollar.",
  },
  {
    id: "isaiahthomas",
    name: "Isaiah Thomas",
    team: "SAC", via: "trade", year: 2014, to: "Phoenix Suns",
    pos: ["PG"],
    peakSeason: "2016-17",
    stats: { pts: 28.9, reb: 2.7, ast: 5.9, stl: 0.9, blk: 0.1 },
    accoladeBonus: 8, // All-NBA 2nd Team, MVP-candidate season
    roast: "Last pick of the draft, let him walk — he finished 5th in MVP voting in Boston.",
  },
  {
    id: "bogdanovic",
    name: "Bogdan Bogdanović",
    team: "SAC", via: "fa", year: 2020, to: "Atlanta Hawks",
    pos: ["SG", "SF"],
    peakSeason: "2022-23",
    stats: { pts: 14.0, reb: 3.4, ast: 3.1, stl: 0.9, blk: 0.2 },
    accoladeBonus: 2, // key playoff scorer, Olympic star
    roast: "Sign-and-traded to Atlanta, became their microwave sixth man.",
  },
  {
    id: "hield",
    name: "Buddy Hield",
    team: "SAC", via: "trade", year: 2022, to: "Indiana Pacers",
    pos: ["SG"],
    peakSeason: "2018-19",
    stats: { pts: 20.7, reb: 5.0, ast: 2.5, stl: 0.7, blk: 0.4 },
    accoladeBonus: 2, // elite volume 3P shooter, 3PT contest champ
    roast: "Came in the Cousins deal, then got shipped out himself. Kings gonna King.",
  },
  {
    id: "tyreke",
    name: "Tyreke Evans",
    team: "SAC", via: "trade", year: 2013, to: "New Orleans Pelicans",
    pos: ["SG", "SF"],
    peakSeason: "2017-18",
    stats: { pts: 19.4, reb: 5.1, ast: 5.2, stl: 1.1, blk: 0.4 },
    accoladeBonus: 3, // Rookie of the Year (20/5/5)
    roast: "A 20/5/5 Rookie of the Year, sign-and-traded away by his mid-20s.",
  },
  {
    id: "whiteside",
    name: "Hassan Whiteside",
    team: "SAC", via: "fa", year: 2012, to: "Miami Heat",
    pos: ["C"],
    peakSeason: "2016-17",
    stats: { pts: 17.0, reb: 14.1, ast: 0.7, stl: 0.6, blk: 2.1 },
    accoladeBonus: 4, // led NBA in rebounds & blocks
    roast: "Drafted, buried, released — then led the entire NBA in blocks and boards in Miami.",
  },
  {
    id: "webber",
    name: "Chris Webber",
    team: "SAC", via: "trade", year: 2005, to: "Philadelphia 76ers",
    pos: ["PF", "C"],
    peakSeason: "2000-01",
    stats: { pts: 27.1, reb: 11.1, ast: 4.2, stl: 1.4, blk: 1.7 },
    accoladeBonus: 7, // 5x All-Star, All-NBA First Team
    roast: "The face of the franchise, traded away mid-prime. The Kings never recovered.",
  },
  {
    id: "peja",
    name: "Peja Stojaković",
    team: "SAC", via: "trade", year: 2006, to: "Indiana Pacers",
    pos: ["SF", "SG"],
    peakSeason: "2003-04",
    stats: { pts: 24.2, reb: 6.3, ast: 2.1, stl: 1.0, blk: 0.2 },
    accoladeBonus: 6, // 3x All-Star, 2x Three-Point Contest champ
    roast: "Elite sharpshooter, shipped out — then won a ring with the Mavs in 2011. Brutal.",
  },
  {
    id: "bibby",
    name: "Mike Bibby",
    team: "SAC", via: "trade", year: 2008, to: "Atlanta Hawks",
    pos: ["PG"],
    peakSeason: "2004-05",
    stats: { pts: 19.6, reb: 3.5, ast: 6.8, stl: 1.3, blk: 0.1 },
    accoladeBonus: 3,
    roast: "The clutch engine of the great Kings teams, eventually dealt for parts.",
  },
  {
    id: "kmart",
    name: "Kevin Martin",
    team: "SAC", via: "trade", year: 2010, to: "Houston Rockets",
    pos: ["SG"],
    peakSeason: "2008-09",
    stats: { pts: 24.6, reb: 3.6, ast: 2.7, stl: 1.1, blk: 0.2 },
    accoladeBonus: 2, // elite free-throw / scoring efficiency
    roast: "A 24-a-night bucket-getter, traded away in his prime. Of course.",
  },
  {
    id: "artest",
    name: "Ron Artest",
    team: "SAC", via: "trade", year: 2008, to: "Houston Rockets",
    pos: ["SF", "PF"],
    peakSeason: "2003-04",
    stats: { pts: 18.3, reb: 5.3, ast: 3.7, stl: 2.1, blk: 0.7 },
    accoladeBonus: 6, // Defensive Player of the Year, All-Star
    roast: "An All-NBA defender, traded off — then won a title with the Lakers in 2010.",
  },
];
