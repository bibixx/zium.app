import { VideoStreamInfo } from "./useStreamVideo.api";

export type StreamVideoState =
  | { state: "loading"; data: null }
  | { state: "error"; data: null; error: Error }
  | { state: "done"; data: VideoStreamInfo };

export type StreamVideoStateAction =
  | { type: "load" }
  | { type: "error"; error: Error }
  | { type: "done"; data: VideoStreamInfo };
