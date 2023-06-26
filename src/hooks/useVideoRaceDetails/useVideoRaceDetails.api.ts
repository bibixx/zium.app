import { z } from "zod";
import { fetchJSON } from "../../utils/api";
import { validateArray } from "../../utils/validators";
import { StreamDataDTO } from "./useVideoRaceDetails.types";
import {
  streamDataValidator,
  videoRaceStreamsContainerValidator,
  videoRaceStreamsRootBodyValidator,
} from "./useVideoRaceDetails.validator";

export const fetchRaceStreams = async (raceId: string, signal: AbortSignal) => {
  const url = `/3.0/R/ENG/BIG_SCREEN_HLS/ALL/CONTENT/VIDEO/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);
  const parsedBody = videoRaceStreamsRootBodyValidator.parse(body);

  const [container] = parsedBody.resultObj.containers.reduce(
    validateArray(videoRaceStreamsContainerValidator),
    [] as z.output<typeof videoRaceStreamsContainerValidator>[],
  );

  const streams: StreamDataDTO[] | undefined = container.metadata.additionalStreams?.reduce(
    validateArray(streamDataValidator),
    [] as z.output<typeof streamDataValidator>[],
  );
  const season = container.metadata.season;
  const isLive = container.metadata.contentSubtype === "LIVE";
  const countryName = container.metadata.emfAttributes.Meeting_Country_Name;
  const countryId = container.metadata.emfAttributes.MeetingCountryKey;
  const title = container.metadata.titleBrief;
  const playbackOffsets = container.playbackOffsets;
  const meetingKey = container.metadata.meetingKey;
  const meetingSessionKey = container.metadata.emfAttributes.MeetingSessionKey;
  const genre = container.metadata.genres[0];

  return {
    streams,
    season,
    isLive,
    countryName,
    countryId,
    title,
    playbackOffsets,
    meetingKey,
    meetingSessionKey,
    genre,
  };
};
