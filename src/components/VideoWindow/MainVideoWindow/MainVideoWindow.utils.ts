import { AudioTrack, SubtitleTrack } from "bitmovin-player";

export const getTrackPrettyName = (subtitleTrack: SubtitleTrack | AudioTrack) => {
  if (subtitleTrack.lang === "eng") {
    return "English";
  }

  if (subtitleTrack.lang === "fra") {
    return "Français";
  }

  if (subtitleTrack.lang === "deu") {
    return "Deutsch";
  }

  if (subtitleTrack.lang === "spa") {
    return "Español";
  }

  if (subtitleTrack.lang === "por") {
    return "Português";
  }

  if (subtitleTrack.lang === "nld") {
    return "Nederlands";
  }

  if (subtitleTrack.lang === "fx") {
    return "FX";
  }

  return subtitleTrack.label;
};
