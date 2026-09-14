import { createAction } from "@reduxjs/toolkit";
import type { Statistics } from "@shared/models/statistics.model";

export const loadStatistics = createAction("[Statistics] Load Statistics");
export const loadStatisticsSuccess = createAction<{
  statistics: Statistics;
  loadedAt: number;
}>("[Statistics] Load Statistics Success");
export const loadStatisticsFailure = createAction<{
  message: string;
  retryAfterSeconds?: number;
}>("[Statistics] Load Statistics Failure");
