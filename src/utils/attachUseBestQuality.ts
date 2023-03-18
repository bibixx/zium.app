import { VideoJsPlayer } from "video.js";
// import { QualityLevel } from "videojs-contrib-quality-levels";

export const attachUseBestQuality = (player: VideoJsPlayer) => {
  // let bestResolution = 0;
  // const qualityLevels = player.qualityLevels();
  // qualityLevels.on("addqualitylevel", (e) => {
  //   const qualityLevel = e.qualityLevel as QualityLevel;
  //   const { height = 1, width = 1, bitrate } = qualityLevel;
  //   const currentResolution = height * width * bitrate;
  //   if (currentResolution > bestResolution) {
  //     for (let i = 0; i < qualityLevels.length; i++) {
  //       qualityLevels[i].enabled = false;
  //     }
  //     qualityLevel.enabled = true;
  //     bestResolution = currentResolution;
  //   }
  // });
};
