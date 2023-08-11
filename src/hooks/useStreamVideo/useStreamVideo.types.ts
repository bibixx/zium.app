import { Response } from "../../types/Response";
import { VideoStreamInfo } from "./useStreamVideo.api";

export type StreamVideoState = Response<VideoStreamInfo>;

export type StreamVideoStateAction =
  | { type: "load" }
  | { type: "error"; error: Error }
  | { type: "done"; data: VideoStreamInfo };
