import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@store/index";
import { groupByDun } from "@shared/models/zone.model";

/**
 * RTK re-exports reselect's `createSelector`, the same library NgRx uses, so
 * these are line-for-line what the Angular selectors look like. The only
 * substitution is the feature accessor: NgRx's `createFeatureSelector<T>('zone')`
 * becomes a plain typed lambda, because `RootState` already names the slice.
 */
const selectZoneState = (state: RootState) => state.zone;

export const selectZones = createSelector(
  selectZoneState,
  (state) => state.zones,
);
export const selectZonesLoading = createSelector(
  selectZoneState,
  (state) => state.zonesLoading,
);
export const selectZonesError = createSelector(
  selectZoneState,
  (state) => state.zonesError,
);
export const selectRetryAfterSeconds = createSelector(
  selectZoneState,
  (state) => state.retryAfterSeconds,
);
export const selectZoneFilter = createSelector(
  selectZoneState,
  (state) => state.filter,
);

/** Zones narrowed by the free-text filter, matched over code and both names. */
export const selectFilteredZones = createSelector(
  [selectZones, selectZoneFilter],
  (zones, filter) => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return zones;
    return zones.filter(
      (zone) =>
        zone.zoneCode.toLowerCase().includes(needle) ||
        zone.nameMs.toLowerCase().includes(needle) ||
        (zone.nameEn?.toLowerCase().includes(needle) ?? false) ||
        zone.dunCode.toLowerCase().includes(needle),
    );
  },
);

/** Filtered zones grouped under their parent DUN, for the hierarchy view. */
export const selectZonesByDun = createSelector(selectFilteredZones, groupByDun);

/** Distinct DUN count across the loaded zones — a headline figure. */
export const selectDunCount = createSelector(
  selectZones,
  (zones) => new Set(zones.map((zone) => zone.dunCode)).size,
);
