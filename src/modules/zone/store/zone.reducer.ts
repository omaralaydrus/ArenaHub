import { createReducer } from "@reduxjs/toolkit";
import { initialZoneState, type ZoneState } from "./zone.state";
import * as ZoneActions from "./zone.action";

/**
 * `createReducer`'s builder callback is the counterpart of NgRx's `on(...)`
 * list. The one real difference: RTK wraps the draft in Immer, so a handler may
 * assign to `state` directly instead of spreading a new object. Both styles are
 * valid; direct assignment is used here because it is what RTK code in the wild
 * looks like.
 */
export const zoneReducer = createReducer(initialZoneState, (builder) => {
  builder
    .addCase(ZoneActions.loadZones, (state): void => {
      state.zonesLoading = true;
      state.zonesError = null;
      state.retryAfterSeconds = null;
    })
    .addCase(ZoneActions.loadZonesSuccess, (state, action): void => {
      state.zones = action.payload.zones;
      state.zonesLoading = false;
    })
    .addCase(ZoneActions.loadZonesFailure, (state, action): void => {
      state.zonesLoading = false;
      state.zonesError = action.payload.message;
      state.retryAfterSeconds = action.payload.retryAfterSeconds ?? null;
    })
    .addCase(ZoneActions.setZoneFilter, (state, action): void => {
      state.filter = action.payload.filter;
    });
});

export type { ZoneState };
