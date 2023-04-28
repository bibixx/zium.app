import { PlayerAPI } from "bitmovin-player";
import { i18n, UIInstanceManager } from "bitmovin-player-ui";
import { SeekBar, SeekBarConfig } from "bitmovin-player-ui/dist/js/framework/components/seekbar";

/**
 * Configuration interface for the {@link VolumeSlider} component.
 */
export interface VolumeSliderConfig extends SeekBarConfig {
  /**
   * Specifies if the volume slider should be automatically hidden when volume control is prohibited by the
   * browser or platform. This currently only applies to iOS.
   * Default: true
   */
  hideIfVolumeControlProhibited?: boolean;
}

/**
 * A simple volume slider component to adjust the player's volume setting.
 */
export class CustomVolumeSlider extends SeekBar {
  constructor(config: VolumeSliderConfig = {}, private setVolume: (newVolume: number) => void) {
    super(config);

    this.config = this.mergeConfig(
      config,
      <VolumeSliderConfig>{
        cssClass: "ui-volumeslider",
        hideIfVolumeControlProhibited: true,
        ariaLabel: i18n.getLocalizer("settings.audio.volume"),
        tabIndex: 0,
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager, false);

    this.onSeeked.subscribe(this.internalOnSeeked);
    this.onSeekPreview.subscribeRateLimited(this.internalOnSeekPreview, 50);
  }

  private internalOnSeeked = (sender: SeekBar, position: number) => {
    this.setVolume(position);
  };

  private internalOnSeekPreview = (sender: SeekBar, args: { scrubbing: boolean; position: number }) => {
    this.getLabel()?.setText(String(Math.round(args.position)));

    if (args.scrubbing) {
      this.setVolume(args.position);
    }
  };

  public release(): void {
    this.onSeeked.unsubscribe(this.internalOnSeeked);
    this.onSeekPreview.unsubscribe(this.internalOnSeekPreview);
  }
}
