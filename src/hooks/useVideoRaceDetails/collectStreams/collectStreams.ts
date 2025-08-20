import { assertNever } from "../../../utils/assertNever";
import { StreamData } from "../useVideoRaceDetails.validator";
import { collectStreams as collectStreamsNew } from "./collectStreams.new";
import { collectStreams as collectStreamsOld } from "./collectStreams.old";

export const collectStreams = async (streams: StreamData[] | undefined, raceId: string, signal: AbortSignal) => {
  const result = await collectStreamsNew(streams, raceId, signal);
  if (result.state === "success") {
    return result.data;
  }

  if (result.error === "NOT_SUPPORTED") {
    return collectStreamsOld(streams, raceId);
  }

  return assertNever(result.error);
};
