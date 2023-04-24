import { PlayerAPI } from "bitmovin-player";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { RaceInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { useViewerUIVisibility } from "../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { GridWindow } from "../../types/GridWindow";
import { Dimensions } from "../../types/Dimensions";
import { PlayerControls } from "./PlayerControls/PlayerControls";
import styles from "./Player.module.scss";
import { PlayerRaceInfo } from "./PlayerRaceInfo/PlayerRaceInfo";
import { LayoutButtons } from "./LayoutButtons/LayoutButtons";

const PLAYER_COLLAPSED_CLOSED_TIMEOUT = 2_000;

interface PlayerProps {
  player: PlayerAPI | null;
  raceInfo: RaceInfo;
  volume: number;
  setVolume: (newVolume: number) => void;
  isMuted: boolean;
  setIsMuted: (newIsMuted: boolean) => void;
  usedWindows: string[];
  createWindow: (newWindow: GridWindow, dimensions: Dimensions) => void;
}
export const Player = ({
  player,
  raceInfo,
  setVolume,
  volume,
  isMuted,
  setIsMuted,
  usedWindows,
  createWindow,
}: PlayerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isUIVisible } = useViewerUIVisibility();
  const timeoutRef = useRef(-1);

  useEffect(() => {
    if (isUIVisible) {
      clearTimeout(timeoutRef.current);
    } else {
      if (wrapperRef.current?.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
        document.activeElement?.blur();
      }

      timeoutRef.current = setTimeout(() => {
        setIsCollapsed(false);
      }, PLAYER_COLLAPSED_CLOSED_TIMEOUT);
    }
  }, [isUIVisible]);

  return (
    <FocusTrap
      focusTrapOptions={{
        allowOutsideClick: true,
        clickOutsideDeactivates: false,
        initialFocus: false,
      }}
    >
      <div
        className={classNames(styles.wrapper, { [styles.isCollapsed]: isCollapsed, [styles.isVisible]: isUIVisible })}
        ref={wrapperRef}
      >
        {isCollapsed && <div className={styles.collapsedClickArea} onClick={() => setIsCollapsed(false)} />}
        <div className={styles.section}>
          <PlayerRaceInfo raceInfo={raceInfo} />
        </div>
        <div className={classNames(styles.section, styles.middle)}>
          <PlayerControls
            player={player}
            toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            setVolume={setVolume}
            volume={volume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        </div>
        <div className={styles.section}>
          <LayoutButtons usedWindows={usedWindows} createWindow={createWindow} />
        </div>
      </div>
    </FocusTrap>
  );
};
