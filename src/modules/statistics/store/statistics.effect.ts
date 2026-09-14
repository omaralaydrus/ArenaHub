import type { AppStartListening } from "@store/listener";
import { HttpError } from "@core/http/http.client";
import { findStatistics } from "@shared/services/statistics.service";
import * as StatisticsActions from "./statistics.action";

export function startStatisticsListeners(
  startAppListening: AppStartListening,
): void {
  startAppListening({
    actionCreator: StatisticsActions.loadStatistics,
    effect: async (_action, listenerApi) => {
      listenerApi.cancelActiveListeners();

      try {
        const statistics = await listenerApi.pause(findStatistics());
        listenerApi.dispatch(
          StatisticsActions.loadStatisticsSuccess({
            statistics,
            loadedAt: Date.now(),
          }),
        );
      } catch (error) {
        if (listenerApi.signal.aborted) return;
        listenerApi.dispatch(
          StatisticsActions.loadStatisticsFailure({
            message:
              error instanceof Error
                ? error.message
                : "Failed to load statistics.",
            retryAfterSeconds:
              error instanceof HttpError ? error.retryAfterSeconds : undefined,
          }),
        );
      }
    },
  });
}
