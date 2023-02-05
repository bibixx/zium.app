import { VideoJsPlayer } from "video.js";

const START_AT = 12 * 60;

export function onVideoWindowReadyBase(
  player: VideoJsPlayer,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _executeOnAll: (
    cb: (player: VideoJsPlayer) => void,
    callerId: string,
  ) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _callerId: string,
) {
  player.currentTime(START_AT);

  const controlBar = player.getChild("ControlBar")!;
  controlBar.on("mousedown", (e) => {
    e.stopPropagation();
  });
}
