import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStreamVideo } from "../../../hooks/useStreamVideo/useStreamVideo";
import { VideoWindowProps } from "../../../types/VideoWindowBaseProps";
import { setRef } from "../../../utils/setRef";
import { VideoPlayer } from "../../VideoPlayer/VideoPlayer";
import { VideoPlayerRef, TextTrackInfo, AudioTrackInfo, VideoPlayerOptions } from "../../VideoPlayer/VideoPlayer.types";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { NoFeed } from "../NoFeed/NoFeed";
import { FeedError } from "../FeedError/FeedError";
import { StreamVideoError } from "../../../hooks/useStreamVideo/useStreamVideo.utils";
import { SourceButton } from "../../SourceButton/SourceButton";
import { MainGridWindow } from "../../../types/GridWindow";
import { getIconForStreamInfo } from "../../../utils/getIconForStreamInfo";
import { useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";
import {
  VideoWindowButtonsBottomRightWrapper,
  VideoWindowButtonsOffset,
  VideoWindowButtonsOnAudioFocusClick,
  VideoWindowButtonsSetClosedCaptions,
  VideoWindowButtonsSetVideoTrack,
  VideoWindowButtonsToggleClosedCaptions,
  VideoWindowButtonsTopLeftWrapper,
  VideoWindowButtonsUpdateFillMode,
} from "../VideoWindowButtons/VideoWindowButtons";
import { MainStreamInfo } from "../../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { useReactiveUserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import { useFeatureFlags } from "../../../hooks/useFeatureFlags/useFeatureFlags";
import { useInternationalStreamMedia } from "../../../hooks/useInternationalStreamMedia/useInternationalStreamMedia";
import { DropdownSection, DropdownSectionElement } from "../../Dropdown/Dropdown";
import { ChosenValueType } from "../../../hooks/useStreamPicker/useStreamPicker";
import { isNotFalse } from "../../../utils/isNotFalse";
import { countTotalNumberOfOptions, getTrackPrettyName } from "./MainVideoWindow.utils";

interface MainVideoWindowProps extends VideoWindowProps {
  gridWindow: MainGridWindow;
  onPlayingChange: (isPaused: boolean) => void;
  onWindowAudioFocus: () => void;
  isAudioFocused: boolean;
  volume: number;
  setVolume: (newVolume: number) => void;
  hasOnlyOneStream: boolean;
  onSourceChange: (data: ChosenValueType) => void;
  defaultStreams: MainStreamInfo[];
}

export const MainVideoWindow = forwardRef<VideoPlayerRef | null, MainVideoWindowProps>(
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
      defaultStreams,
    },
    forwardedRef,
  ) => {
    const playerRef = useRef<VideoPlayerRef | null>(null);
    const streamVideoState = useStreamVideo(streamUrl);
    const internationalStreamMedia = useInternationalStreamMedia(defaultStreams);
    const [playerError, setPlayerError] = useState<unknown>(null);
    const [availableSubtitleTracks, setAvailableSubtitleTracks] = useState<TextTrackInfo[]>([]);
    const previousSelectedSubtitleIdRef = useRef<string | null>(null);
    const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null);
    const areClosedCaptionsOn = useMemo(() => selectedSubtitleId != null, [selectedSubtitleId]);
    const hasMultipleCaptionsTracks = availableSubtitleTracks.length > 1;
    const showInternationalOffsets = useFeatureFlags((state) => state.flags.showInternationalOffsets);

    const { updateOffset } = useUserOffsets();
    const offsets = useReactiveUserOffsets();
    const onOffsetChange = useCallback(
      (value: number) => {
        updateOffset("international", value);
      },
      [updateOffset],
    );

    const [availableAudioTracks, setAvailableAudioTracks] = useState<AudioTrackInfo[]>([]);
    const selectedAudioLanguage = useMemo(() => {
      return gridWindow.streamId === "international" ? (gridWindow.audioLanguage ?? null) : null;
    }, [gridWindow]);

    const selectedAudioTrackId = useMemo(() => {
      if (selectedAudioLanguage == null) return null;
      const selectedAudioTrack = availableAudioTracks.find((track) => track.lang === selectedAudioLanguage);
      return selectedAudioTrack?.id ?? null;
    }, [availableAudioTracks, selectedAudioLanguage]);

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

    useEffect(() => {
      setAvailableSubtitleTracks([]);
      setAvailableAudioTracks([]);
      setSelectedSubtitleId(null);
      setPlayerError(null);
    }, [streamUrl]);

    const ref = (r: VideoPlayerRef | null) => {
      setRef(forwardedRef, r);
      playerRef.current = r;
    };

    const oldTimeRef = useRef<number | null>(null);
    const prevStreamUrlRef = useRef(streamUrl);
    if (prevStreamUrlRef.current !== streamUrl) {
      oldTimeRef.current = playerRef.current?.video.currentTime ?? null;
      prevStreamUrlRef.current = streamUrl;
    }

    const onReady = (videoPlayerRef: VideoPlayerRef) => {
      if (oldTimeRef.current === null) {
        onPlayingChange(false);
      }

      videoPlayerRef.video.addEventListener("pause", () => {
        onPlayingChange(true);
      });

      videoPlayerRef.video.addEventListener("play", () => {
        onPlayingChange(false);
      });
    };

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
            text: getTrackPrettyName(subtitleTrack.lang, subtitleTrack.label),
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

    const availableVideoTracks = useMemo((): null | DropdownSection[] => {
      if (internationalStreamMedia.state !== "done" || internationalStreamMedia.data == null) {
        return [
          {
            id: "root",
            options: defaultStreams.map((stream) => ({
              id: stream.type,
              isActive: stream.type === gridWindow.streamId,
              text: stream.title,
              onClick: () => onSourceChange({ type: "main", streamId: stream.type }),
            })),
          },
        ];
      }

      const f1tvStream = defaultStreams.find((stream) => stream.type === "f1live");
      const f1tvStreamElement: DropdownSectionElement | null = f1tvStream
        ? {
            id: f1tvStream.type,
            isActive: f1tvStream.type === gridWindow.streamId,
            text: f1tvStream.title,
            onClick: () => onSourceChange({ type: "main", streamId: "f1live" }),
            caption: getTrackPrettyName("eng", ""),
          }
        : null;

      const doesSelectedLanguageExist =
        gridWindow.streamId === "international"
          ? gridWindow.audioLanguage != null && selectedAudioTrackId != null
          : f1tvStream != null;

      const sections = [
        f1tvStreamElement != null && {
          id: "f1live",
          options: [f1tvStreamElement],
        },
        {
          id: "international",
          options: internationalStreamMedia.data.AUDIO.map((media) => ({
            id: media.LANGUAGE,
            isActive: !doesSelectedLanguageExist
              ? media.DEFAULT
              : gridWindow.streamId === "international" && gridWindow.audioLanguage === media.LANGUAGE,
            text: getTrackPrettyName(media.LANGUAGE, media.NAME),
            onClick: () => onSourceChange({ type: "main", streamId: "international", audioLanguage: media.LANGUAGE }),
          })),
        },
      ].filter(isNotFalse);

      return sections;
    }, [defaultStreams, gridWindow, internationalStreamMedia, onSourceChange, selectedAudioTrackId]);

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

    if (playerError != null) {
      return <FeedError error={playerError} />;
    }

    return (
      <VideoWindowWrapper>
        <VideoPlayer
          videoStreamInfo={streamVideoState.data}
          options={ADDITIONAL_OPTIONS}
          ref={ref}
          onReady={onReady}
          onError={setPlayerError}
          isPaused={isPaused}
          volume={isAudioFocused ? volume : 0}
          fillMode={fillMode}
          selectedSubtitleId={selectedSubtitleId}
          setAvailableSubtitles={setAvailableSubtitleTracks}
          selectedAudioLanguage={selectedAudioLanguage}
          setAvailableAudioTracks={setAvailableAudioTracks}
          startAt={oldTimeRef.current ?? undefined}
        />
        <VideoWindowButtonsTopLeftWrapper>
          <SourceButton label="Main stream" icon={getIconForStreamInfo("f1live", "mini")} hideWhenUiHidden />

          {showInternationalOffsets && gridWindow.streamId !== "f1live" && (
            <VideoWindowButtonsOffset
              onOffsetChange={onOffsetChange}
              currentOffset={offsets?.additionalStreams.international ?? 0}
              usesZiumOffsets={offsets?.isUserDefined === false}
            />
          )}
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
          {availableVideoTracks != null && countTotalNumberOfOptions(availableVideoTracks) > 1 && (
            <VideoWindowButtonsSetVideoTrack availableVideoTracks={availableVideoTracks} />
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

const ADDITIONAL_OPTIONS: VideoPlayerOptions = {
  noBufferUI: true,
};
