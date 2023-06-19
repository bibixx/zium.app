export const RACE_GENRES = ["race", "qualifying", "practice", "sprint qualifying", "sprint race", "sprint"] as const;
export const EVENT_GENRES = [
  ...RACE_GENRES,
  "post-race show",
  "pre-race show",
  "weekend warm-up",
  "post-qualifying show",
  "pre-qualifying show",
  "post-sprint show",
  "pre-sprint show",
] as const;

export type EventGenre = (typeof EVENT_GENRES)[number];
export type RaceGenre = (typeof RACE_GENRES)[number];

export const isRaceGenre = (genre: string) => (RACE_GENRES as readonly string[]).includes(genre);
