import { Squares2X2Icon, SquaresPlusIcon } from "@heroicons/react/20/solid";
import { PlayerAPI } from "bitmovin-player";
import classNames from "classnames";
import { useState } from "react";
import { RaceInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { Button } from "../Button/Button";
import { PlayerControls } from "./PlayerControls/PlayerControls";
import styles from "./Player.module.scss";
import { PlayerRaceInfo } from "./PlayerRaceInfo/PlayerRaceInfo";

interface PlayerProps {
  player: PlayerAPI | null;
  raceInfo: RaceInfo;
}
export const Player = ({ player, raceInfo }: PlayerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={classNames(styles.wrapper, { [styles.isCollapsed]: isCollapsed })}>
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
      {isCollapsed && <div className={styles.collapsedClickArea} onClick={() => setIsCollapsed(false)} />}
    </div>
  );
};
