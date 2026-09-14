import { createAction } from "@reduxjs/toolkit";
import type { BusinessActivity } from "@shared/models/business-activity.model";

export const loadBusinessActivities = createAction(
  "[BusinessActivity] Load Activities",
);
export const loadBusinessActivitiesSuccess = createAction<{
  activities: BusinessActivity[];
}>("[BusinessActivity] Load Activities Success");
export const loadBusinessActivitiesFailure = createAction<{
  message: string;
  retryAfterSeconds?: number;
}>("[BusinessActivity] Load Activities Failure");

export const setTierFilter = createAction<{ tier: number | null }>(
  "[BusinessActivity] Set Tier Filter",
);
export const setSelectableOnly = createAction<{ selectableOnly: boolean }>(
  "[BusinessActivity] Set Selectable Only",
);
export const setBusinessActivityFilter = createAction<{ filter: string }>(
  "[BusinessActivity] Set Filter",
);
