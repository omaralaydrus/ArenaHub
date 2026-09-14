import { createAction } from "@reduxjs/toolkit";
import type {
  LicenseFamily,
  LicenseType,
} from "@shared/models/license-type.model";

export const loadLicenseTypes = createAction("[LicenseType] Load Types");
export const loadLicenseTypesSuccess = createAction<{ types: LicenseType[] }>(
  "[LicenseType] Load Types Success",
);
export const loadLicenseTypesFailure = createAction<{
  message: string;
  retryAfterSeconds?: number;
}>("[LicenseType] Load Types Failure");

export const setFamilyFilter = createAction<{ family: LicenseFamily | null }>(
  "[LicenseType] Set Family Filter",
);
export const setLicenseTypeFilter = createAction<{ filter: string }>(
  "[LicenseType] Set Filter",
);
