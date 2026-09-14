import { createReducer } from "@reduxjs/toolkit";
import { initialLicenseTypeState } from "./license-type.state";
import * as LicenseTypeActions from "./license-type.action";

export const licenseTypeReducer = createReducer(
  initialLicenseTypeState,
  (builder) => {
    builder
      .addCase(LicenseTypeActions.loadLicenseTypes, (state): void => {
        state.typesLoading = true;
        state.typesError = null;
        state.retryAfterSeconds = null;
      })
      .addCase(
        LicenseTypeActions.loadLicenseTypesSuccess,
        (state, action): void => {
          state.types = action.payload.types;
          state.typesLoading = false;
        },
      )
      .addCase(
        LicenseTypeActions.loadLicenseTypesFailure,
        (state, action): void => {
          state.typesLoading = false;
          state.typesError = action.payload.message;
          state.retryAfterSeconds = action.payload.retryAfterSeconds ?? null;
        },
      )
      .addCase(LicenseTypeActions.setFamilyFilter, (state, action): void => {
        state.familyFilter = action.payload.family;
      })
      .addCase(
        LicenseTypeActions.setLicenseTypeFilter,
        (state, action): void => {
          state.filter = action.payload.filter;
        },
      );
  },
);
