import { parse as parseMPDManifestString } from "mpd-parser";
import { mapAndStripNullable } from "../../utils/mapAndStrip";
import { captureWarning } from "../../utils/captureWarning";
import { VideoStreamMedia } from "./useInternationalStreamMedia.types";
import { groupEntryValidator } from "./useInternationalStreamMedia.validator";
import { MPDParserErrorTypes } from "./useInternationalStreamMedia.constants";

const parseM3U8 = (manifestString: string) => {
  const media: VideoStreamMedia = {
    AUDIO: [],
  };

  const manifestData = manifestString.split("\n");

  manifestData.forEach((line) => {
    if (!line.startsWith("#EXT-X-MEDIA")) {
      return;
    }

    const [, dataString] = line.split(":");
    if (dataString == null) {
      return;
    }

    const parts = dataString.split(",");
    const dataParts = mapAndStripNullable(parts, (part) => {
      const parts = part.split("=");

      return parts.length !== 2 ? null : (parts as [string, string]);
    });

    const data = Object.fromEntries(dataParts);
    const parsedDataResult = groupEntryValidator.safeParse(data);

    if (!parsedDataResult.success) {
      return;
    }
    const { data: parsedData } = parsedDataResult;

    const type = parsedData.TYPE;
    const groupId = parsedData["GROUP-ID"];

    if (typeof type !== "string" || typeof groupId !== "string") {
      return;
    }

    if (parsedData.TYPE === "AUDIO") {
      const type = parsedData.TYPE;
      media[type].push(parsedData);
    }
  });

  return media;
};

const parseMPD = (manifestString: string, manifestUri: string): VideoStreamMedia | null => {
  try {
    const media: VideoStreamMedia = {
      AUDIO: [],
    };

    const parsedManifest = parseMPDManifestString(manifestString, { manifestUri });
    const audioGroupEntries = Object.entries(parsedManifest.mediaGroups.AUDIO.audio);
    audioGroupEntries.forEach(([audioGroupId, audioGroup]) => {
      media.AUDIO.push({
        AUTOSELECT: audioGroup.autoselect,
        DEFAULT: audioGroup.default,
        TYPE: "AUDIO",
        "GROUP-ID": audioGroupId,
        LANGUAGE: audioGroup.language,
        NAME: audioGroupId,
        URI: audioGroup.uri,
      });
    });

    return media;
  } catch (error) {
    if (error instanceof Error && MPDParserErrorTypes.includes(error.message)) {
      captureWarning("Failed to parse MPD manifest", { error });
      return null;
    }

    throw error;
  }
};

export const fetchManifest = async (manifestUri: string, signal: AbortSignal): Promise<VideoStreamMedia | null> => {
  const manifestString = await fetch(manifestUri, { signal }).then((res) => res.text());
  const manifestURL = new URL(manifestUri);
  const pathname = manifestURL.pathname;

  if (pathname.endsWith(".m3u8")) {
    return parseM3U8(manifestString);
  }

  if (pathname.endsWith(".mpd")) {
    return parseMPD(manifestString, manifestUri);
  }

  captureWarning("Unknown manifest extension", { manifestUri });
  return null;
};
