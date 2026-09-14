import type { Zone } from "@shared/models/zone.model";

/**
 * Feature state shape. Mirrors the Angular convention of one `*.state.ts` per
 * feature holding the interface and its initial value, with a
 * loading/error flag per independently-loadable collection.
 */
export interface ZoneState {
  zones: Zone[];
  zonesLoading: boolean;
  zonesError: string | null;

  /** Set when the failure was a rate limit, so the UI can show a countdown. */
  retryAfterSeconds: number | null;

  /** Free-text filter over code and names. Presentation state, kept in the store. */
  filter: string;
}

export const initialZoneState: ZoneState = {
  zones: [],
  zonesLoading: false,
  zonesError: null,
  retryAfterSeconds: null,
  filter: "",
};
