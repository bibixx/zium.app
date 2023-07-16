import { ContainerConfig, Container } from "bitmovin-player-ui/dist/js/framework/components/container";
import { UIInstanceManager } from "bitmovin-player-ui/dist/js/framework/uimanager";
import { Component, ComponentConfig } from "bitmovin-player-ui/dist/js/framework/components/component";
import { Timeout } from "bitmovin-player-ui/dist/js/framework/timeout";
import { PlayerAPI } from "bitmovin-player";
import Lottie, { AnimationItem } from "lottie-web";
import loaderAnimation from "../../assets/loader.json";

/**
 * Configuration interface for the {@link BufferingOverlay} component.
 */
export interface BufferingOverlayConfig extends ContainerConfig {
  /**
   * Delay in milliseconds after which the buffering overlay will be displayed. Useful to bypass short stalls without
   * displaying the overlay. Set to 0 to display the overlay instantly.
   * Default: 1000ms (1 second)
   */
  showDelayMs?: number;
}

/**
 * Overlays the player and displays a buffering indicator.
 */
export class BufferingOverlay extends Container<BufferingOverlayConfig> {
  private animationContainer: Component<ComponentConfig>;
  private animationItem: AnimationItem | null = null;

  private animationItemHideTimeout = new Timeout(400, () => {
    this.animationItem?.pause();
  });

  constructor(config: BufferingOverlayConfig = {}) {
    super(config);

    this.animationContainer = new Container({
      cssClass: "ui-buffering-overlay-animation",
    });

    this.config = this.mergeConfig(
      config,
      <BufferingOverlayConfig>{
        cssClass: "ui-buffering-overlay",
        hidden: true,
        showDelayMs: 1000,
        components: [this.animationContainer],
      },
      this.config,
    );
  }

  show() {
    super.show();
    this.animationItem?.play();
    this.animationItemHideTimeout.clear();
  }

  hide() {
    super.hide();
    this.animationItemHideTimeout.start();
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const $element = this.animationContainer.getDomElement().get(0);
    this.animationItem = Lottie.loadAnimation({
      container: $element, // the dom element that will contain the animation
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData: loaderAnimation,
    });

    const config = this.getConfig();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const overlayShowTimeout = new Timeout(config.showDelayMs!, () => {
      this.show();
    });

    const showOverlay = () => {
      overlayShowTimeout.start();
    };

    const hideOverlay = () => {
      overlayShowTimeout.clear();
      this.hide();
    };

    player.on(player.exports.PlayerEvent.StallStarted, showOverlay);
    player.on(player.exports.PlayerEvent.StallEnded, hideOverlay);
    player.on(player.exports.PlayerEvent.Play, showOverlay);
    player.on(player.exports.PlayerEvent.Playing, hideOverlay);
    player.on(player.exports.PlayerEvent.Paused, hideOverlay);
    player.on(player.exports.PlayerEvent.Seek, () => {
      // console.log("seek");
      showOverlay();
    });
    player.on(player.exports.PlayerEvent.Seeked, () => {
      // console.log("seeked");
      hideOverlay();
    });
    player.on(player.exports.PlayerEvent.TimeShift, showOverlay);
    player.on(player.exports.PlayerEvent.TimeShifted, hideOverlay);
    player.on(player.exports.PlayerEvent.SourceUnloaded, hideOverlay);

    // Show overlay if player is already stalled at init
    if (player.isStalled()) {
      this.show();
    }
  }

  release() {
    super.release();
    this.animationItem?.destroy();
  }
}
