import { VideoPlayerRef } from "../VideoPlayer/VideoPlayer.types";
import { SyncStateSnapshot } from "../../views/Viewer/hooks/useSyncVideos";
import { ManifestOffsets } from "../../hooks/useManifestOffsets/useManifestOffsets";

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
  manifestOffsetMs: number | null;
  presentationStartTime: string | null;
}

export interface SyncDebugSnapshot {
  windows: WindowDebugInfo[];
}

let syncStateRef: { current: SyncStateSnapshot } | null = null;
let playerRefMapRef: { current: Record<string, VideoPlayerRef | null> } | null = null;
let manifestOffsetsRef: { current: ManifestOffsets } | null = null;
let presentationStartTimesRef: { current: Record<string, number> } | null = null;

export function registerSyncDebugSources(
  syncState: { current: SyncStateSnapshot },
  playerRefMap: { current: Record<string, VideoPlayerRef | null> },
  manifestOffsets?: { current: ManifestOffsets },
  presentationStartTimes?: { current: Record<string, number> },
) {
  syncStateRef = syncState;
  playerRefMapRef = playerRefMap;
  manifestOffsetsRef = manifestOffsets ?? null;
  presentationStartTimesRef = presentationStartTimes ?? null;
}

export function unregisterSyncDebugSources() {
  syncStateRef = null;
  playerRefMapRef = null;
  manifestOffsetsRef = null;
  presentationStartTimesRef = null;
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

    const manifestOffset = manifestOffsetsRef?.current[windowId];
    const presentationStartTime = presentationStartTimesRef?.current[windowId];

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
      manifestOffsetMs: manifestOffset != null ? Math.round(manifestOffset * 1000) : null,
      presentationStartTime: presentationStartTime != null ? new Date(presentationStartTime).toISOString() : null,
    });
  }

  return { windows };
}
