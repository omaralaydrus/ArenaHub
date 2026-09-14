import type { AppStartListening } from "@store/listener";
import { HttpError } from "@core/http/http.client";
import { findAllZones } from "@shared/services/zone.service";
import * as ZoneActions from "./zone.action";

/**
 * The NgRx effect this replaces:
 *
 *     loadZones$ = createEffect(() => this.actions$.pipe(
 *         ofType(ZoneActions.loadZones),
 *         switchMap(() => this.svc.findZones().pipe(
 *             switchMap(zones => [ZoneActions.loadZonesSuccess({zones})]),
 *             catchError(() => [ZoneActions.loadZonesFailure()]),
 *         )),
 *     ));
 *
 * `cancelActiveListeners()` supplies the `switchMap` behaviour: a second
 * dispatch abandons the in-flight run rather than letting two responses race to
 * the reducer. `try/catch` supplies `catchError`.
 */
export function startZoneListeners(startAppListening: AppStartListening): void {
  startAppListening({
    actionCreator: ZoneActions.loadZones,
    effect: async (_action, listenerApi) => {
      listenerApi.cancelActiveListeners();

      try {
        const zones = await listenerApi.pause(findAllZones());
        listenerApi.dispatch(ZoneActions.loadZonesSuccess({ zones }));
      } catch (error) {
        // A cancelled run rejects too; it must not be reported as a failure.
        if (listenerApi.signal.aborted) return;

        listenerApi.dispatch(
          ZoneActions.loadZonesFailure({
            message:
              error instanceof Error ? error.message : "Failed to load zones.",
            retryAfterSeconds:
              error instanceof HttpError ? error.retryAfterSeconds : undefined,
          }),
        );
      }
    },
  });
}
