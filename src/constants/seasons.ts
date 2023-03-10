export const SUPPORTED_SEASONS = ["2023", "2022"] as const;
export type SupportedSeasons = (typeof SUPPORTED_SEASONS)[number];
export const SEASON_TO_F1_ID_MAP: Record<SupportedSeasons, string> = {
  "2023": "6603",
  "2022": "4319",
};

export const DEFAULT_SEASON: SupportedSeasons = "2022";
export const COMING_SOON_SEASONS_DATA: Partial<Record<SupportedSeasons, Date>> = {
  "2023": new Date(2023, 3, 3),
};
