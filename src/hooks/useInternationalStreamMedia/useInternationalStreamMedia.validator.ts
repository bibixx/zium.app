import { z } from "zod";
import { safeJSONParse } from "../../utils/safeJSONParse";

const yesNoBoolean = z.union([z.literal("YES"), z.literal("NO")]).transform((arg) => arg === "YES");
const quotedString = z
  .string()
  .transform((val) => safeJSONParse(val))
  .pipe(z.string());

export const audioGroupEntryValidator = z.object({
  AUTOSELECT: yesNoBoolean,
  DEFAULT: yesNoBoolean,
  TYPE: z.literal("AUDIO"),
  CHANNELS: quotedString,
  "GROUP-ID": quotedString,
  LANGUAGE: quotedString,
  NAME: quotedString,
  URI: quotedString,
});

export type AudioGroupEntry = z.output<typeof audioGroupEntryValidator>;

export const subtitlesGroupEntryValidator = z.object({
  TYPE: z.literal("SUBTITLES"),
  DEFAULT: yesNoBoolean,
  FORCED: yesNoBoolean,
  "GROUP-ID": quotedString,
  LANGUAGE: quotedString,
  NAME: quotedString,
  URI: quotedString,
});

export type SubtitlesGroupEntry = z.output<typeof subtitlesGroupEntryValidator>;

export const groupEntryValidator = z.discriminatedUnion("TYPE", [
  audioGroupEntryValidator,
  subtitlesGroupEntryValidator,
]);
export type GroupEntry = z.output<typeof groupEntryValidator>;
