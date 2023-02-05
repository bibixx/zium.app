import { VideoJsPlayer } from "video.js";

export interface VideoWindowProps {
  executeOnAll: (cb: (player: VideoJsPlayer) => void, callerId: string) => void;
}
