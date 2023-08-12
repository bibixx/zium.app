import cn from "classnames";
import { SpeakerWaveIcon, XMarkIcon, GlobeEuropeAfricaIcon } from "@heroicons/react/20/solid";
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
import { BaseOptions, Dropdown, DropdownSectionElement } from "../../Dropdown/Dropdown";
import { useViewerUIVisibility } from "../../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import styles from "./VideoWindowButtons.module.scss";

interface VideoWindowButtonsTopLeftWrapperProps {
  children: ReactNode;
}
export const VideoWindowButtonsTopLeftWrapper = ({ children }: VideoWindowButtonsTopLeftWrapperProps) => (
  <div className={styles.topLeftWrapper} onMouseDown={(e) => e.stopPropagation()}>
    {children}
  </div>
);
interface VideoWindowButtonsTopRightWrapperProps {
  children: ReactNode;
}
export const VideoWindowButtonsTopRightWrapper = ({ children }: VideoWindowButtonsTopRightWrapperProps) => (
  <div className={cn(styles.topRightWrapper, styles.hideWhenUiHidden)} onMouseDown={(e) => e.stopPropagation()}>
    {children}
  </div>
);
interface VideoWindowButtonsBottomRightWrapperProps {
  children: ReactNode;
}
export const VideoWindowButtonsBottomRightWrapper = ({ children }: VideoWindowButtonsBottomRightWrapperProps) => (
  <div className={cn(styles.bottomRightWrapper, styles.hideWhenUiHidden)} onMouseDown={(e) => e.stopPropagation()}>
    {children}
  </div>
);

type VideoWindowButtonsOffsetProps = {
  onOffsetChange: (value: number) => void;
  currentOffset: number;
  usesZiumOffsets: boolean;
};
export const VideoWindowButtonsOffset = (props: VideoWindowButtonsOffsetProps) => (
  <div className={styles.hideWhenUiHidden}>
    <OffsetInput
      onChange={props.onOffsetChange}
      initialValue={props.currentOffset}
      usesZiumOffsets={props.usesZiumOffsets}
    />
  </div>
);

type VideoWindowButtonsCloseProps = {
  onClose: () => void;
};
export const VideoWindowButtonsClose = (props: VideoWindowButtonsCloseProps) => (
  <Button variant="SecondaryInverted" onClick={props.onClose} iconLeft={XMarkIcon} aria-label="Close" />
);

interface VideoWindowButtonsUpdateFillModeProps {
  updateFillMode: (value: GridLayoutFillMode) => void;
  fillMode: GridLayoutFillMode;
}
export const VideoWindowButtonsUpdateFillMode = (props: VideoWindowButtonsUpdateFillModeProps) => (
  <Button
    variant="SecondaryInverted"
    onClick={() => props.updateFillMode(props.fillMode === "fill" ? "fit" : "fill")}
    iconLeft={props.fillMode === "fill" ? AspectRatioOffIcon : AspectRatioOnIcon}
    aria-label="Toggle aspect ratio"
  />
);

interface VideoWindowButtonsToggleClosedCaptionsProps {
  toggleClosedCaptions: () => void;
  areClosedCaptionsOn: boolean;
}
export const VideoWindowButtonsToggleClosedCaptions = (props: VideoWindowButtonsToggleClosedCaptionsProps) => (
  <Button
    variant="SecondaryInverted"
    onClick={props.toggleClosedCaptions}
    iconLeft={props.areClosedCaptionsOn ? ClosedCaptionsOnIcon : ClosedCaptionsOffIcon}
    aria-label={props.areClosedCaptionsOn ? "Turn off closed captions" : "Turn on closed captions"}
  />
);

interface VideoWindowButtonsSetClosedCaptionsProps {
  setClosedCaptions: () => void;
  availableClosedCaptions: DropdownSectionElement[];
  areClosedCaptionsOn: boolean;
}
export const VideoWindowButtonsSetClosedCaptions = (props: VideoWindowButtonsSetClosedCaptionsProps) => {
  const { preventHiding } = useViewerUIVisibility();

  return (
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
  );
};

interface VideoWindowButtonsOnAudioFocusClickProps {
  onAudioFocusClick: () => void;
  isAudioFocused: boolean;
}
export const VideoWindowButtonsOnAudioFocusClick = (props: VideoWindowButtonsOnAudioFocusClickProps) => (
  <Button
    variant="SecondaryInverted"
    onClick={props.onAudioFocusClick}
    className={cn(styles.focusAudioButton, { [styles.isAudioFocused]: props.isAudioFocused })}
    iconLeft={SpeakerWaveIcon}
    aria-label={props.isAudioFocused ? "Unfocus audio" : "Focus audio"}
  />
);

interface VideoWindowButtonsSetVideoTrackProps {
  availableVideoTracks: BaseOptions;
}
export const VideoWindowButtonsSetVideoTrack = (props: VideoWindowButtonsSetVideoTrackProps) => {
  const { preventHiding } = useViewerUIVisibility();

  return (
    <Dropdown
      placement="top-end"
      options={props.availableVideoTracks}
      onOpened={() => preventHiding(true)}
      onClosed={() => preventHiding(false)}
      closeOnClick
    >
      {({ setRef, toggleOpen, isOpen }) => {
        return (
          <Button
            ref={setRef}
            iconLeft={GlobeEuropeAfricaIcon}
            isPressed={isOpen}
            variant="SecondaryInverted"
            onClick={toggleOpen}
            aria-label="Choose video track"
          />
        );
      }}
    </Dropdown>
  );
};
