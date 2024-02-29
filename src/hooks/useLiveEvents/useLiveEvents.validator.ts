import { z } from "zod";
import { eventGenresValidator } from "../../constants/races";

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

export const containerValidator = z.object({
  id: z.string(),
  metadata: z.object({
    title: z.string(),
    shortDescription: z.string(),
    pictureUrl: z.string(),
    contentId: z.number(),
    contentSubtype: z.string(),
    genres: eventGenresValidator.array(),
    emfAttributes: z.object({
      PageID: z.coerce.string().nullable(),
      Meeting_Country_Name: z.string(),
      Meeting_Start_Date: z.string(),
      Meeting_End_Date: z.string(),
      sessionStartDate: z.number(),
      sessionEndDate: z.number(),
      Meeting_Number: z.coerce.number(),
      Global_Title: z.string(),
      MeetingCountryKey: z.string(),
    }),
  }),
  uiMetadata: z.object({
    mainTitle: z.string(),
    subTitle: z.string(),
    summary: z.string(),
  }),
});

export type Container = z.output<typeof containerValidator>;
