import { forwardRef, useRef } from "react";
import { PlayerAPI, PlayerEvent } from "bitmovin-player";
import { TvIcon } from "@heroicons/react/20/solid";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { setRef } from "../../../utils/setRef";
import { AdditionalVideoJSOptions, VideoJS } from "../../VideoJS/VideoJS";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { NoFeed } from "../NoFeed/NoFeed";
import { FeedError } from "../FeedError/FeedError";
import { StreamVideoError } from "../../../hooks/useStreamVideo/useStreamVideo.utils";
import { VideoWindowButtons } from "../VideoWindowButtons/VideoWindowButtons";
import { SourceButton } from "../../SourceButton/SourceButton";

interface MainVideoWindowProps extends VideoWindowProps {
  onPlayingChange: (isPaused: boolean) => void;
  onWindowAudioFocus: () => void;
  isAudioFocused: boolean;
  volume: number;
  setVolume: (newVolume: number) => void;
  areClosedCaptionsOn: boolean;
  setAreClosedCaptionsOn: (value: boolean) => void;
  hasOnlyOneStream: boolean;
}

export const MainVideoWindow = forwardRef<PlayerAPI | null, MainVideoWindowProps>(
  (
    {
      streamUrl,
      onPlayingChange,
      isPaused,
      isAudioFocused,
      onWindowAudioFocus,
      volume,
      fillMode,
      updateFillMode,
      areClosedCaptionsOn,
      setAreClosedCaptionsOn,
      hasOnlyOneStream,
    },
    forwardedRef,
  ) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);

    const ref = (r: PlayerAPI | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const onReady = (player: PlayerAPI) => {
      player.on(PlayerEvent.Paused, () => {
        onPlayingChange(true);
      });

      player.on(PlayerEvent.Play, () => {
        onPlayingChange(false);
      });

      // Used to bypass Chrome's inability to autoplay non-muted video
      player.unmute();
    };

    if (streamVideoState.state === "loading") {
      return null;
    }

    if (
      streamVideoState.state === "error" &&
      streamVideoState.error instanceof StreamVideoError &&
      streamVideoState.error.type === "NO_PLAYBACK_URL"
    ) {
      return <NoFeed />;
    }

    if (streamVideoState.state === "error") {
      return <FeedError error={streamVideoState.error} />;
    }

    const audioFocusProps = hasOnlyOneStream
      ? {}
      : ({
          onAudioFocusClick: onWindowAudioFocus,
          isAudioFocused: isAudioFocused,
        } as const);

    return (
      <VideoWindowWrapper>
        <VideoJS
          videoStreamInfo={streamVideoState.data}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onInitialized={onReady}
          isPaused={isPaused}
          volume={isAudioFocused ? volume : 0}
          fillMode={fillMode}
          areClosedCaptionsOn={areClosedCaptionsOn}
        />
        <VideoWindowButtons
          updateFillMode={() => updateFillMode(fillMode === "fill" ? "fit" : "fill")}
          fillMode={fillMode}
          {...audioFocusProps}
          toggleClosedCaptions={() => setAreClosedCaptionsOn(!areClosedCaptionsOn)}
          areClosedCaptionsOn={areClosedCaptionsOn}
          streamPill={!hasOnlyOneStream && <SourceButton label="F1 Live" icon={TvIcon} hideWhenUiHidden />}
        />
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: AdditionalVideoJSOptions = {
  ui: false,
  noBufferUI: true,
  playback: {
    muted: true,
  },
  // controlBar: {
  //   playToggle: true,
  //   remainingTimeDisplay: true,
  //   progressControl: true,
  //   volumePanel: true,
  //   audioTrackButton: true,
  //   fullscreenToggle: true,
  // },
};
