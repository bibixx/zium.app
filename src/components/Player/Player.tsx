import { Squares2X2Icon, SquaresPlusIcon } from "@heroicons/react/20/solid";
import { PlayerAPI } from "bitmovin-player";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { RaceInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { Button } from "../Button/Button";
import { useViewerUIVisibility } from "../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { PlayerControls } from "./PlayerControls/PlayerControls";
import styles from "./Player.module.scss";
import { PlayerRaceInfo } from "./PlayerRaceInfo/PlayerRaceInfo";

const PLAYER_COLLAPSED_CLOSED_TIMEOUT = 2_000;

interface PlayerProps {
  player: PlayerAPI | null;
  raceInfo: RaceInfo;
}
export const Player = ({ player, raceInfo }: PlayerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isUIVisible } = useViewerUIVisibility();
  const timeoutRef = useRef(-1);

  useEffect(() => {
    if (isUIVisible) {
      clearTimeout(timeoutRef.current);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsCollapsed(false);
      }, PLAYER_COLLAPSED_CLOSED_TIMEOUT);
    }
  }, [isUIVisible]);

  return (
    <FocusTrap
      focusTrapOptions={{
        allowOutsideClick: true,
        initialFocus: false,
      }}
    >
      <div
        className={classNames(styles.wrapper, { [styles.isCollapsed]: isCollapsed, [styles.isVisible]: isUIVisible })}
      >
        {isCollapsed && <div className={styles.collapsedClickArea} onClick={() => setIsCollapsed(false)} />}
        <div className={styles.section}>
          <PlayerRaceInfo raceInfo={raceInfo} />
        </div>
        <div className={classNames(styles.section, styles.middle)}>
          <PlayerControls player={player} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
        </div>
        <div className={styles.section}>
          <div className={styles.buttonsWrapper}>
            <Button iconLeft={Squares2X2Icon} variant="Tertiary" />
            <Button iconLeft={SquaresPlusIcon} variant="Secondary">
              Add video
            </Button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};
