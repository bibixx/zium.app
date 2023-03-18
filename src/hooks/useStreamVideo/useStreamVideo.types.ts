import { VideoStreamInfo } from "./useStreamVideo.api";

export type StreamVideoState =
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "done"; data: VideoStreamInfo };

export type StreamVideoStateAction =
  | { type: "load" }
  | { type: "error"; error: string }
  | { type: "done"; data: VideoStreamInfo };
