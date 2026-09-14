import {
  DEMO_USER,
  type ArenaData,
  type Competition,
  type Registration,
} from "@shared/models/competition.model";

export function reservedPlaces(
  event: Competition,
  registrations: Registration[],
) {
  return (
    event.occupied +
    registrations.filter(
      (r) =>
        r.competitionId === event.id &&
        ["pending", "confirmed"].includes(r.status),
    ).length
  );
}
export function entryStatus(
  event: Competition,
  registrations: Registration[],
  now = Date.now(),
) {
  if (event.status === "cancelled") return "Cancelled";
  if (event.status === "draft") return "Draft";
  if (Date.parse(event.startsAt) <= now) return "Started";
  if (Date.parse(event.deadline) <= now) return "Registration closed";
  if (reservedPlaces(event, registrations) >= event.capacity) return "Full";
  return "Registration open";
}
export function validateRegistration(
  event: Competition,
  data: ArenaData,
  name: string,
  roster: string[],
  accepted: boolean,
  now = Date.now(),
) {
  const state = entryStatus(event, data.registrations, now);
  if (state !== "Registration open")
    return `You cannot join: ${state.toLowerCase()}.`;
  if (event.hostId === DEMO_USER)
    return "You are the host of this competition.";
  if (
    data.registrations.some(
      (r) =>
        r.competitionId === event.id &&
        r.userId === DEMO_USER &&
        ["pending", "confirmed"].includes(r.status),
    )
  )
    return "You already have a registration for this competition.";
  if (!name.trim()) return "Enter your player or team name.";
  if (roster.length !== event.teamSize || roster.some((p) => !p.trim()))
    return `Enter exactly ${event.teamSize} in-game username${event.teamSize > 1 ? "s" : ""}.`;
  if (new Set(roster.map((p) => p.trim().toLowerCase())).size !== roster.length)
    return "Each player must have a unique in-game username.";
  if (!accepted) return "Accept the competition rules to continue.";
  return null;
}
export function validateCompetition(
  event: Competition,
  data: ArenaData,
  now = Date.now(),
) {
  if (event.hostId !== DEMO_USER) return "Only the host can edit this event.";
  if (event.status === "cancelled")
    return "Cancelled events cannot be published.";
  if (event.title.trim().length < 5)
    return "Give your competition a title of at least 5 characters.";
  if (!event.game.trim() || !event.description.trim() || !event.rules.trim())
    return "Add a game, description, and competition rules.";
  if (
    !Number.isInteger(event.capacity) ||
    event.capacity < 2 ||
    event.capacity > 256
  )
    return "Capacity must be a whole number between 2 and 256.";
  if (
    !Number.isInteger(event.teamSize) ||
    event.teamSize < 1 ||
    event.teamSize > 10
  )
    return "Team size must be between 1 and 10 players.";
  if (
    !Number.isFinite(Date.parse(event.startsAt)) ||
    !Number.isFinite(Date.parse(event.deadline))
  )
    return "Choose valid start and registration deadline dates.";
  if (Date.parse(event.deadline) <= now)
    return "Registration must close in the future.";
  if (Date.parse(event.deadline) >= Date.parse(event.startsAt))
    return "Registration must close before the competition starts.";
  if (event.mode === "In person" && !event.location.trim())
    return "Add a venue address for your in-person event.";
  const old = data.competitions.find((e) => e.id === event.id);
  if (old && data.registrations.some((r) => r.competitionId === event.id)) {
    if (old.game !== event.game || old.teamSize !== event.teamSize)
      return "Game and team size cannot change after registrations exist.";
  }
  if (event.capacity < reservedPlaces(event, data.registrations))
    return "Capacity cannot be lower than reserved places.";
  return null;
}

const STORAGE_KEY = "arenahub.demo.v1";
function isCompetition(value: unknown): value is Competition {
  if (!value || typeof value !== "object") return false;
  const e = value as Competition;
  return (
    [
      "id",
      "title",
      "game",
      "description",
      "image",
      "host",
      "hostId",
      "region",
      "platform",
      "skill",
      "location",
      "zoneCode",
      "licenseCode",
      "activityCode",
      "prize",
      "rules",
      "cancelReason",
      "format",
    ].every(
      (k) => typeof (e as unknown as Record<string, unknown>)[k] === "string",
    ) &&
    ["draft", "published", "cancelled"].includes(e.status) &&
    ["Online", "In person"].includes(e.mode) &&
    Number.isInteger(e.capacity) &&
    e.capacity >= 2 &&
    e.capacity <= 256 &&
    Number.isInteger(e.teamSize) &&
    e.teamSize >= 1 &&
    e.teamSize <= 10 &&
    Number.isInteger(e.occupied) &&
    e.occupied >= 0 &&
    e.occupied <= e.capacity &&
    Number.isFinite(Date.parse(e.startsAt)) &&
    Number.isFinite(Date.parse(e.deadline)) &&
    typeof e.approval === "boolean"
  );
}
export function loadArena(): ArenaData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const data = JSON.parse(raw) as ArenaData;
  if (
    !Array.isArray(data.competitions) ||
    !data.competitions.every(isCompetition) ||
    !Array.isArray(data.registrations) ||
    !Array.isArray(data.saved) ||
    !data.saved.every((s) => typeof s === "string")
  )
    throw new Error(
      "Saved demo data could not be read. Your existing storage has been preserved.",
    );
  if (
    !data.registrations.every(
      (r) =>
        r &&
        ["id", "competitionId", "userId", "name"].every(
          (k) =>
            typeof (r as unknown as Record<string, unknown>)[k] === "string",
        ) &&
        Array.isArray(r.roster) &&
        r.roster.every((p) => typeof p === "string") &&
        ["pending", "confirmed", "rejected", "withdrawn"].includes(r.status),
    )
  )
    throw new Error("Saved registrations could not be read.");
  return data;
}
export function saveArena(data: ArenaData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
