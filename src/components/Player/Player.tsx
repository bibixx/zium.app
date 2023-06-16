import { PlayerAPI } from "bitmovin-player";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { RaceInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { useViewerUIVisibility } from "../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { GridWindow } from "../../types/GridWindow";
import { Dimensions } from "../../types/Dimensions";
import { DoubleEllipsisIcon } from "../CustomIcons/CustomIcons";
import { WindowGridState } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { PlayerControls } from "./PlayerControls/PlayerControls";
import styles from "./Player.module.scss";
import { PlayerRaceInfo } from "./PlayerRaceInfo/PlayerRaceInfo";
import { LayoutButtons } from "./LayoutButtons/LayoutButtons";
import { usePlayerDrag } from "./hooks/usePlayerDrag";
import { PLAYER_COLLAPSED_ZONE_WHEN_COLLAPSED, PLAYER_COLLAPSED_ZONE_WHEN_OPEN } from "./Player.constants";

interface PlayerProps {
  player: PlayerAPI | null;
  raceInfo: RaceInfo;
  volume: number;
  setVolume: (newVolume: number) => void;
  isMuted: boolean;
  setIsMuted: (newIsMuted: boolean) => void;
  usedWindows: string[];
  createWindow: (newWindow: GridWindow, dimensions: Dimensions) => void;
  loadLayout: (selectedLayoutIndex: number) => void;
  duplicateLayout: (layoutIndex: number, name: string) => void;
  renameLayout: (layoutIndex: number, name: string) => void;
  deleteLayout: (layoutIndex: number) => void;
  viewerState: WindowGridState;
  isPaused: boolean;
  hasOnlyOneStream: boolean;
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
  loadLayout,
  duplicateLayout,
  renameLayout,
  deleteLayout,
  viewerState,
  isPaused,
  hasOnlyOneStream,
}: PlayerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isUIVisible, preventHiding } = useViewerUIVisibility();
  const timeoutRef = useRef(-1);
  const [isSpringing, setIsSpringing] = useState(false);

  useEffect(() => {
    if (isUIVisible) {
      clearTimeout(timeoutRef.current);
    } else {
      if (wrapperRef.current?.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
        document.activeElement?.blur();
      }
    }
  }, [isUIVisible]);

  const onDragEnd = useCallback((shouldBeCollapsed: boolean) => {
    setIsSpringing(true);
    setIsCollapsed(shouldBeCollapsed);
  }, []);

  const onClick = useCallback(() => {
    setIsCollapsed((oldIsCollapsed) => !oldIsCollapsed);
  }, []);

  const { isDragging, onMouseDown, isMouseDown } = usePlayerDrag({
    elementRef: wrapperRef,
    onClick,
    onDragEnd,
    playerCollapsedZone: isCollapsed ? PLAYER_COLLAPSED_ZONE_WHEN_COLLAPSED : PLAYER_COLLAPSED_ZONE_WHEN_OPEN,
  });

  useEffect(() => {
    preventHiding(isPaused || isDragging);
  }, [isPaused, preventHiding, isDragging]);

  return (
    <>
      {isDragging && <div className={styles.grabbingWrapper} />}
      <FocusTrap
        focusTrapOptions={{
          allowOutsideClick: true,
          clickOutsideDeactivates: false,
          initialFocus: false,
        }}
      >
        <div
          onMouseEnter={() => preventHiding(true)}
          onMouseLeave={() => preventHiding(isPaused || isDragging)}
          className={classNames(styles.wrapper, {
            [styles.isCollapsed]: isCollapsed,
            [styles.isVisible]: isUIVisible,
            [styles.wrapperIsDragging]: isDragging,
            [styles.isSpringing]: isSpringing,
          })}
          ref={wrapperRef}
          onTransitionEnd={(e) => {
            if (e.propertyName === "transform" && isSpringing) {
              setIsSpringing(false);
            }
          }}
        >
          <div className={styles.dragHandlePlaceholder} />
          <button
            className={classNames(styles.dragHandle, { [styles.dragHandleIsDragging]: isDragging || isMouseDown })}
            onMouseDown={onMouseDown}
            onClick={(e) => {
              const isClickByKeyboard = e.detail === 0;
              if (isClickByKeyboard) {
                onClick();
              }
            }}
          >
            <DoubleEllipsisIcon width={20} height={20} />
          </button>

          <div
            className={styles.content}
            ref={(node) => (!isCollapsed ? node?.removeAttribute("inert") : node?.setAttribute("inert", ""))}
          >
            <div className={styles.section}>
              <PlayerRaceInfo raceInfo={raceInfo} />
            </div>
            <div className={classNames(styles.section, styles.middle)}>
              <PlayerControls
                player={player}
                setVolume={setVolume}
                volume={volume}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
              />
            </div>
            <div className={styles.section}>
              <LayoutButtons
                usedWindows={usedWindows}
                createWindow={createWindow}
                viewerState={viewerState}
                loadLayout={loadLayout}
                duplicateLayout={duplicateLayout}
                renameLayout={renameLayout}
                deleteLayout={deleteLayout}
                hasOnlyOneStream={hasOnlyOneStream}
              />
            </div>
          </div>
        </div>
      </FocusTrap>
    </>
  );
};
