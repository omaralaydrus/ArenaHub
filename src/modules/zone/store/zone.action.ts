import { createAction } from "@reduxjs/toolkit";
import type { Zone } from "@shared/models/zone.model";

/**
 * RTK's `createAction` is the same function NgRx's is modelled on, so the
 * load/success/failure triad carries over unchanged — including the
 * `'[Feature] Description'` naming, which keeps the Redux DevTools log readable
 * in exactly the way the Angular console's is.
 */

export const loadZones = createAction("[Zone] Load Zones");
export const loadZonesSuccess = createAction<{ zones: Zone[] }>(
  "[Zone] Load Zones Success",
);
export const loadZonesFailure = createAction<{
  message: string;
  retryAfterSeconds?: number;
}>("[Zone] Load Zones Failure");

export const setZoneFilter = createAction<{ filter: string }>(
  "[Zone] Set Filter",
);
