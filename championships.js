// Real NBA championship teams to test your squad against.
// Each champion's team rating is the average of its five listed stars' overalls,
// tuned to reflect how dominant that team actually was (peak-season scale, ~78-99).
// One is drawn at random when you play a series.

const CHAMPIONS = [
  {
    name: "Golden State Warriors",
    year: 2017,
    blurb: "73-win core + Kevin Durant. The superteam that broke the league.",
    players: [
      { name: "Kevin Durant", ovr: 99 },
      { name: "Stephen Curry", ovr: 97 },
      { name: "Klay Thompson", ovr: 90 },
      { name: "Draymond Green", ovr: 90 },
      { name: "Andre Iguodala", ovr: 82 },
    ],
  },
  {
    name: "Chicago Bulls",
    year: 1996,
    blurb: "72-10. Peak Jordan, peak Pippen, peak Rodman chaos.",
    players: [
      { name: "Michael Jordan", ovr: 99 },
      { name: "Scottie Pippen", ovr: 93 },
      { name: "Dennis Rodman", ovr: 87 },
      { name: "Toni Kukoč", ovr: 82 },
      { name: "Ron Harper", ovr: 79 },
    ],
  },
  {
    name: "Miami Heat",
    year: 2013,
    blurb: "27-game win streak. LeBron at his absolute apex.",
    players: [
      { name: "LeBron James", ovr: 99 },
      { name: "Dwyane Wade", ovr: 91 },
      { name: "Chris Bosh", ovr: 86 },
      { name: "Ray Allen", ovr: 81 },
      { name: "Mario Chalmers", ovr: 77 },
    ],
  },
  {
    name: "Los Angeles Lakers",
    year: 2001,
    blurb: "Shaq + Kobe steamrolled the playoffs 15-1.",
    players: [
      { name: "Shaquille O'Neal", ovr: 99 },
      { name: "Kobe Bryant", ovr: 92 },
      { name: "Glen Rice", ovr: 81 },
      { name: "Robert Horry", ovr: 78 },
      { name: "Derek Fisher", ovr: 76 },
    ],
  },
  {
    name: "San Antonio Spurs",
    year: 2014,
    blurb: "The beautiful-game ball-movement masterclass.",
    players: [
      { name: "Tim Duncan", ovr: 89 },
      { name: "Tony Parker", ovr: 88 },
      { name: "Kawhi Leonard", ovr: 86 },
      { name: "Manu Ginóbili", ovr: 85 },
      { name: "Danny Green", ovr: 79 },
    ],
  },
  {
    name: "Boston Celtics",
    year: 2008,
    blurb: "The original modern Big Three, elite defense.",
    players: [
      { name: "Kevin Garnett", ovr: 92 },
      { name: "Paul Pierce", ovr: 89 },
      { name: "Ray Allen", ovr: 86 },
      { name: "Rajon Rondo", ovr: 83 },
      { name: "Kendrick Perkins", ovr: 76 },
    ],
  },
  {
    name: "Cleveland Cavaliers",
    year: 2016,
    blurb: "Came back from 3-1. LeBron willed it home.",
    players: [
      { name: "LeBron James", ovr: 98 },
      { name: "Kyrie Irving", ovr: 90 },
      { name: "Kevin Love", ovr: 85 },
      { name: "Tristan Thompson", ovr: 79 },
      { name: "J.R. Smith", ovr: 77 },
    ],
  },
  {
    name: "Denver Nuggets",
    year: 2023,
    blurb: "Jokić orchestrated a wire-to-wire run.",
    players: [
      { name: "Nikola Jokić", ovr: 98 },
      { name: "Jamal Murray", ovr: 88 },
      { name: "Aaron Gordon", ovr: 82 },
      { name: "Michael Porter Jr.", ovr: 82 },
      { name: "Kentavious Caldwell-Pope", ovr: 78 },
    ],
  },
  {
    name: "Los Angeles Lakers",
    year: 2020,
    blurb: "LeBron + AD bullied the bubble.",
    players: [
      { name: "LeBron James", ovr: 97 },
      { name: "Anthony Davis", ovr: 95 },
      { name: "Kentavious Caldwell-Pope", ovr: 79 },
      { name: "Rajon Rondo", ovr: 78 },
      { name: "Dwight Howard", ovr: 77 },
    ],
  },
  {
    name: "Toronto Raptors",
    year: 2019,
    blurb: "Kawhi's bounce-pass year. One ring, then gone.",
    players: [
      { name: "Kawhi Leonard", ovr: 96 },
      { name: "Kyle Lowry", ovr: 86 },
      { name: "Pascal Siakam", ovr: 84 },
      { name: "Marc Gasol", ovr: 80 },
      { name: "Danny Green", ovr: 80 },
    ],
  },
  {
    name: "Dallas Mavericks",
    year: 2011,
    blurb: "Dirk's title. (Yes — the one team that DIDN'T let the good one walk.)",
    players: [
      { name: "Dirk Nowitzki", ovr: 94 },
      { name: "Jason Kidd", ovr: 83 },
      { name: "Tyson Chandler", ovr: 83 },
      { name: "Shawn Marion", ovr: 82 },
      { name: "Jason Terry", ovr: 82 },
    ],
  },
];

CHAMPIONS.forEach((c) => {
  c.rating = Math.round(
    c.players.reduce((a, p) => a + p.ovr, 0) / c.players.length
  );
});
