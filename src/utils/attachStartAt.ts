import { PlayerAPI } from "bitmovin-player";

export const attachStartAt = (player: PlayerAPI) => {
  const START_AT = 12 * 60;
  player.seek(START_AT);
};
