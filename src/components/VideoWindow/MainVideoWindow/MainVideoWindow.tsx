import { forwardRef, useEffect, useMemo, useRef } from "react";
import { PlayerAPI, PlayerEvent, TimeMode } from "bitmovin-player";
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
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { MainGridWindow } from "../../../types/GridWindow";
import { getIconForStreamInfo } from "../../../utils/getIconForStreamInfo";
import { assertNever } from "../../../utils/assertNever";

interface MainVideoWindowProps extends VideoWindowProps {
  gridWindow: MainGridWindow;
  onPlayingChange: (isPaused: boolean) => void;
  onWindowAudioFocus: () => void;
  isAudioFocused: boolean;
  volume: number;
  setVolume: (newVolume: number) => void;
  areClosedCaptionsOn: boolean;
  setAreClosedCaptionsOn: (value: boolean) => void;
  hasOnlyOneStream: boolean;
  onSourceChange: (streamId: string, chosenValueType: ChosenValueType) => void;
  hasOnlyOneMainStream: boolean;
}

export const MainVideoWindow = forwardRef<PlayerAPI | null, MainVideoWindowProps>(
  (
    {
      gridWindow,
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
      onSourceChange,
      hasOnlyOneMainStream,
    },
    forwardedRef,
  ) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);

    const ref = (r: PlayerAPI | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const { requestStream } = useStreamPicker();
    const onRequestSourceChange = async () => {
      const chosenDriverData = await requestStream(["main"], [gridWindow.streamId]);

      if (chosenDriverData == null) {
        return;
      }

      const [chosenStreamId, chosenValueType] = chosenDriverData;
      onSourceChange(chosenStreamId, chosenValueType);
    };

    const oldTimeRef = useRef<number | null>(null);
    useEffect(
      function savePreviousTimeBeforeStreamUrlChange() {
        oldTimeRef.current = playerRef.current?.getCurrentTime(TimeMode.AbsoluteTime) ?? null;
      },
      [streamUrl],
    );

    const onReady = (player: PlayerAPI) => {
      if (oldTimeRef.current !== null) {
        player.seek(oldTimeRef.current);
      }

      onPlayingChange(false);

      player.on(PlayerEvent.Paused, () => {
        onPlayingChange(true);
      });

      player.on(PlayerEvent.Play, () => {
        onPlayingChange(false);
      });
    };

    const streamLabel = useMemo(() => {
      if (gridWindow.streamId === "f1tv") {
        return "F1 Live";
      }

      if (gridWindow.streamId === "international") {
        return "International";
      }

      return assertNever(gridWindow.streamId);
    }, [gridWindow.streamId]);

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
          onReady={onReady}
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
          streamPill={
            <SourceButton
              onClick={hasOnlyOneMainStream ? undefined : onRequestSourceChange}
              label={streamLabel}
              icon={getIconForStreamInfo(gridWindow.streamId, "mini")}
              hideWhenUiHidden
            />
          }
        />
      </VideoWindowWrapper>
    );
  },
);

const ADDITIONAL_OPTIONS: AdditionalVideoJSOptions = {
  ui: false,
  noBufferUI: true,
  playback: {
    muted: false,
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
