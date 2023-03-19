import { PlayerAPI, PlayerEvent } from "bitmovin-player";

export function onVideoWindowReadyBase(player: PlayerAPI) {
  const $container = player.getContainer();

  const controlBar = $container.querySelector<HTMLDivElement>(".bmpui-ui-controlbar");
  if (controlBar) {
    controlBar.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
  }
}
