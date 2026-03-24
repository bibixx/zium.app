import { memo, useCallback } from "react";
import { ClockIcon } from "@heroicons/react/20/solid";
import { VideoPlayerRef } from "../../VideoPlayer/VideoPlayer.types";
import { LiveTimingGridWindow } from "../../../types/GridWindow";
import { EventGenre } from "../../../constants/races";
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { useLiveTimingSession } from "../../../hooks/useLiveTimingSession/useLiveTimingSession";
import { useLiveTimingData } from "../../../hooks/useLiveTimingData/useLiveTimingData";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import {
  VideoWindowButtonsClose,
  VideoWindowButtonsOffset,
  VideoWindowButtonsTopLeftWrapper,
  VideoWindowButtonsTopRightWrapper,
} from "../VideoWindowButtons/VideoWindowButtons";
import { SourceButton } from "../../SourceButton/SourceButton";
import { useReactiveUserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import { GridLayoutFillMode } from "../../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { TimingSnapshot } from "../../../hooks/useLiveTimingData/useLiveTimingData.types";
import styles from "./LiveTimingWindow.module.scss";

interface LiveTimingWindowProps {
  gridWindow: LiveTimingGridWindow;
  onSourceChange: (windowId: string, data: ChosenValueType) => void;
  onDelete: (windowId: string) => void;
  fillMode: GridLayoutFillMode;
  updateFillMode: (windowId: string, fillMode: GridLayoutFillMode) => void;
  mainVideoPlayer: VideoPlayerRef | null;
  season: number;
  raceStartDate: Date;
  genre: EventGenre;
  isLive: boolean;
}

export const LiveTimingWindow = memo(
  ({
    gridWindow,
    onSourceChange,
    onDelete,
    mainVideoPlayer,
    season,
    raceStartDate,
    genre,
    isLive,
  }: LiveTimingWindowProps) => {
    const sessionState = useLiveTimingSession(season, raceStartDate, genre);
    const sessionPath = sessionState.state === "done" ? sessionState.data.path : null;
    const { updateOffset } = useUserOffsets();
    const offsets = useReactiveUserOffsets();
    const currentOffset = offsets?.additionalStreams["live-timing"] ?? 0;
    const timingState = useLiveTimingData(sessionPath, isLive, mainVideoPlayer, currentOffset);

    const onOffsetChange = useCallback(
      (value: number) => {
        updateOffset("live-timing", value);
      },
      [updateOffset],
    );

    const { requestStream } = useStreamPicker();
    const onRequestSourceChange = async () => {
      const chosenData = await requestStream(["drivers", "data"], ["live-timing"]);

      if (chosenData == null) {
        return;
      }

      onSourceChange(gridWindow.id, chosenData);
    };

    return (
      <VideoWindowWrapper className={styles.liveTimingWindow}>
        <VideoWindowButtonsTopLeftWrapper>
          <SourceButton onClick={onRequestSourceChange} label="Live Timing" icon={ClockIcon} hideWhenUiHidden />
          <VideoWindowButtonsOffset onOffsetChange={onOffsetChange} currentOffset={currentOffset} />
        </VideoWindowButtonsTopLeftWrapper>
        <VideoWindowButtonsTopRightWrapper>
          <VideoWindowButtonsClose onClose={() => onDelete(gridWindow.id)} />
        </VideoWindowButtonsTopRightWrapper>
        <div className={styles.content}>
          {sessionState.state === "loading" && <div className={styles.message}>Matching session…</div>}
          {sessionState.state === "error" && (
            <div className={styles.message}>
              {sessionState.error instanceof Error ? sessionState.error.message : "Failed to match session"}
            </div>
          )}
          {timingState.state === "loading" && sessionState.state === "done" && (
            <div className={styles.message}>Loading timing data…</div>
          )}
          {timingState.state === "error" && (
            <div className={styles.message}>
              {timingState.error instanceof Error ? timingState.error.message : "Failed to load timing data"}
            </div>
          )}
          {timingState.state === "done" && <TimingTower snapshot={timingState.data} />}
        </div>
      </VideoWindowWrapper>
    );
  },
);

interface TimingTowerProps {
  snapshot: TimingSnapshot;
}

const TIRE_COLORS: Record<string, string> = {
  SOFT: "#ff3333",
  MEDIUM: "#ffd700",
  HARD: "#f0f0f0",
  INTERMEDIATE: "#3d9b35",
  WET: "#2b6de6",
};

const ROW_HEIGHT = 24;

const TimingTower = ({ snapshot }: TimingTowerProps) => {
  return (
    <div className={styles.tower}>
      {snapshot.lapCount && (
        <div className={styles.header}>
          <span>Lap {snapshot.lapCount.currentLap}</span>
          {snapshot.lapCount.totalLaps > 0 && <span> / {snapshot.lapCount.totalLaps}</span>}
        </div>
      )}
      <div className={styles.rows} style={{ height: snapshot.drivers.length * ROW_HEIGHT }}>
        {snapshot.drivers.map((driver, index) => (
          <div
            key={driver.racingNumber}
            className={styles.row}
            style={
              {
                "--team-color": `#${driver.teamColor}`,
                transform: `translateY(${index * ROW_HEIGHT}px)`,
              } as React.CSSProperties
            }
          >
            <span className={styles.position}>{driver.position}</span>
            <span className={styles.number}>{driver.racingNumber}</span>
            <span className={styles.tla}>{driver.tla}</span>
            <span className={styles.gap}>
              {driver.position === 1 ? "" : driver.intervalToPositionAhead || driver.gapToLeader}
            </span>
            {driver.tire && (
              <span
                className={styles.tire}
                style={{ "--tire-color": TIRE_COLORS[driver.tire] ?? "#999" } as React.CSSProperties}
              >
                {driver.tire.charAt(0)}
              </span>
            )}
            <span
              className={styles.lapTime}
              data-personal-best={driver.lastLapTimePersonalBest || undefined}
              data-overall-best={driver.lastLapTimeOverallBest || undefined}
            >
              {driver.lastLapTime}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
