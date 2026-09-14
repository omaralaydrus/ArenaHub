import type { AppStartListening } from "@store/listener";
import { HttpError } from "@core/http/http.client";
import { findAllLicenseTypes } from "@shared/services/license-type.service";
import * as LicenseTypeActions from "./license-type.action";

export function startLicenseTypeListeners(
  startAppListening: AppStartListening,
): void {
  startAppListening({
    actionCreator: LicenseTypeActions.loadLicenseTypes,
    effect: async (_action, listenerApi) => {
      listenerApi.cancelActiveListeners();

      try {
        const types = await listenerApi.pause(findAllLicenseTypes());
        listenerApi.dispatch(
          LicenseTypeActions.loadLicenseTypesSuccess({ types }),
        );
      } catch (error) {
        if (listenerApi.signal.aborted) return;
        listenerApi.dispatch(
          LicenseTypeActions.loadLicenseTypesFailure({
            message:
              error instanceof Error
                ? error.message
                : "Failed to load license types.",
            retryAfterSeconds:
              error instanceof HttpError ? error.retryAfterSeconds : undefined,
          }),
        );
      }
    },
  });
}
