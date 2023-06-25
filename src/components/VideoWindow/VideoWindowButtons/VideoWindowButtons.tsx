import cn from "classnames";
import { SpeakerWaveIcon, XMarkIcon } from "@heroicons/react/20/solid";
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

type VideoWindowButtonsProps = {
  onOffsetChange?: (value: number) => void;
  onClose?: () => void;
} & AudioFocusProps &
  FillModeProps &
  ClosedCaptionsProps;

export const VideoWindowButtons = (props: VideoWindowButtonsProps) => {
  return (
    <>
      <div className={styles.optionsButtonsWrapper} onMouseDown={(e) => e.stopPropagation()}>
        {props.onOffsetChange && <OffsetInput onChange={props.onOffsetChange} />}
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
      {props.onClose && (
        <div className={styles.closeButtonWrapper} onMouseDown={(e) => e.stopPropagation()}>
          <Button variant="SecondaryInverted" onClick={props.onClose} iconLeft={XMarkIcon} />
        </div>
      )}
    </>
  );
};
