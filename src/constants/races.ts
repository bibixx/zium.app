import { z } from "zod";

const raceGenresValidatorLiterals = [
  z.literal("race"),
  z.literal("qualifying"),
  z.literal("practice"),
  z.literal("sprint qualifying"),
  z.literal("sprint race"),
  z.literal("sprint"),
] as const;

const raceGenresValidator = z.preprocess((val) => String(val).toLowerCase(), z.union(raceGenresValidatorLiterals));
export const eventGenresValidator = z.preprocess(
  (val) => String(val).toLowerCase(),
  z.union([
    ...raceGenresValidatorLiterals,
    z.literal("post-race show"),
    z.literal("pre-race show"),
    z.literal("weekend warm-up"),
    z.literal("post-qualifying show"),
    z.literal("pre-qualifying show"),
    z.literal("post-sprint show"),
    z.literal("pre-sprint show"),
    z.literal("show"),
  ]),
);

export type RaceGenre = z.output<typeof raceGenresValidator>;
export type EventGenre = z.output<typeof eventGenresValidator>;

export const isRaceGenre = (genre: string) => raceGenresValidator.safeParse(genre).success;
