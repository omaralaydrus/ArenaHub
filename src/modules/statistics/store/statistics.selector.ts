import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@store/index";

const selectStatisticsState = (state: RootState) => state.statistics;

export const selectStatistics = createSelector(
  selectStatisticsState,
  (state) => state.statistics,
);
export const selectStatisticsLoading = createSelector(
  selectStatisticsState,
  (state) => state.statisticsLoading,
);
export const selectStatisticsError = createSelector(
  selectStatisticsState,
  (state) => state.statisticsError,
);
export const selectRetryAfterSeconds = createSelector(
  selectStatisticsState,
  (state) => state.retryAfterSeconds,
);
export const selectLoadedAt = createSelector(
  selectStatisticsState,
  (state) => state.loadedAt,
);

/** Total credentials across every lifecycle status. */
export const selectCredentialTotal = createSelector(
  selectStatistics,
  (statistics) =>
    statistics
      ? Object.values(statistics.credentialStatusCounts).reduce(
          (sum, count) => sum + count,
          0,
        )
      : 0,
);

/** Applications in flight across both pipelines. */
export const selectApplicationTotal = createSelector(
  selectStatistics,
  (statistics) => {
    if (!statistics) return 0;
    const sum = (counts: Record<string, number>) =>
      Object.values(counts).reduce((total, count) => total + count, 0);
    return (
      sum(statistics.licenseApplicationStageCounts) +
      sum(statistics.permitApplicationStageCounts)
    );
  },
);
