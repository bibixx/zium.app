import { ZodError, z } from "zod";
import { hasOwn } from "../../utils/hasOwn";

const Heartbeat = z.object({
  Utc: z.string(),
});
export type Heartbeat = z.infer<typeof Heartbeat>;

const ExtrapolatedClock = z.object({
  Utc: z.string(),
  Remaining: z.string(),
  Extrapolating: z.boolean(),
});

const TopThreeLineSchema = z.object({
  Position: z.string(),
  ShowPosition: z.boolean(),
  RacingNumber: z.string(),
  Tla: z.string(),
  BroadcastName: z.string(),
  FullName: z.string(),
  Team: z.string(),
  TeamColour: z.string(),
  LapTime: z.string(),
  LapState: z.number(),
  DiffToAhead: z.string(),
  DiffToLeader: z.string(),
  OverallFastest: z.boolean(),
  PersonalFastest: z.boolean(),
});

const PersonalBestLapTimeSchema = z.object({
  Value: z.string().optional(),
  Lap: z.number().optional(),
  Position: z.number().optional(),
});

const BestSectorSchema = z.object({
  Value: z.string(),
  Position: z.number().optional(),
});

const TimingStatsLineBestSpeedsValueSchema = z.object({
  Value: z.string(),
  Position: z.number().optional(),
});

const StintSchema = z.object({
  LapFlags: z.number(),
  Compound: z.string(),
  New: z.string(),
  TyresNotChanged: z.string(),
  TotalLaps: z.number(),
  StartLaps: z.number(),
  LapTime: z.string().optional(),
  LapNumber: z.number().optional(),
});

const WeatherData = z.object({
  AirTemp: z.string(),
  Humidity: z.string(),
  Pressure: z.string(),
  Rainfall: z.coerce.number(),
  TrackTemp: z.string(),
  WindDirection: z.coerce.number(),
  WindSpeed: z.string(),
});

const TrackStatus = z.object({
  Status: z.string(),
  Message: z.string(),
});

const DriverListElementSchema = z.object({
  RacingNumber: z.string(),
  BroadcastName: z.string(),
  FullName: z.string(),
  Tla: z.string(),
  Line: z.number(),
  TeamName: z.string(),
  TeamColour: z.string(),
  FirstName: z.string(),
  LastName: z.string(),
  Reference: z.string(),
  HeadshotUrl: z.string().optional(),
  CountryCode: z.string().optional(),
  NameFormat: z.string().optional(),
});

const messageSchema = z.object({
  Utc: z.string(),
  Lap: z.number().optional(),
  Category: z.string(),
  Message: z.string(),
  Flag: z.string().optional(),
  Scope: z.string().optional(),
  Status: z.string().optional(),
  Sector: z.number().optional(),
  RacingNumber: z.string().optional(),
});

const countrySchema = z.object({
  Key: z.number(),
  Code: z.string(),
  Name: z.string(),
});

const circuitSchema = z.object({
  Key: z.number(),
  ShortName: z.string(),
});

const archiveStatusSchema = z.object({
  Status: z.string(),
});

const SerieSchema = z.object({
  Utc: z.string(),
  Lap: z.number().optional(),
});

const statusSerySchema = z.object({
  Utc: z.string(),
  TrackStatus: z.string().optional(),
  SessionStatus: z.string().optional(),
});

const LapCount = z.object({
  CurrentLap: z.number(),
  TotalLaps: z.number(),
});

const IntervalToPositionAheadSchema = z.object({
  Value: z.string(),
  Catching: z.boolean(),
});

const segmentSchema = z.object({
  Status: z.number(),
});

const TimingDataLineSpeedsValueSchema = z.object({
  Value: z.string(),
  Status: z.number(),
  OverallFastest: z.boolean(),
  PersonalFastest: z.boolean(),
});

const bestLapTimeSchema = z.object({
  Value: z.string().optional(),
  Lap: z.number().optional(),
});

const lastLapTimeSchema = z.object({
  Value: z.string(),
  Status: z.number(),
  OverallFastest: z.boolean(),
  PersonalFastest: z.boolean(),
});

const captureSchema = z.object({
  Utc: z.string(),
  RacingNumber: z.string(),
  Path: z.string(),
});

export const TopThree = z.object({
  Withheld: z.boolean(),
  Lines: z.array(TopThreeLineSchema),
});

const TimingStatsLineBestSpeedsSchema = z.object({
  I1: TimingStatsLineBestSpeedsValueSchema,
  I2: TimingStatsLineBestSpeedsValueSchema,
  FL: TimingStatsLineBestSpeedsValueSchema,
  ST: TimingStatsLineBestSpeedsValueSchema,
});

const TimingAppDataLineSchema = z.object({
  RacingNumber: z.string(),
  Line: z.number(),
  GridPos: z.string().optional(),
  Stints: z.array(StintSchema).optional(),
});

const DriverList = z
  .object({ _kf: z.boolean().optional() })
  .passthrough()
  .transform((z) => {
    delete z._kf;

    return z;
  })
  .pipe(z.record(DriverListElementSchema));

const RaceControlMessages = z.object({
  Messages: z.array(messageSchema),
});

const meetingSchema = z.object({
  Key: z.number(),
  Name: z.string(),
  OfficialName: z.string(),
  Location: z.string(),
  Country: countrySchema,
  Circuit: circuitSchema,
});

const SessionData = z.object({
  Series: z.array(SerieSchema),
  StatusSeries: z.array(statusSerySchema),
});

const sectorSchema = z.object({
  Stopped: z.boolean(),
  Value: z.string(),
  Status: z.number(),
  OverallFastest: z.boolean(),
  PersonalFastest: z.boolean(),
  Segments: z.array(segmentSchema).optional(),
  PreviousValue: z.string().optional(),
});

const TimingDataLineSpeedsSchema = z.object({
  I1: TimingDataLineSpeedsValueSchema,
  I2: TimingDataLineSpeedsValueSchema,
  FL: TimingDataLineSpeedsValueSchema,
  ST: TimingDataLineSpeedsValueSchema,
});

const TeamRadio = z.object({
  Captures: z.array(captureSchema),
});

const TimingAppDataLinesSchema = z.record(TimingAppDataLineSchema);

const SessionInfo = z.object({
  Meeting: meetingSchema,
  ArchiveStatus: archiveStatusSchema,
  Key: z.number(),
  Type: z.string(),
  Name: z.string(),
  StartDate: z.string(),
  EndDate: z.string(),
  GmtOffset: z.string(),
  Path: z.string(),
});

const TimingDataLineSchema = z.object({
  GapToLeader: z.string().optional(),
  IntervalToPositionAhead: IntervalToPositionAheadSchema.optional(),
  Line: z.number(),
  Position: z.string(),
  ShowPosition: z.boolean(),
  RacingNumber: z.string(),
  Retired: z.boolean(),
  InPit: z.boolean(),
  PitOut: z.boolean(),
  Stopped: z.boolean(),
  Status: z.number(),
  Sectors: z.array(sectorSchema),
  Speeds: TimingDataLineSpeedsSchema,
  BestLapTime: bestLapTimeSchema,
  LastLapTime: lastLapTimeSchema,
  NumberOfLaps: z.number().optional(),
  NumberOfPitStops: z.number().optional(),
});

const TimingStatsLineSchema = z.object({
  Line: z.number(),
  RacingNumber: z.string(),
  PersonalBestLapTime: PersonalBestLapTimeSchema,
  BestSectors: z.array(BestSectorSchema),
  BestSpeeds: TimingStatsLineBestSpeedsSchema,
});

const TimingStatsLinesSchema = z.record(TimingStatsLineSchema);

const TimingAppData = z.object({
  Lines: TimingAppDataLinesSchema,
});

const TimingDataLinesSchema = z.record(TimingDataLineSchema);

const TimingStats = z.object({
  Withheld: z.boolean(),
  Lines: TimingStatsLinesSchema,
  SessionType: z.string(),
});

const TimingData = z.object({
  Lines: TimingDataLinesSchema,
  Withheld: z.boolean(),
});

// const CardData = z.preprocess(decodeCompressedData, z.object({}).passthrough());
// const Position = z.preprocess(decodeCompressedData, z.object({}).passthrough());

export const CarDataEntryCar = z.object({
  Channels: z.object({
    0: z.number(),
    2: z.number(),
    3: z.number(),
    4: z.number(),
    5: z.number(),
    45: z.number(),
  }),
});
export type CarDataEntryCar = z.infer<typeof CarDataEntryCar>;

const CarDataEntry = z.object({
  Utc: z.string(),
  Cars: z.record(CarDataEntryCar),
});

const CarData = z.object({
  Entries: z.array(CarDataEntry),
});
const Position = z.object({}).passthrough();

export const TimingRoot = z.object({
  CarData: CarData,
  DriverList: DriverList,
  ExtrapolatedClock: ExtrapolatedClock,
  Heartbeat: Heartbeat,
  LapCount: LapCount.optional(), // o
  Position: Position,
  RaceControlMessages: RaceControlMessages,
  SessionData: SessionData,
  SessionInfo: SessionInfo,
  TeamRadio: TeamRadio.optional(), // o
  TimingAppData: TimingAppData,
  TimingData: TimingData,
  TimingStats: TimingStats,
  TopThree: TopThree.optional(), // o
  TrackStatus: TrackStatus,
  WeatherData: WeatherData,
});
export type TimingRoot = z.infer<typeof TimingRoot>;

export const HeartbeatTimingRoot = z.object({
  Heartbeat: Heartbeat,
});
export type HeartbeatTimingRoot = z.infer<typeof HeartbeatTimingRoot>;

export const TimingMessage = z.object({
  A: z.tuple([z.string(), z.any(), z.string()]),
});

export const RecapTimingResponse = z.object({
  R: z.object({}).passthrough(),
});
export type RecapTimingResponse = z.infer<typeof RecapTimingResponse>;

export const EmptyTimingResponse = z.object({}).strict();
export type EmptyTimingResponse = z.infer<typeof EmptyTimingResponse>;

export const MessageTimingResponse = z.object({
  M: z.array(TimingMessage),
  // M: z.union([TimingMessage, z.array(TimingMessage)]),
});
export type MessageTimingResponse = z.infer<typeof MessageTimingResponse>;

export type TimingResponse = RecapTimingResponse | MessageTimingResponse | EmptyTimingResponse;

export function isMessageTimingResponse(data: TimingResponse): data is MessageTimingResponse {
  return hasOwn(data, "M") && data.M != null;
}

export function isRecapTimingResponse(data: TimingResponse): data is RecapTimingResponse {
  return hasOwn(data, "R") && data.R != null;
}

export const parseTimingData = (
  data: unknown,
):
  | z.SafeParseSuccess<TimingResponse>
  | { success: false; error: [ZodError<unknown>, ZodError<unknown>, ZodError<unknown>] } => {
  const messageTimingResponse = MessageTimingResponse.safeParse(data);
  const recapTimingResponse = RecapTimingResponse.safeParse(data);
  const emptyTimingResponse = EmptyTimingResponse.safeParse(data);

  if (messageTimingResponse.success) {
    return messageTimingResponse;
  } else if (recapTimingResponse.success) {
    return recapTimingResponse;
  } else if (emptyTimingResponse.success) {
    return emptyTimingResponse;
  } else {
    return {
      success: false,
      error: [recapTimingResponse.error, messageTimingResponse.error, emptyTimingResponse.error],
    };
  }
};
