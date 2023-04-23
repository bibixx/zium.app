import { fetchJSON } from "../../utils/api";
import {
  F1PlaybackOffsetsApiResponse,
  MultiViewerSyncOffsetsResponse,
  StreamDataDTO,
} from "./useVideoRaceDetails.types";

export const fetchRaceStreams = async (raceId: string, signal: AbortSignal) => {
  const url = `/3.0/R/ENG/BIG_SCREEN_HLS/ALL/CONTENT/VIDEO/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const container = body.resultObj.containers[0];
  const streams = container.metadata.additionalStreams as StreamDataDTO[];
  const season = container.metadata.season;
  const isLive = container.metadata.contentSubtype === "LIVE";
  const countryName = container.metadata.emfAttributes.Meeting_Country_Name;
  const countryId = container.metadata.emfAttributes.MeetingCountryKey;
  const title = container.metadata.shortDescription;
  const playbackOffsets = container.playbackOffsets as F1PlaybackOffsetsApiResponse[];
  const meetingKey = container.metadata.meetingKey as string;
  const meetingSessionKey = container.metadata.emfAttributes.MeetingSessionKey as string;

  return { streams, season, isLive, countryName, countryId, title, playbackOffsets, meetingKey, meetingSessionKey };
};

export const fetchMultiViewerOffsets = async (meetingKey: string, meetingSessionKey: string, signal: AbortSignal) => {
  try {
    const url = `https://api.multiviewer.dev/api/v1/meetings/${meetingKey}/sessions/${meetingSessionKey}`;
    const body = await fetch(url, { signal }).then((res) => res.json());

    return (body?.sync_offsets?.sync_offsets ?? null) as MultiViewerSyncOffsetsResponse[] | null;
  } catch (error) {
    console.error("fetchMultiViewerOffsets", error);

    return undefined;
  }
};
