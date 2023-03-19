import { PlayerAPI, PlayerEvent } from "bitmovin-player";

export const attachUseBestQuality = (player: PlayerAPI) => {
  const onChange = () => {
    const videoQualities = player.getAvailableVideoQualities();
    let maxIndex = 0;

    for (let i = 1; i < videoQualities.length; i++) {
      const qualityLevel = videoQualities[i];
      const bestQualityLevel = videoQualities[maxIndex];

      const quality = qualityLevel.height * qualityLevel.width * qualityLevel.bitrate;
      const bestQuality = bestQualityLevel.height * bestQualityLevel.width * bestQualityLevel.bitrate;

      if (quality > bestQuality) {
        maxIndex = i;
      }
    }

    player.setVideoQuality(videoQualities[maxIndex].id);
  };

  player.on(PlayerEvent.VideoQualityAdded, onChange);
  player.on(PlayerEvent.VideoQualityRemoved, onChange);
  onChange();
};
