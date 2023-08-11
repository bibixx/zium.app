import { AudioGroupEntry, SubtitlesGroupEntry } from "./useInternationalStreamMedia.validator";

export type VideoStreamMedia = {
  AUDIO: AudioGroupEntry[];
  SUBTITLES: SubtitlesGroupEntry[];
};
