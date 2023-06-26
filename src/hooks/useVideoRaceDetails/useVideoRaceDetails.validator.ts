import { z } from "zod";

export const videoRaceStreamsRootBodyValidator = z.object({
  resultObj: z.object({
    containers: z.unknown().array(),
  }),
});

// TODO: Have shared genres validator
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

export const baseStreamDataValidator = z.object({
  racingNumber: z.number(),
  teamName: z.string(),
  type: z.string(),
  playbackUrl: z.string(),
  channelId: z.number(),
  title: z.string(),
  reportingName: z.string(),
  default: z.boolean(),
});
export const streamDataValidator = z.discriminatedUnion("identifier", [
  baseStreamDataValidator.extend({
    identifier: z.literal("OBC"),

    driverImg: z.string(),
    teamImg: z.string(),
    driverFirstName: z.string(),
    driverLastName: z.string(),
    constructorName: z.string(),
    hex: z.string(),
  }),
  // TODO: figure out how to make it z.string()
  baseStreamDataValidator.extend({
    identifier: z.literal("PRES"),
  }),
  baseStreamDataValidator.extend({
    identifier: z.literal("WIF"),
  }),
  baseStreamDataValidator.extend({
    identifier: z.literal("TRACKER"),
  }),
  baseStreamDataValidator.extend({
    identifier: z.literal("DATA"),
  }),
]);

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
    genres: eventGenresUnionValidator.array(),
    additionalStreams: z.unknown().array().optional(),
    emfAttributes: z.object({
      Meeting_Country_Name: z.string(),
      MeetingCountryKey: z.string(),
      MeetingSessionKey: z.string(),
    }),
  }),
});
