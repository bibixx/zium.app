import cn from "classnames";
import { SpeakerWaveIcon, XMarkIcon } from "@heroicons/react/20/solid";
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
      areClosedCaptionsOn: boolean;
    }
  | {
      toggleClosedCaptions?: never;
    };

type OffsetProps =
  | {
      onOffsetChange?: (value: number) => void;
      currentOffset: number;
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
  OffsetProps;

export const VideoWindowButtons = (props: VideoWindowButtonsProps) => {
  return (
    <>
      <div className={styles.topLeftWrapper} onMouseDown={(e) => e.stopPropagation()}>
        {props.streamPill}
        {props.onOffsetChange && (
          <div className={styles.hideWhenUiHidden}>
            <OffsetInput onChange={props.onOffsetChange} initialValue={props.currentOffset} />
          </div>
        )}
      </div>
      {props.onClose && (
        <div className={cn(styles.topRightWrapper, styles.hideWhenUiHidden)} onMouseDown={(e) => e.stopPropagation()}>
          <Button variant="SecondaryInverted" onClick={props.onClose} iconLeft={XMarkIcon} />
        </div>
      )}
      <div className={cn(styles.bottomRightWrapper, styles.hideWhenUiHidden)} onMouseDown={(e) => e.stopPropagation()}>
        {props.updateFillMode && (
          <Button
            variant="SecondaryInverted"
            onClick={() => props.updateFillMode(props.fillMode === "fill" ? "fit" : "fill")}
            iconLeft={props.fillMode === "fill" ? AspectRatioOffIcon : AspectRatioOnIcon}
          />
        )}
        {props.toggleClosedCaptions && (
          <Button
            variant="SecondaryInverted"
            onClick={props.toggleClosedCaptions}
            iconLeft={props.areClosedCaptionsOn ? ClosedCaptionsOnIcon : ClosedCaptionsOffIcon}
          />
        )}
        {props.onAudioFocusClick && (
          <Button
            variant="SecondaryInverted"
            onClick={props.onAudioFocusClick}
            className={cn(styles.focusAudioButton, { [styles.isAudioFocused]: props.isAudioFocused })}
            iconLeft={SpeakerWaveIcon}
          />
        )}
      </div>
    </>
  );
};
