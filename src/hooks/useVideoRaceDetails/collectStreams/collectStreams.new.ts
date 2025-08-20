import { Result } from "../../../types/Result";
import { addQueryParams } from "../../../utils/addQueryParams";
import { fetchJSON } from "../../../utils/api";
import { assertNever } from "../../../utils/assertNever";
import { safeURLParse } from "../../../utils/safeURLParse";
import { MainStreamInfo, DataStreamInfo, DriverStreamInfo, BaseStreamInfo } from "../useVideoRaceDetails.types";
import { mapStreamIdentifierToType } from "../useVideoRaceDetails.utils";
import {
  tmeManifestValidator,
  StreamData,
  contentPlayValidator,
  DriverStreamData,
} from "../useVideoRaceDetails.validator";
import { CollectedStreams, getStreamPrettyName } from "./collectStreams.utils";

type TMEStreamUrls = Partial<Record<number, string>>;
const collectTMEStreamUrls = async (
  tmeUrl: string,
  entitlementToken: string,
  signal: AbortSignal,
): Promise<Result<TMEStreamUrls, "NOT_SUPPORTED">> => {
  const tme = await fetchJSON(tmeUrl, { headers: { entitlementToken } }, signal);
  const parsedTme = tmeManifestValidator.safeParse(tme);
  if (!parsedTme.success) {
    return Result.failure("NOT_SUPPORTED");
  }

  const streams: Partial<Record<number, string>> = {};

  for (const feed of parsedTme.data.feeds) {
    streams[feed.metadata.channel_id] = feed.url;
  }

  return Result.success(streams);
};

function getPlaybackUrl(stream: StreamData, tmeStreams: Partial<Record<number, string>>) {
  const tmeStreamUrl = tmeStreams[stream.channelId];
  if (tmeStreamUrl != null) {
    return { url: tmeStreamUrl, needsFetching: false };
  }

  const baseUrl = "/2.0/R/ENG/WEB_HLS/ALL";
  const finalUrl = addQueryParams(`${baseUrl}/${stream.playbackUrl}`, {
    player: "player_tm",
  });
  return { url: finalUrl.toString(), needsFetching: true };
}

export const collectStreams = async (
  streams: StreamData[] | undefined,
  raceId: string,
  signal: AbortSignal,
): Promise<Result<CollectedStreams, "NOT_SUPPORTED">> => {
  const pcu = `/2.0/R/ENG/WEB_HLS/ALL/CONTENT/PLAY?channelId=1033&contentId=${raceId}&player=player_tm`;
  const playContent = await fetchJSON(pcu, undefined, signal);

  const parsedPlayContent = contentPlayValidator.safeParse(playContent);
  let tmeStreams: TMEStreamUrls = {};

  if (parsedPlayContent.success) {
    const resultObj = parsedPlayContent.data.resultObj;
    const tmeUrl = safeURLParse(resultObj.url);

    if (tmeUrl == null) {
      return Result.failure("NOT_SUPPORTED");
    }

    if (!tmeUrl.pathname.endsWith(".tme")) {
      return Result.failure("NOT_SUPPORTED");
    }

    const collectedStreamsResult = await collectTMEStreamUrls(resultObj.url, resultObj.entitlementToken, signal);
    if (collectedStreamsResult.state === "failure") {
      return Result.failure("NOT_SUPPORTED");
    }

    tmeStreams = collectedStreamsResult.data;
  }

  const defaultStreams: MainStreamInfo[] = [];
  let driverTrackerStream: DataStreamInfo | null = null;
  let dataChannelStream: DataStreamInfo | null = null;
  const driverStreams: DriverStreamInfo[] = [];

  if (streams == null) {
    const defaultStream: MainStreamInfo = {
      type: "f1live",
      channelId: 0,
      playbackUrl: { url: `CONTENT/PLAY?contentId=${raceId}`, needsFetching: true },
      title: getStreamPrettyName("F1 LIVE"),
      identifier: "main",
    };

    return Result.success({
      defaultStreams: [defaultStream],
      driverStreams,
      driverTrackerStream,
      dataChannelStream,
    });
  }

  for (const stream of streams) {
    const streamType = mapStreamIdentifierToType(stream.identifier);
    const playbackUrl = getPlaybackUrl(stream, tmeStreams);

    const baseStreamInfo: BaseStreamInfo = {
      channelId: stream.channelId,
      playbackUrl,
      title: getStreamPrettyName(stream.title),
      identifier: stream.identifier,
    };

    if (streamType === null) {
      continue;
    }

    if (streamType === "f1live") {
      defaultStreams.push({
        type: streamType,
        ...baseStreamInfo,
      });
      continue;
    }

    if (streamType === "international") {
      defaultStreams.push({
        type: streamType,
        ...baseStreamInfo,
      });
      continue;
    }

    if (streamType === "data-channel") {
      dataChannelStream = {
        type: streamType,
        ...baseStreamInfo,
      };
      continue;
    }

    if (streamType === "driver-tracker") {
      driverTrackerStream = {
        type: streamType,
        ...baseStreamInfo,
      };
      continue;
    }

    if (streamType === "driver") {
      const driverStream = stream as DriverStreamData;

      const driverStreamInfo: DriverStreamInfo = {
        ...baseStreamInfo,
        type: "driver",
        racingNumber: driverStream.racingNumber,
        title: driverStream.title,
        reportingName: driverStream.reportingName,
        driverFirstName: driverStream.driverFirstName,
        driverLastName: driverStream.driverLastName,
        teamName: driverStream.teamName,
        constructorName: driverStream.constructorName,
        hex: driverStream.hex,
      };

      driverStreams.push(driverStreamInfo);
      continue;
    }

    assertNever(streamType);
  }

  return Result.success({
    defaultStreams,
    driverStreams,
    driverTrackerStream,
    dataChannelStream,
  });
};
