import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@store/index";
import { groupByTier } from "@shared/models/business-activity.model";

const selectBusinessActivityState = (state: RootState) =>
  state.businessActivity;

export const selectActivities = createSelector(
  selectBusinessActivityState,
  (state) => state.activities,
);
export const selectActivitiesLoading = createSelector(
  selectBusinessActivityState,
  (state) => state.activitiesLoading,
);
export const selectActivitiesError = createSelector(
  selectBusinessActivityState,
  (state) => state.activitiesError,
);
export const selectRetryAfterSeconds = createSelector(
  selectBusinessActivityState,
  (state) => state.retryAfterSeconds,
);
export const selectTierFilter = createSelector(
  selectBusinessActivityState,
  (state) => state.tierFilter,
);
export const selectSelectableOnly = createSelector(
  selectBusinessActivityState,
  (state) => state.selectableOnly,
);
export const selectBusinessActivityFilter = createSelector(
  selectBusinessActivityState,
  (state) => state.filter,
);

export const selectFilteredActivities = createSelector(
  [
    selectActivities,
    selectTierFilter,
    selectSelectableOnly,
    selectBusinessActivityFilter,
  ],
  (activities, tier, selectableOnly, filter) => {
    const needle = filter.trim().toLowerCase();
    return activities.filter((activity) => {
      if (tier !== null && activity.tier !== tier) return false;
      if (selectableOnly && !activity.selectable) return false;
      if (!needle) return true;
      return (
        activity.code.toLowerCase().includes(needle) ||
        activity.name.toLowerCase().includes(needle) ||
        (activity.nameEn?.toLowerCase().includes(needle) ?? false)
      );
    });
  },
);

export const selectActivitiesByTier = createSelector(
  selectFilteredActivities,
  groupByTier,
);

/** Rows per tier across the unfiltered taxonomy — the shape of the tree. */
export const selectTierCounts = createSelector(selectActivities, (activities) =>
  activities.reduce<Record<number, number>>((acc, activity) => {
    acc[activity.tier] = (acc[activity.tier] ?? 0) + 1;
    return acc;
  }, {}),
);

/** How many activities a business can actually declare. */
export const selectSelectableCount = createSelector(
  selectActivities,
  (activities) => activities.filter((activity) => activity.selectable).length,
);
