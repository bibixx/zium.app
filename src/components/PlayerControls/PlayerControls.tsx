import { PlayerAPI } from "bitmovin-player";
import {
  AdClickOverlay,
  AdMessageLabel,
  AdSkipButton,
  AirPlayToggleButton,
  AudioQualitySelectBox,
  AudioTrackSelectBox,
  BufferingOverlay,
  CastStatusOverlay,
  CastToggleButton,
  Container,
  ControlBar,
  ErrorMessageOverlay,
  FullscreenToggleButton,
  i18n,
  Label,
  PictureInPictureToggleButton,
  PlaybackSpeedSelectBox,
  PlaybackTimeLabel,
  PlaybackTimeLabelMode,
  PlaybackToggleButton,
  PlaybackToggleOverlay,
  PlayerUtils,
  RecommendationOverlay,
  SeekBar,
  SeekBarLabel,
  SettingsPanel,
  SettingsPanelItem,
  SettingsPanelPage,
  SettingsPanelPageOpenButton,
  SettingsToggleButton,
  Spacer,
  SubtitleOverlay,
  SubtitleSelectBox,
  SubtitleSettingsLabel,
  SubtitleSettingsPanelPage,
  TitleBar,
  UIContainer,
  UIManager,
  VideoQualitySelectBox,
  VolumeSlider,
  VolumeToggleButton,
  VRToggleButton,
  Watermark,
} from "bitmovin-player-ui";
import { UIConfig } from "bitmovin-player-ui/dist/js/framework/uiconfig";
import { useEffect, useRef } from "react";

interface PlayerControlsProps {
  player: PlayerAPI | null;
}

export const PlayerControls = ({ player }: PlayerControlsProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const $wrapper = wrapperRef.current;
    if (player === null || $wrapper === null) {
      return;
    }

    const mainSettingsPanelPage = new SettingsPanelPage({
      components: [
        new SettingsPanelItem(i18n.getLocalizer("settings.video.quality"), new VideoQualitySelectBox()),
        new SettingsPanelItem(i18n.getLocalizer("speed"), new PlaybackSpeedSelectBox()),
        new SettingsPanelItem(i18n.getLocalizer("settings.audio.quality"), new AudioQualitySelectBox()),
      ],
    });

    const settingsPanel = new SettingsPanel({
      components: [mainSettingsPanelPage],
      hidden: true,
    });

    const seekBar = new SeekBar({ label: new SeekBarLabel() });
    const playbackToggleButton = new PlaybackToggleButton({
      cssClass: "asd",
    });

    const controlBar = new ControlBar({
      components: [
        settingsPanel,
        new Container({
          components: [
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
            new Spacer(),
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ["text-right"] }),
          ],
          cssClasses: ["controlbar-top"],
        }),
        new Container({
          components: [seekBar],
          cssClasses: ["controlbar-top"],
        }),
        new Container({
          components: [
            playbackToggleButton,
            new VolumeToggleButton(),
            new VolumeSlider(),
            new Spacer(),
            new SettingsToggleButton({ settingsPanel: settingsPanel }),
            new FullscreenToggleButton(),
          ],
          cssClasses: ["controlbar-bottom"],
        }),
      ],
    });

    const myUi = new UIContainer({
      components: [new BufferingOverlay(), new CastStatusOverlay(), controlBar],
      hideDelay: -1,
    });

    const myUiConfig: UIConfig = {
      container: $wrapper,
    };

    const myUiManager = new UIManager(player, myUi, myUiConfig);

    return () => {
      myUiManager.release();
    };
  }, [player]);
  console.log(player);

  return <div ref={wrapperRef} />;
};
