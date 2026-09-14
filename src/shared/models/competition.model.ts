export type CompetitionStatus = "draft" | "published" | "cancelled";
export interface Competition {
  id: string;
  title: string;
  game: string;
  description: string;
  image: string;
  host: string;
  hostId: string;
  region: string;
  platform: string;
  skill: string;
  mode: "Online" | "In person";
  location: string;
  zoneCode: string;
  licenseCode: string;
  activityCode: string;
  teamSize: number;
  capacity: number;
  occupied: number;
  startsAt: string;
  deadline: string;
  prize: string;
  rules: string;
  approval: boolean;
  status: CompetitionStatus;
  cancelReason: string;
  format: string;
}
export interface Registration {
  id: string;
  competitionId: string;
  userId: string;
  name: string;
  roster: string[];
  status: "pending" | "confirmed" | "rejected" | "withdrawn";
}
export interface ArenaData {
  competitions: Competition[];
  registrations: Registration[];
  saved: string[];
}
export const DEMO_USER = "demo-player";
