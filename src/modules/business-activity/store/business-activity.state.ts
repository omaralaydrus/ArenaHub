import type { BusinessActivity } from "@shared/models/business-activity.model";

export interface BusinessActivityState {
  activities: BusinessActivity[];
  activitiesLoading: boolean;
  activitiesError: string | null;
  retryAfterSeconds: number | null;

  /** Null means "all tiers". Presentation state. */
  tierFilter: number | null;
  /** When true, only rows a business can actually declare. */
  selectableOnly: boolean;
  filter: string;
}

export const initialBusinessActivityState: BusinessActivityState = {
  activities: [],
  activitiesLoading: false,
  activitiesError: null,
  retryAfterSeconds: null,
  tierFilter: null,
  selectableOnly: false,
  filter: "",
};
