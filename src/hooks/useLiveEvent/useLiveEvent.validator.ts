import { z } from "zod";

export const bodyRootValidator = z.object({
  resultObj: z.object({
    containers: z
      .object({
        retrieveItems: z.object({
          resultObj: z.object({
            containers: z.unknown().array(),
          }),
        }),
      })
      .array(),
  }),
});

const eventGenresUnionValidator = z.preprocess(
  (val) => String(val).toLowerCase(),
  z.union([
    z.literal("race"),
    z.literal("qualifying"),
    z.literal("practice"),
    z.literal("sprint qualifying"),
    z.literal("sprint race"),
    z.literal("sprint"),
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

export const containerValidator = z.object({
  id: z.string(),
  metadata: z.object({
    shortDescription: z.string(),
    pictureUrl: z.string(),
    contentId: z.number(),
    contentSubtype: z.string(),
    genres: eventGenresUnionValidator.array(),
    emfAttributes: z.object({
      PageID: z.coerce.string().nullable(),
      Meeting_Country_Name: z.string(),
      Meeting_Start_Date: z.string(),
      Meeting_End_Date: z.string(),
      Meeting_Number: z.coerce.number(),
      Global_Title: z.string(),
      MeetingCountryKey: z.string(),
    }),
  }),
});

export type Container = z.output<typeof containerValidator>;
