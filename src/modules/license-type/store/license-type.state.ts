import type {
  LicenseFamily,
  LicenseType,
} from "@shared/models/license-type.model";

export interface LicenseTypeState {
  types: LicenseType[];
  typesLoading: boolean;
  typesError: string | null;
  retryAfterSeconds: number | null;

  /** Null means "all families". Presentation state. */
  familyFilter: LicenseFamily | null;
  filter: string;
}

export const initialLicenseTypeState: LicenseTypeState = {
  types: [],
  typesLoading: false,
  typesError: null,
  retryAfterSeconds: null,
  familyFilter: null,
  filter: "",
};
