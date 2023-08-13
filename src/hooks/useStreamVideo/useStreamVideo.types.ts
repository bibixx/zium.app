import { Response, ResponseAction } from "../../types/Response";
import { VideoStreamInfo } from "./useStreamVideo.api";

export type StreamVideoState = Response<VideoStreamInfo>;

export type StreamVideoStateAction = ResponseAction<VideoStreamInfo>;
