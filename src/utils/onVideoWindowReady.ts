import { VideoJsPlayer } from "video.js";

export function onVideoWindowReadyBase(player: VideoJsPlayer) {
  const controlBar = player.getChild("ControlBar");

  if (controlBar) {
    controlBar.on("mousedown", (e) => {
      e.stopPropagation();
    });
  }
}
