import shaka from "shaka-player";

export interface VideoPlayerRef {
  player: shaka.Player;
  video: HTMLVideoElement;
}

export interface TextTrackInfo {
  id: string;
  lang: string;
  label: string;
}

export interface AudioTrackInfo {
  id: string;
  lang: string;
}

export interface VideoPlayerOptions {
  noBufferUI?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  audioLanguage?: string[];
}
