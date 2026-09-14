import { createReducer } from "@reduxjs/toolkit";
import { initialBusinessActivityState } from "./business-activity.state";
import * as BusinessActivityActions from "./business-activity.action";

export const businessActivityReducer = createReducer(
  initialBusinessActivityState,
  (builder) => {
    builder
      .addCase(
        BusinessActivityActions.loadBusinessActivities,
        (state): void => {
          state.activitiesLoading = true;
          state.activitiesError = null;
          state.retryAfterSeconds = null;
        },
      )
      .addCase(
        BusinessActivityActions.loadBusinessActivitiesSuccess,
        (state, action): void => {
          state.activities = action.payload.activities;
          state.activitiesLoading = false;
        },
      )
      .addCase(
        BusinessActivityActions.loadBusinessActivitiesFailure,
        (state, action): void => {
          state.activitiesLoading = false;
          state.activitiesError = action.payload.message;
          state.retryAfterSeconds = action.payload.retryAfterSeconds ?? null;
        },
      )
      .addCase(BusinessActivityActions.setTierFilter, (state, action): void => {
        state.tierFilter = action.payload.tier;
      })
      .addCase(
        BusinessActivityActions.setSelectableOnly,
        (state, action): void => {
          state.selectableOnly = action.payload.selectableOnly;
        },
      )
      .addCase(
        BusinessActivityActions.setBusinessActivityFilter,
        (state, action): void => {
          state.filter = action.payload.filter;
        },
      );
  },
);
