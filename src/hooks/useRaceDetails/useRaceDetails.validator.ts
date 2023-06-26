import { z } from "zod";

export const bodyRootValidator = z.object({
  resultObj: z.object({
    containers: z
      .object({
        layout: z.string(),
        metadata: z.object({
          label: z.string().nullable(),
        }),
        retrieveItems: z.object({
          resultObj: z.object({
            containers: z.unknown().array(),
          }),
        }),
      })
      .array(),
  }),
});

export const scheduledContainerValidator = z.object({
  eventName: z.string(),
  events: z.unknown().array(),
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

export const eventValidator = z.object({
  id: z.string(),
  metadata: z.object({
    titleBrief: z.string(),
    contentId: z.number(),
    pictureUrl: z.string(),
    contentSubtype: z.string(),
    genres: eventGenresUnionValidator.array(),
    emfAttributes: z.object({
      Series: z.string(),
      Global_Title: z.string(),
      Meeting_Country_Name: z.string(),
      MeetingCountryKey: z.string(),
      Meeting_Number: z.coerce.number(),
      ContentCategory: z.string(),
      sessionStartDate: z.number(),
      sessionEndDate: z.number(),
    }),
  }),
});

export type Event = z.output<typeof eventValidator>;
