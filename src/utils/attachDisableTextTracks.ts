import { VideoJsPlayer } from "video.js";

export function attachDisableTextTracks(player: VideoJsPlayer) {
  const tracks = player.textTracks();
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].mode = "hidden";
  }

  tracks.addEventListener("addtrack", () => {
    const newTracks = player.textTracks();
    for (let i = 0; i < newTracks.length; i++) {
      newTracks[i].mode = "hidden";
    }
  });
}
