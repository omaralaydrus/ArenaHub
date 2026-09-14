import { createAction } from "@reduxjs/toolkit";
import type { ArenaData, Competition } from "@shared/models/competition.model";
export const initialize = createAction("[Competitions] Initialize");
export const loaded = createAction<ArenaData>("[Competitions] Loaded");
export const failure = createAction<string>("[Competitions] Failure");
export const persistenceFailure = createAction<string>(
  "[Competitions] Persistence failure",
);
export const clearError = createAction("[Competitions] Clear error");
export const saveCompetition = createAction<{
  event: Competition;
  publish: boolean;
}>("[Competitions] Save");
export const joinCompetition = createAction<{
  eventId: string;
  name: string;
  roster: string[];
  accepted: boolean;
  id: string;
}>("[Competitions] Join");
export const withdrawRegistration = createAction<string>(
  "[Competitions] Withdraw",
);
export const reviewRegistration = createAction<{
  id: string;
  approved: boolean;
}>("[Competitions] Review");
export const cancelCompetition = createAction<{ id: string; reason: string }>(
  "[Competitions] Cancel",
);
export const toggleSaved = createAction<string>("[Competitions] Toggle saved");
