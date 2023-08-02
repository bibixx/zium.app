import cn from "classnames";
import { SpeakerWaveIcon, XMarkIcon, MicrophoneIcon } from "@heroicons/react/20/solid";
import { ReactNode } from "react";
import { GridLayoutFillMode } from "../../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { Button } from "../../Button/Button";
import {
  AspectRatioOffIcon,
  AspectRatioOnIcon,
  ClosedCaptionsOffIcon,
  ClosedCaptionsOnIcon,
} from "../../CustomIcons/CustomIcons";
import { OffsetInput } from "../OffsetInput/OffsetInput";
import { Dropdown, DropdownSectionElement } from "../../Dropdown/Dropdown";
import { useViewerUIVisibility } from "../../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import styles from "./VideoWindowButtons.module.scss";

type AudioFocusProps =
  | {
      onAudioFocusClick: () => void;
      isAudioFocused: boolean;
    }
  | {
      onAudioFocusClick?: never;
    };

type FillModeProps =
  | {
      updateFillMode: (value: GridLayoutFillMode) => void;
      fillMode: GridLayoutFillMode;
    }
  | {
      updateFillMode?: never;
    };

type ClosedCaptionsProps =
  | {
      toggleClosedCaptions: () => void;
      setClosedCaptions?: never;
      areClosedCaptionsOn: boolean;
    }
  | {
      toggleClosedCaptions?: never;
      setClosedCaptions: () => void;
      availableClosedCaptions: DropdownSectionElement[];
      areClosedCaptionsOn: boolean;
    }
  | {
      toggleClosedCaptions?: never;
      setClosedCaptions?: never;
    };

export type AudioTracksProps =
  | {
      setAudioTrack: () => void;
      availableAudioTracks: DropdownSectionElement[];
    }
  | {
      setAudioTrack?: never;
    };

type OffsetProps =
  | {
      onOffsetChange?: (value: number) => void;
      currentOffset: number;
      usesZiumOffsets: boolean;
    }
  | {
      onOffsetChange?: never;
    };

type VideoWindowButtonsProps = {
  onClose?: () => void;
  streamPill?: ReactNode;
} & AudioFocusProps &
  FillModeProps &
  ClosedCaptionsProps &
  AudioTracksProps &
  OffsetProps;

export const VideoWindowButtons = (props: VideoWindowButtonsProps) => {
  const { preventHiding } = useViewerUIVisibility();

  return (
    <>
      <div className={styles.topLeftWrapper} onMouseDown={(e) => e.stopPropagation()}>
        {props.streamPill}
        {props.onOffsetChange && (
          <div className={styles.hideWhenUiHidden}>
            <OffsetInput
              onChange={props.onOffsetChange}
              initialValue={props.currentOffset}
              usesZiumOffsets={props.usesZiumOffsets}
            />
          </div>
        )}
      </div>
      {props.onClose && (
        <div className={cn(styles.topRightWrapper, styles.hideWhenUiHidden)} onMouseDown={(e) => e.stopPropagation()}>
          <Button variant="SecondaryInverted" onClick={props.onClose} iconLeft={XMarkIcon} aria-label="Close" />
        </div>
      )}
      <div className={cn(styles.bottomRightWrapper, styles.hideWhenUiHidden)} onMouseDown={(e) => e.stopPropagation()}>
        {props.updateFillMode && (
          <Button
            variant="SecondaryInverted"
            onClick={() => props.updateFillMode(props.fillMode === "fill" ? "fit" : "fill")}
            iconLeft={props.fillMode === "fill" ? AspectRatioOffIcon : AspectRatioOnIcon}
            aria-label="Toggle aspect ratio"
          />
        )}
        {props.toggleClosedCaptions && (
          <Button
            variant="SecondaryInverted"
            onClick={props.toggleClosedCaptions}
            iconLeft={props.areClosedCaptionsOn ? ClosedCaptionsOnIcon : ClosedCaptionsOffIcon}
            aria-label={props.areClosedCaptionsOn ? "Turn off closed captions" : "Turn on closed captions"}
          />
        )}
        {props.setClosedCaptions && (
          <Dropdown
            placement="top-end"
            options={props.availableClosedCaptions}
            onOpened={() => preventHiding(true)}
            onClosed={() => preventHiding(false)}
            closeOnClick
          >
            {({ setRef, toggleOpen, isOpen }) => {
              return (
                <Button
                  ref={setRef}
                  iconLeft={props.areClosedCaptionsOn ? ClosedCaptionsOnIcon : ClosedCaptionsOffIcon}
                  isPressed={isOpen}
                  variant="SecondaryInverted"
                  onClick={toggleOpen}
                  aria-label="Choose closed captions track"
                />
              );
            }}
          </Dropdown>
        )}
        {props.setAudioTrack && (
          <Dropdown
            placement="top-end"
            options={props.availableAudioTracks}
            onOpened={() => preventHiding(true)}
            onClosed={() => preventHiding(false)}
            closeOnClick
          >
            {({ setRef, toggleOpen, isOpen }) => {
              return (
                <Button
                  ref={setRef}
                  iconLeft={MicrophoneIcon}
                  isPressed={isOpen}
                  variant="SecondaryInverted"
                  onClick={toggleOpen}
                  aria-label="Choose audio track"
                />
              );
            }}
          </Dropdown>
        )}
        {props.onAudioFocusClick && (
          <Button
            variant="SecondaryInverted"
            onClick={props.onAudioFocusClick}
            className={cn(styles.focusAudioButton, { [styles.isAudioFocused]: props.isAudioFocused })}
            iconLeft={SpeakerWaveIcon}
            aria-label={props.isAudioFocused ? "Unfocus audio" : "Focus audio"}
          />
        )}
      </div>
    </>
  );
};
