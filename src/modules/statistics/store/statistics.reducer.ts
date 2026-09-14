import { createReducer } from "@reduxjs/toolkit";
import { initialStatisticsState } from "./statistics.state";
import * as StatisticsActions from "./statistics.action";

export const statisticsReducer = createReducer(
  initialStatisticsState,
  (builder) => {
    builder
      .addCase(StatisticsActions.loadStatistics, (state): void => {
        state.statisticsLoading = true;
        state.statisticsError = null;
        state.retryAfterSeconds = null;
      })
      .addCase(
        StatisticsActions.loadStatisticsSuccess,
        (state, action): void => {
          state.statistics = action.payload.statistics;
          state.loadedAt = action.payload.loadedAt;
          state.statisticsLoading = false;
        },
      )
      .addCase(
        StatisticsActions.loadStatisticsFailure,
        (state, action): void => {
          state.statisticsLoading = false;
          state.statisticsError = action.payload.message;
          state.retryAfterSeconds = action.payload.retryAfterSeconds ?? null;
        },
      );
  },
);
