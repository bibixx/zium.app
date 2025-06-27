import { XMarkIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import { forwardRef, ReactNode, useCallback, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { WithVariables } from "../WithVariables/WithVariables";
import { useElementSize } from "../../hooks/useElementSize/useElementSize";
import { PictureConfig, useFormulaImage } from "../../hooks/useFormulaImage/useFormulaImage";
import { FadeInImage } from "../FadeInImage/FadeInImage";
import { useSnackbarDrag, useSnackbarTime } from "./Snackbar.hooks";
import styles from "./Snackbar.module.scss";

const DEFAULT_SNACKBAR_TIME = 4_000;
interface SnackbarProps {
  title: ReactNode;
  content?: ReactNode;
  actions?: ReactNode;
  pictureConfig?: PictureConfig;
  time?: number;
  offsetY: number;
  onClose: () => void;
  setShowDraggingOverlay: (showDraggingOverlay: boolean) => void;
  onHeightChange: (size: { height: number }) => void;
}

export const Snackbar = forwardRef<HTMLDivElement | null, SnackbarProps>(
  (
    {
      title,
      content,
      actions,
      offsetY,
      time = DEFAULT_SNACKBAR_TIME,
      pictureConfig,
      onClose,
      setShowDraggingOverlay,
      onHeightChange,
    },
    forwardedRef,
  ) => {
    const [isHovering, setIsHovering] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const onDragEnd = useCallback(
      (shouldClose: boolean) => {
        setShowDraggingOverlay(false);

        if (shouldClose) {
          onClose();
        }
      },
      [onClose, setShowDraggingOverlay],
    );

    const onDragStart = useCallback(() => {
      setShowDraggingOverlay(true);
    }, [setShowDraggingOverlay]);

    const { onMouseDown, isDragging, isMouseDown } = useSnackbarDrag({
      elementRef: wrapperRef,
      onDragStart,
      onDragEnd,
    });

    useElementSize(onHeightChange, wrapperRef);
    const imageSrc = useFormulaImage(pictureConfig, 360, 200);

    return (
      <>
        <WithVariables
          className={styles.offsetWrapper}
          variables={{ "offset-y": `${offsetY}px` }}
          onMouseDown={onMouseDown}
          ref={forwardedRef}
        >
          <div
            className={cn(styles.wrapper, { [styles.isDragging]: isDragging || isMouseDown })}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            ref={wrapperRef}
            data-css-transition
          >
            <div className={styles.mainWrapper}>
              {pictureConfig && <FadeInImage src={imageSrc} className={cn(styles.image)} />}
              <div className={styles.textContentWrapper}>
                <div className={cn(styles.content)}>
                  <div className={styles.title}>{title}</div>
                  {content && <div className={styles.textContent}>{content}</div>}
                </div>
                <div>
                  <div onMouseDown={(e) => e.stopPropagation()}>
                    <Button variant="Tertiary" iconLeft={XMarkIcon} onClick={onClose} aria-label="Close" />
                  </div>
                </div>
                {actions && <div className={styles.actions}>{actions}</div>}
              </div>
            </div>
            {time !== Infinity && <TimeIndicator isPaused={isHovering || isDragging} onClose={onClose} time={time} />}
          </div>
        </WithVariables>
      </>
    );
  },
);

interface TimeIndicatorProps {
  isPaused: boolean;
  time: number;
  onClose: () => void;
}
const TimeIndicator = ({ isPaused, onClose, time }: TimeIndicatorProps) => {
  const timeIndicatorRef = useSnackbarTime(time, isPaused, onClose);

  return (
    <div className={styles.timeIndicatorWrapper}>
      <div className={styles.timeIndicatorTrack}>
        <div className={styles.timeIndicator} ref={timeIndicatorRef} />
      </div>
    </div>
  );
};
