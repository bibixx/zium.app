import { z } from "zod";
import { eventGenresValidator } from "../../constants/races";

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

export const eventValidator = z.object({
  id: z.string(),
  metadata: z.object({
    title: z.string(),
    titleBrief: z.string(),
    contentId: z.number(),
    pictureUrl: z.string(),
    contentSubtype: z.string(),
    genres: eventGenresValidator.array(),
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
