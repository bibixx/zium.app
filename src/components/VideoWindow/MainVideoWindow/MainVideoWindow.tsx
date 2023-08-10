import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioTrack, PlayerAPI, PlayerEvent, SubtitleTrack, TimeMode } from "bitmovin-player";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { setRef } from "../../../utils/setRef";
import { AdditionalVideoJSOptions, VideoJS } from "../../VideoJS/VideoJS";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { NoFeed } from "../NoFeed/NoFeed";
import { FeedError } from "../FeedError/FeedError";
import { StreamVideoError } from "../../../hooks/useStreamVideo/useStreamVideo.utils";
import { SourceButton } from "../../SourceButton/SourceButton";
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { MainGridWindow } from "../../../types/GridWindow";
import { getIconForStreamInfo } from "../../../utils/getIconForStreamInfo";
import { assertNever } from "../../../utils/assertNever";
import { useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";
import {
  VideoWindowButtonsBottomRightWrapper,
  VideoWindowButtonsOnAudioFocusClick,
  VideoWindowButtonsSetAudioTrack,
  VideoWindowButtonsSetClosedCaptions,
  VideoWindowButtonsToggleClosedCaptions,
  VideoWindowButtonsTopLeftWrapper,
  VideoWindowButtonsUpdateFillMode,
} from "../VideoWindowButtons/VideoWindowButtons";
import { getTrackPrettyName } from "./MainVideoWindow.utils";

interface MainVideoWindowProps extends VideoWindowProps {
  gridWindow: MainGridWindow;
  onPlayingChange: (isPaused: boolean) => void;
  onWindowAudioFocus: () => void;
  isAudioFocused: boolean;
  volume: number;
  setVolume: (newVolume: number) => void;
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
      hasOnlyOneStream,
      onSourceChange,
      hasOnlyOneMainStream,
    },
    forwardedRef,
  ) => {
    const playerRef = useRef<PlayerAPI | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const [availableSubtitleTracks, setAvailableSubtitleTracks] = useState<SubtitleTrack[]>([]);
    const previousSelectedSubtitleIdRef = useRef<SubtitleTrack["id"] | null>(null);
    const [selectedSubtitleId, setSelectedSubtitleId] = useState<SubtitleTrack["id"] | null>(null);
    const areClosedCaptionsOn = useMemo(() => selectedSubtitleId != null, [selectedSubtitleId]);
    const hasMultipleCaptionsTracks = availableSubtitleTracks.length > 1;

    const toggleClosedCaptions = useCallback(() => {
      const toggleClosedCaptionsWithMultipleTracks = () => {
        if (selectedSubtitleId !== null) {
          previousSelectedSubtitleIdRef.current = selectedSubtitleId;
          setSelectedSubtitleId(null);
          return;
        }

        setSelectedSubtitleId(previousSelectedSubtitleIdRef.current ?? availableSubtitleTracks[0]?.id ?? null);
      };
      const toggleClosedCaptionsWithSingleTrack = () => {
        if (areClosedCaptionsOn) {
          setSelectedSubtitleId(null);
          return;
        }

        setSelectedSubtitleId(availableSubtitleTracks[0]?.id ?? null);
      };

      if (hasMultipleCaptionsTracks) {
        toggleClosedCaptionsWithMultipleTracks();
      } else {
        toggleClosedCaptionsWithSingleTrack();
      }
    }, [areClosedCaptionsOn, availableSubtitleTracks, hasMultipleCaptionsTracks, selectedSubtitleId]);

    useHotkeys(
      () => ({
        id: "mainVideo",
        allowPropagation: true,
        hotkeys: [
          {
            keys: SHORTCUTS.TOGGLE_CLOSED_CAPTIONS,
            action: toggleClosedCaptions,
          },
        ],
      }),
      [toggleClosedCaptions],
    );

    const [availableAudioTracks, setAvailableAudioTracks] = useState<AudioTrack[]>([]);
    const [selectedAudioTrackId, setSelectedAudioTrackId] = useState<AudioTrack["id"] | null>(null);

    useEffect(() => {
      setAvailableSubtitleTracks([]);
      setSelectedSubtitleId(null);
      setAvailableAudioTracks([]);
      setSelectedAudioTrackId(null);
    }, [streamUrl]);

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

    const closedCaptionsProps = useMemo(() => {
      if (!hasMultipleCaptionsTracks) {
        return {
          type: "single" as const,
          toggleClosedCaptions,
          areClosedCaptionsOn: areClosedCaptionsOn,
        };
      }

      const onClick = (id: string | null) => () => {
        if (id === null) {
          previousSelectedSubtitleIdRef.current = selectedSubtitleId;
        }

        setSelectedSubtitleId(id);
      };

      return {
        type: "multiple" as const,
        setClosedCaptions: () => undefined,
        availableClosedCaptions: [
          {
            id: "off",
            isActive: selectedSubtitleId === null,
            text: "Off",
            onClick: onClick(null),
          },
          ...availableSubtitleTracks.map((subtitleTrack) => ({
            id: subtitleTrack.id,
            isActive: selectedSubtitleId === subtitleTrack.id,
            text: getTrackPrettyName(subtitleTrack),
            onClick: onClick(subtitleTrack.id),
          })),
        ],
        areClosedCaptionsOn: selectedSubtitleId !== null,
      };
    }, [
      hasMultipleCaptionsTracks,
      selectedSubtitleId,
      availableSubtitleTracks,
      toggleClosedCaptions,
      areClosedCaptionsOn,
    ]);

    const commentaryAvailableAudioTracks = useMemo(() => {
      const hasMultipleAudioTracks = availableAudioTracks.length > 1;

      if (!hasMultipleAudioTracks) {
        return null;
      }

      return availableAudioTracks.map((audioTrack, i) => ({
        id: audioTrack.id,
        isActive: selectedAudioTrackId === null ? i === 0 : selectedAudioTrackId === audioTrack.id,
        text: getTrackPrettyName(audioTrack),
        onClick: () => setSelectedAudioTrackId(audioTrack.id),
      }));
    }, [availableAudioTracks, selectedAudioTrackId]);

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
          selectedSubtitleId={selectedSubtitleId}
          setAvailableSubtitles={setAvailableSubtitleTracks}
          selectedAudioTrackId={selectedAudioTrackId}
          setAvailableAudioTracks={setAvailableAudioTracks}
        />
        <VideoWindowButtonsTopLeftWrapper>
          <SourceButton
            onClick={hasOnlyOneMainStream ? undefined : onRequestSourceChange}
            label={streamLabel}
            icon={getIconForStreamInfo(gridWindow.streamId, "mini")}
            hideWhenUiHidden
          />
        </VideoWindowButtonsTopLeftWrapper>
        <VideoWindowButtonsBottomRightWrapper>
          <VideoWindowButtonsUpdateFillMode
            updateFillMode={() => updateFillMode(fillMode === "fill" ? "fit" : "fill")}
            fillMode={fillMode}
          />
          {closedCaptionsProps.type === "single" ? (
            <VideoWindowButtonsToggleClosedCaptions {...closedCaptionsProps} />
          ) : (
            <VideoWindowButtonsSetClosedCaptions {...closedCaptionsProps} />
          )}
          {commentaryAvailableAudioTracks != null && (
            <VideoWindowButtonsSetAudioTrack availableAudioTracks={commentaryAvailableAudioTracks} />
          )}
          {!hasOnlyOneStream && (
            <VideoWindowButtonsOnAudioFocusClick
              onAudioFocusClick={onWindowAudioFocus}
              isAudioFocused={isAudioFocused}
            />
          )}
        </VideoWindowButtonsBottomRightWrapper>
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
