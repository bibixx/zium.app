import { z } from "zod";

export const bodyRootValidator = z.object({
  resultObj: z.object({
    containers: z.unknown().array(),
  }),
});

export const containersValidator = z.object({
  retrieveItems: z.object({
    resultObj: z.object({
      containers: z.unknown().array(),
    }),
  }),
});

export const raceValidator = z.object({
  id: z.string(),
  metadata: z.object({
    contentId: z.number(),
    contentSubtype: z.string(),
    genres: z.preprocess((val) => String(val).toLowerCase(), z.literal("race")).array(),
    pictureUrl: z.string(),
    emfAttributes: z.object({
      Series: z.string(),
      PageID: z.coerce.string().nullable(),
      Global_Meeting_Name: z.string(),
      Meeting_Official_Name: z.string(),
      Meeting_Country_Name: z.string(),
      MeetingCountryKey: z.string(),
      Championship_Meeting_Ordinal: z.coerce.number(),
      Meeting_Start_Date: z.string(),
      Meeting_End_Date: z.string(),
    }),
  }),
});
