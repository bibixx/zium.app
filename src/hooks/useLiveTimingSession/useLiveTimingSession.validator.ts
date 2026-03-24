import { z } from "zod";

const liveTimingSessionValidator = z.object({
  Name: z.string(),
  StartDate: z.string(),
  EndDate: z.string(),
  Type: z.string(),
  Path: z.string(),
  Key: z.number(),
});

const liveTimingMeetingValidator = z.object({
  Name: z.string(),
  Location: z.string(),
  Sessions: z.array(liveTimingSessionValidator),
});

export const liveTimingIndexValidator = z.object({
  Year: z.number(),
  Meetings: z.array(liveTimingMeetingValidator),
});
