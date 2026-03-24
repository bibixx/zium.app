import { VideoPlayerRef } from "../VideoPlayer/VideoPlayer.types";
import { SyncStateSnapshot } from "../../views/Viewer/hooks/useSyncVideos";

export interface WindowDebugInfo {
  windowId: string;
  driftMs: number;
  playbackRate: number;
  resolution: string;
  droppedFrames: number;
  decodedFrames: number;
  bufferFullness: number;
  estimatedBandwidth: number;
  liveLatency: number;
}

export interface SyncDebugSnapshot {
  windows: WindowDebugInfo[];
}

let syncStateRef: { current: SyncStateSnapshot } | null = null;
let playerRefMapRef: { current: Record<string, VideoPlayerRef | null> } | null = null;

export function registerSyncDebugSources(
  syncState: { current: SyncStateSnapshot },
  playerRefMap: { current: Record<string, VideoPlayerRef | null> },
) {
  syncStateRef = syncState;
  playerRefMapRef = playerRefMap;
}

export function unregisterSyncDebugSources() {
  syncStateRef = null;
  playerRefMapRef = null;
}

export function getSyncDebugSnapshot(): SyncDebugSnapshot | null {
  if (syncStateRef == null || playerRefMapRef == null) return null;

  const windows: WindowDebugInfo[] = [];

  for (const [windowId, playerRef] of Object.entries(playerRefMapRef.current)) {
    if (playerRef == null) continue;

    const { player, video } = playerRef;
    const stats = player.getStats();
    const syncState = syncStateRef.current.find((s) => s.windowId === windowId);

    const buffered = video.buffered;
    const bufferEnd = buffered.length > 0 ? buffered.end(buffered.length - 1) : 0;
    const bufferFullness = bufferEnd - video.currentTime;

    windows.push({
      windowId,
      driftMs: syncState?.driftMs ?? 0,
      playbackRate: syncState?.playbackRate ?? video.playbackRate,
      resolution: `${stats.width}x${stats.height}`,
      droppedFrames: stats.droppedFrames,
      decodedFrames: stats.decodedFrames,
      bufferFullness: Math.round(bufferFullness * 10) / 10,
      estimatedBandwidth: Math.round(stats.estimatedBandwidth / 1000),
      liveLatency: Math.round((stats.liveLatency ?? 0) * 10) / 10,
    });
  }

  return { windows };
}
