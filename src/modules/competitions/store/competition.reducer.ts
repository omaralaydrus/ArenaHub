import { createReducer } from "@reduxjs/toolkit";
import { initialCompetitionState } from "./competition.state";
import * as A from "./competition.action";
import { DEMO_USER } from "@shared/models/competition.model";
import {
  validateCompetition,
  validateRegistration,
} from "@shared/services/competition.service";

export const competitionReducer = createReducer(
  initialCompetitionState,
  (builder) =>
    builder
      .addCase(A.loaded, (s, a) => {
        Object.assign(s, a.payload);
        s.ready = true;
      })
      .addCase(A.failure, (s, a) => {
        s.error = a.payload;
      })
      .addCase(A.persistenceFailure, (s, a) => {
        s.persistence = false;
        s.error = a.payload;
      })
      .addCase(A.clearError, (s) => {
        s.error = null;
      })
      .addCase(A.toggleSaved, (s, a) => {
        s.saved = s.saved.includes(a.payload)
          ? s.saved.filter((id) => id !== a.payload)
          : [...s.saved, a.payload];
      })
      .addCase(A.saveCompetition, (s, a) => {
        const { event, publish } = a.payload;
        const existing = s.competitions.find((e) => e.id === event.id);
        if (
          event.hostId !== DEMO_USER ||
          (existing && existing.hostId !== DEMO_USER)
        ) {
          s.error = "Only the host can edit this event.";
          return;
        }
        if (existing?.status === "cancelled") {
          s.error = "Cancelled competitions cannot be changed.";
          return;
        }
        if (existing?.status === "published" && !publish) {
          s.error = "Published competitions cannot return to draft.";
          return;
        }
        const error = validateCompetition(event, s);
        if (error) {
          s.error = error;
          return;
        }
        const next = {
          ...event,
          status: publish ? ("published" as const) : ("draft" as const),
        };
        if (existing)
          s.competitions[s.competitions.findIndex((e) => e.id === event.id)] =
            next;
        else s.competitions.push(next);
        s.error = null;
      })
      .addCase(A.joinCompetition, (s, a) => {
        const event = s.competitions.find((e) => e.id === a.payload.eventId);
        if (!event) {
          s.error = "Competition not found.";
          return;
        }
        const error = validateRegistration(
          event,
          s,
          a.payload.name,
          a.payload.roster,
          a.payload.accepted,
        );
        if (error) {
          s.error = error;
          return;
        }
        s.registrations.push({
          id: a.payload.id,
          competitionId: event.id,
          userId: DEMO_USER,
          name: a.payload.name.trim(),
          roster: a.payload.roster.map((p) => p.trim()),
          status: event.approval ? "pending" : "confirmed",
        });
        s.error = null;
      })
      .addCase(A.withdrawRegistration, (s, a) => {
        const r = s.registrations.find((r) => r.id === a.payload);
        const e = s.competitions.find((e) => e.id === r?.competitionId);
        if (
          !r ||
          r.userId !== DEMO_USER ||
          !e ||
          Date.parse(e.startsAt) <= Date.now() ||
          !["pending", "confirmed"].includes(r.status)
        ) {
          s.error = "This registration cannot be withdrawn.";
          return;
        }
        r.status = "withdrawn";
        s.error = null;
      })
      .addCase(A.reviewRegistration, (s, a) => {
        const r = s.registrations.find((r) => r.id === a.payload.id);
        const e = s.competitions.find((e) => e.id === r?.competitionId);
        if (
          !r ||
          !e ||
          e.hostId !== DEMO_USER ||
          e.status !== "published" ||
          Date.parse(e.startsAt) <= Date.now() ||
          r.status !== "pending"
        ) {
          s.error = "This registration cannot be reviewed.";
          return;
        }
        r.status = a.payload.approved ? "confirmed" : "rejected";
        s.error = null;
      })
      .addCase(A.cancelCompetition, (s, a) => {
        const e = s.competitions.find((e) => e.id === a.payload.id);
        if (!e || e.hostId !== DEMO_USER || !a.payload.reason.trim()) {
          s.error = "Only the host can cancel an event, with a reason.";
          return;
        }
        e.status = "cancelled";
        e.cancelReason = a.payload.reason.trim();
        s.error = null;
      }),
);
