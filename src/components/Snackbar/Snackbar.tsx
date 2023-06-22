import { XMarkIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import { forwardRef, ReactNode, useCallback, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { WithVariables } from "../WithVariables/WithVariables";
import { useSnackbarDrag, useSnackbarHeight, useSnackbarTime } from "./Snackbar.hooks";
import styles from "./Snackbar.module.scss";

const DEFAULT_SNACKBAR_TIME = 4_000;
interface SnackbarProps {
  title: ReactNode;
  content: ReactNode;
  time?: number;
  offsetY: number;
  onClose: () => void;
  setShowDraggingOverlay: (showDraggingOverlay: boolean) => void;
  onHeightChange: (height: number) => void;
}

export const Snackbar = forwardRef<HTMLDivElement | null, SnackbarProps>(
  (
    { title, content, offsetY, time = DEFAULT_SNACKBAR_TIME, onClose, setShowDraggingOverlay, onHeightChange },
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

    useSnackbarHeight(onHeightChange, wrapperRef);

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
              <div className={styles.content}>
                <div className={styles.title}>{title}</div>
                <div className={styles.textContent}>{content}</div>
              </div>
              <div>
                <div onMouseDown={(e) => e.stopPropagation()}>
                  <Button variant="Tertiary" iconLeft={XMarkIcon} onClick={onClose} />
                </div>
              </div>
            </div>
            <TimeIndicator isPaused={isHovering || isDragging} onClose={onClose} time={time} />
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
  const progress = useSnackbarTime(time, isPaused, onClose);

  return (
    <div className={styles.timeIndicatorWrapper}>
      <div className={styles.timeIndicatorTrack}>
        <WithVariables className={styles.timeIndicator} variables={{ progress }} />
      </div>
    </div>
  );
};
