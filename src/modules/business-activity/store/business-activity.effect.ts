import type { AppStartListening } from "@store/listener";
import { HttpError } from "@core/http/http.client";
import { findAllBusinessActivities } from "@shared/services/business-activity.service";
import * as BusinessActivityActions from "./business-activity.action";

export function startBusinessActivityListeners(
  startAppListening: AppStartListening,
): void {
  startAppListening({
    actionCreator: BusinessActivityActions.loadBusinessActivities,
    effect: async (_action, listenerApi) => {
      listenerApi.cancelActiveListeners();

      try {
        const activities = await listenerApi.pause(findAllBusinessActivities());
        listenerApi.dispatch(
          BusinessActivityActions.loadBusinessActivitiesSuccess({ activities }),
        );
      } catch (error) {
        if (listenerApi.signal.aborted) return;
        listenerApi.dispatch(
          BusinessActivityActions.loadBusinessActivitiesFailure({
            message:
              error instanceof Error
                ? error.message
                : "Failed to load business activities.",
            retryAfterSeconds:
              error instanceof HttpError ? error.retryAfterSeconds : undefined,
          }),
        );
      }
    },
  });
}
