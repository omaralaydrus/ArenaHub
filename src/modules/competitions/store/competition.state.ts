import type { ArenaData } from "@shared/models/competition.model";
export interface CompetitionState extends ArenaData {
  ready: boolean;
  error: string | null;
  persistence: boolean;
}
export const initialCompetitionState: CompetitionState = {
  competitions: [],
  registrations: [],
  saved: [],
  ready: false,
  error: null,
  persistence: true,
};
