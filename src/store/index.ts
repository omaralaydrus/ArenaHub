import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import type { AppStartListening } from "./listener";
import { zoneReducer } from "@modules/zone/store/zone.reducer";
import { licenseTypeReducer } from "@modules/license-type/store/license-type.reducer";
import { businessActivityReducer } from "@modules/business-activity/store/business-activity.reducer";
import { statisticsReducer } from "@modules/statistics/store/statistics.reducer";
import { competitionReducer } from "@modules/competitions/store/competition.reducer";
import { startZoneListeners } from "@modules/zone/store/zone.effect";
import { startLicenseTypeListeners } from "@modules/license-type/store/license-type.effect";
import { startBusinessActivityListeners } from "@modules/business-activity/store/business-activity.effect";
import { startStatisticsListeners } from "@modules/statistics/store/statistics.effect";
import { startCompetitionListeners } from "@modules/competitions/store/competition.effect";

export const makeStore = () => {
  const listener = createListenerMiddleware();
  const store = configureStore({
    reducer: {
      zone: zoneReducer,
      licenseType: licenseTypeReducer,
      businessActivity: businessActivityReducer,
      statistics: statisticsReducer,
      competitions: competitionReducer,
    },
    middleware: (getDefault) => getDefault().prepend(listener.middleware),
  });
  const listen = listener.startListening as AppStartListening;
  startZoneListeners(listen);
  startLicenseTypeListeners(listen);
  startBusinessActivityListeners(listen);
  startStatisticsListeners(listen);
  startCompetitionListeners(listen);
  return store;
};
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
