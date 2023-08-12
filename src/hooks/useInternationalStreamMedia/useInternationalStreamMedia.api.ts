import { mapAndStripNullable } from "../../utils/mapAndStrip";
import { VideoStreamMedia } from "./useInternationalStreamMedia.types";
import { groupEntryValidator } from "./useInternationalStreamMedia.validator";

export const fetchManifest = async (videoUrl: string, signal: AbortSignal) => {
  const manifestString = await fetch(videoUrl, { signal }).then((res) => res.text());

  const media: VideoStreamMedia = {
    AUDIO: [],
    SUBTITLES: [],
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
    } else if (parsedData.TYPE === "SUBTITLES") {
      const type = parsedData.TYPE;
      media[type].push(parsedData);
    }
  });

  return media;
};
