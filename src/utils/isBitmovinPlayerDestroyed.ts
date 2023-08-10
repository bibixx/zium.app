import { PlayerAPI, PlayerAPINotAvailableError } from "bitmovin-player";

export const isBitmovinPlayerDestroyed = (player: PlayerAPI) => {
  try {
    player.getConfig();
  } catch (error) {
    if (error instanceof PlayerAPINotAvailableError) {
      return true;
    }

    throw error;
  }

  return false;
};
