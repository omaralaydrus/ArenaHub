import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@store/index";
import type { LicenseType } from "@shared/models/license-type.model";

const selectLicenseTypeState = (state: RootState) => state.licenseType;

export const selectLicenseTypes = createSelector(
  selectLicenseTypeState,
  (state) => state.types,
);
export const selectLicenseTypesLoading = createSelector(
  selectLicenseTypeState,
  (state) => state.typesLoading,
);
export const selectLicenseTypesError = createSelector(
  selectLicenseTypeState,
  (state) => state.typesError,
);
export const selectRetryAfterSeconds = createSelector(
  selectLicenseTypeState,
  (state) => state.retryAfterSeconds,
);
export const selectFamilyFilter = createSelector(
  selectLicenseTypeState,
  (state) => state.familyFilter,
);
export const selectLicenseTypeFilter = createSelector(
  selectLicenseTypeState,
  (state) => state.filter,
);

export const selectFilteredLicenseTypes = createSelector(
  [selectLicenseTypes, selectFamilyFilter, selectLicenseTypeFilter],
  (types, family, filter) => {
    const needle = filter.trim().toLowerCase();
    return types.filter((type) => {
      if (family && type.family !== family) return false;
      if (!needle) return true;
      return (
        type.code.toLowerCase().includes(needle) ||
        type.name.toLowerCase().includes(needle) ||
        (type.nameEn?.toLowerCase().includes(needle) ?? false)
      );
    });
  },
);

/** Headline counts, computed off the unfiltered list so they stay stable while filtering. */
export const selectFamilyCounts = createSelector(selectLicenseTypes, (types) =>
  types.reduce(
    (acc, type) => {
      acc[type.family] += 1;
      return acc;
    },
    { LICENSE: 0, PERMIT: 0 } as Record<LicenseType["family"], number>,
  ),
);

export const selectHighRiskCount = createSelector(
  selectLicenseTypes,
  (types) => types.filter((type) => type.riskCategory === "HIGH_RISK").length,
);
