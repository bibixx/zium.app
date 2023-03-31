import { PlayerAPI } from "bitmovin-player";
import { PlayerControls } from "../PlayerControls/PlayerControls";
import styles from "./Player.module.scss";

interface PlayerProps {
  player: PlayerAPI | null;
}
export const Player = ({ player }: PlayerProps) => {
  return (
    <div className={styles.wrapper}>
      <PlayerControls player={player} />
    </div>
  );
};
