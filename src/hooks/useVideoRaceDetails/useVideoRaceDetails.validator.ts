import { z } from "zod";
import { entitlementValidator, eventGenresValidator } from "../../constants/races";

export const videoRaceStreamsRootBodyValidator = z.object({
  resultObj: z.object({
    containers: z.unknown().array(),
  }),
});

export const baseStreamDataValidator = z.object({
  type: z.string(),
  playbackUrl: z.string(),
  channelId: z.number(),
  title: z.string(),
  reportingName: z.string(),
  default: z.boolean(),
});
const driverStreamDataValidator = baseStreamDataValidator.extend({
  identifier: z.literal("OBC"),
  racingNumber: z.number(),
  teamName: z.string(),
  driverImg: z.string(),
  teamImg: z.string(),
  driverFirstName: z.string(),
  driverLastName: z.string(),
  constructorName: z.string(),
  hex: z.string(),
});
const otherStreamDataValidator = baseStreamDataValidator.extend({
  identifier: z.string(),
});

export const streamDataValidator = z.union([driverStreamDataValidator, otherStreamDataValidator]);
export type StreamData = z.output<typeof streamDataValidator>;
export type DriverStreamData = z.output<typeof driverStreamDataValidator>;
export type OtherStreamData = z.output<typeof otherStreamDataValidator>;

const f1PlaybackOffsetValidator = z.object({
  channels: z.tuple([z.string(), z.string()]),
  channelToAdjust: z.string(),
  delaySeconds: z.number(),
});

export const videoRaceStreamsContainerValidator = z.object({
  playbackOffsets: f1PlaybackOffsetValidator.array().optional(),
  metadata: z.object({
    season: z.number(),
    contentSubtype: z.string(),
    titleBrief: z.string(),
    meetingKey: z.string(),
    genres: eventGenresValidator.array(),
    entitlement: entitlementValidator,
    additionalStreams: z.unknown().array().optional(),
    emfAttributes: z.object({
      Meeting_Country_Name: z.string(),
      MeetingCountryKey: z.string(),
    }),
  }),
});
