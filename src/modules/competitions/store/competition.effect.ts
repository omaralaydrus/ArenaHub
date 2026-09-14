import { isAnyOf } from "@reduxjs/toolkit";
import type { AppStartListening } from "@store/listener";
import { loadArena, saveArena } from "@shared/services/competition.service";
import { seedData } from "@shared/data/competitions";
import * as A from "./competition.action";

export function startCompetitionListeners(listen: AppStartListening) {
  listen({
    actionCreator: A.initialize,
    effect: (_, api) => {
      if (api.getState().competitions.ready) return;
      try {
        const data = loadArena();
        api.dispatch(A.loaded(data ?? seedData()));
        if (!data) saveArena(api.getState().competitions);
      } catch {
        api.dispatch(A.loaded(seedData()));
        api.dispatch(
          A.persistenceFailure(
            "Browser storage is unavailable or contains unreadable data. Changes will last for this session only. Existing storage was preserved.",
          ),
        );
      }
    },
  });
  listen({
    matcher: isAnyOf(
      A.saveCompetition,
      A.joinCompetition,
      A.withdrawRegistration,
      A.reviewRegistration,
      A.cancelCompetition,
      A.toggleSaved,
    ),
    effect: (_, api) => {
      const s = api.getState().competitions;
      if (!s.ready || !s.persistence || s.error) return;
      try {
        saveArena({
          competitions: s.competitions,
          registrations: s.registrations,
          saved: s.saved,
        });
      } catch {
        api.dispatch(
          A.persistenceFailure(
            "Your browser could not save these changes. They will last for this session only.",
          ),
        );
      }
    },
  });
}
