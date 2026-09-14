import { test } from "node:test";
import assert from "node:assert/strict";
import { seedData } from "../src/shared/data/competitions";
import {
  entryStatus,
  reservedPlaces,
  validateCompetition,
  validateRegistration,
} from "../src/shared/services/competition.service";
import {
  DEMO_USER,
  type Registration,
} from "../src/shared/models/competition.model";
import { competitionReducer } from "../src/modules/competitions/store/competition.reducer";
import * as A from "../src/modules/competitions/store/competition.action";
import { sandboxQuery, ALLOWED_PATHS } from "../src/core/http/sandbox.policy";

test("full and closed events reject registration even with valid player data", () => {
  const data = seedData();
  assert.equal(entryStatus(data.competitions[3], []), "Full");
  assert.equal(entryStatus(data.competitions[5], []), "Registration closed");
  assert.match(
    validateRegistration(
      data.competitions[3],
      data,
      "Squad",
      ["a", "b", "c", "d"],
      true,
    )!,
    /full/,
  );
});
test("team entries require a full unique roster and accepted rules", () => {
  const data = seedData();
  const e = data.competitions[0];
  assert.match(
    validateRegistration(e, data, "Squad", ["a"], true)!,
    /exactly 5/,
  );
  assert.match(
    validateRegistration(e, data, "Squad", ["a", "A", "c", "d", "e"], true)!,
    /unique/,
  );
  assert.match(
    validateRegistration(e, data, "Squad", ["a", "b", "c", "d", "e"], false)!,
    /Accept/,
  );
  assert.equal(
    validateRegistration(e, data, "Squad", ["a", "b", "c", "d", "e"], true),
    null,
  );
});
test("duplicate entries are prevented and withdrawals release capacity", () => {
  let s = competitionReducer(undefined, A.loaded(seedData()));
  const event = s.competitions[4];
  s = competitionReducer(
    s,
    A.joinCompetition({
      eventId: event.id,
      name: "Alex",
      roster: ["alex"],
      accepted: true,
      id: "one",
    }),
  );
  assert.equal(s.registrations[0].status, "confirmed");
  assert.equal(reservedPlaces(event, s.registrations), event.occupied + 1);
  s = competitionReducer(
    s,
    A.joinCompetition({
      eventId: event.id,
      name: "Other",
      roster: ["other"],
      accepted: true,
      id: "two",
    }),
  );
  assert.match(s.error!, /already/);
  assert.equal(s.registrations.length, 1);
  s = competitionReducer(s, A.withdrawRegistration("one"));
  assert.equal(s.registrations[0].status, "withdrawn");
  assert.equal(reservedPlaces(event, s.registrations), event.occupied);
});
test("pending entries reserve capacity and the final place cannot be oversubscribed", () => {
  const data = seedData();
  const event = { ...data.competitions[1], occupied: 15 };
  const pending: Registration = {
    id: "p",
    competitionId: event.id,
    userId: "other",
    name: "Team",
    roster: ["a", "b", "c", "d", "e"],
    status: "pending",
  };
  assert.equal(entryStatus(event, [pending]), "Full");
  assert.equal(
    entryStatus(event, [{ ...pending, status: "rejected" }]),
    "Registration open",
  );
});
test("published events enforce dates, host ownership, and venue requirements", () => {
  const data = seedData();
  const event = { ...data.competitions[0], hostId: DEMO_USER };
  assert.equal(validateCompetition(event, data), null);
  assert.match(
    validateCompetition({ ...event, deadline: event.startsAt }, data)!,
    /before/,
  );
  assert.match(
    validateCompetition(
      { ...event, deadline: new Date(0).toISOString() },
      data,
    )!,
    /future/,
  );
  assert.match(
    validateCompetition({ ...event, mode: "In person", location: "" }, data)!,
    /venue/,
  );
  assert.match(
    validateCompetition({ ...event, hostId: "stranger" }, data)!,
    /host/,
  );
});
test("only the owner can save an existing event or cancel it with a reason", () => {
  let s = competitionReducer(undefined, A.loaded(seedData()));
  s = competitionReducer(
    s,
    A.saveCompetition({
      event: { ...s.competitions[0], hostId: DEMO_USER },
      publish: true,
    }),
  );
  assert.match(s.error!, /host/);
  const own = {
    ...s.competitions[0],
    id: "own",
    occupied: 0,
    hostId: DEMO_USER,
  };
  s = competitionReducer(s, A.saveCompetition({ event: own, publish: true }));
  s = competitionReducer(s, A.cancelCompetition({ id: "own", reason: "" }));
  assert.match(s.error!, /reason/);
  s = competitionReducer(
    s,
    A.cancelCompetition({ id: "own", reason: "Venue unavailable" }),
  );
  const cancelled = s.competitions.find((e) => e.id === "own")!;
  assert.equal(entryStatus(cancelled, []), "Cancelled");
  s = competitionReducer(
    s,
    A.saveCompetition({
      event: { ...cancelled, status: "published" },
      publish: true,
    }),
  );
  assert.match(s.error!, /Cancelled/);
});
test("host review changes only pending entries and releases rejected places", () => {
  const data = seedData();
  data.competitions[0].hostId = DEMO_USER;
  data.registrations.push({
    id: "r",
    competitionId: data.competitions[0].id,
    userId: "guest",
    name: "Guest team",
    roster: ["a", "b", "c", "d", "e"],
    status: "pending",
  });
  let s = competitionReducer(undefined, A.loaded(data));
  s = competitionReducer(s, A.reviewRegistration({ id: "r", approved: false }));
  assert.equal(s.registrations[0].status, "rejected");
  s = competitionReducer(s, A.reviewRegistration({ id: "r", approved: true }));
  assert.match(s.error!, /cannot be reviewed/);
});
test("game and team size are locked when a registration exists", () => {
  const data = seedData();
  data.competitions[0].hostId = DEMO_USER;
  data.registrations.push({
    id: "r",
    competitionId: data.competitions[0].id,
    userId: "guest",
    name: "Guest",
    roster: [],
    status: "withdrawn",
  });
  assert.match(
    validateCompetition({ ...data.competitions[0], teamSize: 1 }, data)!,
    /cannot change/,
  );
});
test("proxy only permits documented reads and validates paging", () => {
  assert.equal(ALLOWED_PATHS.has("competitions"), false);
  assert.equal(ALLOWED_PATHS.has("../oauth/token"), false);
  assert.equal(
    sandboxQuery(new URLSearchParams("offset=0&limit=999&secret=test")),
    "?offset=0&limit=200",
  );
  assert.throws(() => sandboxQuery(new URLSearchParams("offset=-1")));
  assert.throws(() => sandboxQuery(new URLSearchParams("limit=0")));
  assert.throws(() => sandboxQuery(new URLSearchParams("limit=NaN")));
});
