import type { ArenaData, Competition } from "@shared/models/competition.model";

export const games = [
  { name: "Counter-Strike 2", short: "CS2", app: "730", color: "#dc9a46" },
  { name: "Dota 2", short: "DOTA", app: "570", color: "#d16a5e" },
  { name: "Apex Legends", short: "APEX", app: "1172470", color: "#d76464" },
  {
    name: "PUBG: Battlegrounds",
    short: "PUBG",
    app: "578080",
    color: "#d0b66a",
  },
  { name: "Rocket League", short: "RL", app: "252950", color: "#63a5e9" },
  { name: "EA Sports FC", short: "FC", app: "2669320", color: "#a2ce77" },
];
export const gameImage = (game: string) =>
  `/games/${games.find((g) => g.name === game)?.app ?? "730"}.jpg`;
export function seedData(now = Date.now()): ArenaData {
  const date = (days: number) => new Date(now + days * 86400000).toISOString();
  const rows = [
    [
      "Counter-Strike 2",
      "Counter-Strike Community Clash",
      "Frag Society",
      "RM 2,000",
      5,
      32,
      24,
      5,
    ],
    [
      "Dota 2",
      "Ancient Rivals: SEA Open",
      "Midnight Esports",
      "RM 1,500",
      5,
      16,
      10,
      7,
    ],
    [
      "Apex Legends",
      "Apex After Hours",
      "The Drop Zone",
      "RM 800",
      3,
      20,
      14,
      3,
    ],
    [
      "PUBG: Battlegrounds",
      "Last Squad Standing",
      "Battleground MY",
      "RM 1,200",
      4,
      16,
      16,
      10,
    ],
    [
      "Rocket League",
      "Boost & Beyond Cup",
      "Overtime Club",
      "RM 500",
      1,
      32,
      18,
      4,
    ],
    [
      "EA Sports FC",
      "Weekend Kickoff: Solo Cup",
      "Next Gen Gaming",
      "RM 600",
      1,
      32,
      22,
      8,
    ],
  ] as const;
  const competitions: Competition[] = rows.map(
    ([game, title, host, prize, teamSize, capacity, occupied, days], i) => ({
      id: `arena-${i + 1}`,
      title,
      game,
      host,
      prize,
      teamSize,
      capacity,
      occupied,
      description: `Ready to make your mark? Join ${host} for a friendly but competitive ${game} showdown. Bring your best plays, meet your next rivals, and compete for community bragging rights. All matches are played on Southeast Asian servers.`,
      image: gameImage(game),
      hostId: `host-${i}`,
      region: "Southeast Asia",
      platform: i === 5 ? "Console" : "PC",
      skill: i === 1 ? "Intermediate" : "All levels",
      mode: "Online",
      location: "",
      zoneCode: "",
      licenseCode: "",
      activityCode: "",
      startsAt: date(days),
      deadline: date(i === 5 ? -1 : days - 1),
      rules:
        "Play fair: cheating, exploits, and harassment are not allowed.\nCheck in 15 minutes before your first match.\nUse the submitted roster throughout the competition.\nFollow host instructions and report disputed results to the organizer.",
      approval: i === 1,
      status: "published",
      cancelReason: "",
      format: "Single elimination",
    }),
  );
  return { competitions, registrations: [], saved: [] };
}
