import type { Statistics } from "@shared/models/statistics.model";

export interface StatisticsState {
  statistics: Statistics | null;
  statisticsLoading: boolean;
  statisticsError: string | null;
  retryAfterSeconds: number | null;
  /** Epoch millis of the last successful read, for the "as at" line. */
  loadedAt: number | null;
}

export const initialStatisticsState: StatisticsState = {
  statistics: null,
  statisticsLoading: false,
  statisticsError: null,
  retryAfterSeconds: null,
  loadedAt: null,
};
