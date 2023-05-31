import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import cn from "classnames";
import { useWindowSize } from "../../hooks/useWindowSize";
import { Dimensions } from "../../types/Dimensions";
import { WithVariables } from "../WithVariables/WithVariables";
import { useViewerUIVisibility } from "../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { sizePercentToPx, sizePxToPercent } from "./RnDWindow.utils";
import styles from "./RnDWindow.module.scss";
import { useDrag } from "./hooks/useDrag";
import { useResize } from "./hooks/useResize";
import { getTransform } from "./utils/getTransform";
import { Position, Size } from "./RnDWindow.types";

interface RnDWindowProps {
  grid: [number, number] | undefined;
  children: ReactNode;
  dimensions: Dimensions;
  onChange: (dimensions: Dimensions) => void;
  zIndex: number;
  bringToFront: () => void;
}
export const RnDWindow = ({ dimensions, grid, children, onChange, zIndex, bringToFront }: RnDWindowProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { isUIVisible, preventHiding } = useViewerUIVisibility();
  const { height: windowHeight, width: windowWidth } = useWindowSize();
  const position = useMemo(
    () => ({ x: sizePercentToPx(dimensions.x, windowWidth), y: sizePercentToPx(dimensions.y, windowHeight) }),
    [dimensions.x, dimensions.y, windowHeight, windowWidth],
  );
  const size = useMemo(
    () => ({
      width: sizePercentToPx(dimensions.width, windowWidth),
      height: sizePercentToPx(dimensions.height, windowHeight),
    }),
    [dimensions.height, dimensions.width, windowHeight, windowWidth],
  );

  useEffect(() => {
    const $element = elementRef.current;
    if ($element == null) {
      return;
    }

    $element.style.width = `${size.width}px`;
    $element.style.height = `${size.height}px`;
    $element.style.transform = getTransform(position.x, position.y);
  }, [position, size]);

  const onResizeStart = useCallback(() => {
    bringToFront();
  }, [bringToFront]);

  const onResizeEnd = useCallback(
    (size: Size, position: Position) => {
      onChange({
        width: sizePxToPercent(size.width, windowWidth),
        height: sizePxToPercent(size.height, windowHeight),
        x: sizePxToPercent(position.x, windowWidth),
        y: sizePxToPercent(position.y, windowHeight),
      });
    },
    [onChange, windowHeight, windowWidth],
  );

  const onDragStart = useCallback(() => {
    bringToFront();
  }, [bringToFront]);

  const onDragEnd = useCallback(
    (position: Position) => {
      onChange({
        width: sizePxToPercent(size.width, windowWidth),
        height: sizePxToPercent(size.height, windowHeight),
        x: sizePxToPercent(position.x, windowWidth),
        y: sizePxToPercent(position.y, windowHeight),
      });
    },
    [onChange, size.height, size.width, windowHeight, windowWidth],
  );

  const {
    onMouseDown: onWrapperMouseDown,
    isDragging,
    isMouseDown,
  } = useDrag({
    elementRef,
    onDragStart,
    onDragEnd,
    grid: grid ?? [1, 1],
  });
  const { onMouseDown: onMouseHandleDown } = useResize({
    elementRef,
    onResizeStart,
    onResizeEnd,
    grid: grid ?? [1, 1],
  });

  useEffect(() => {
    preventHiding(isDragging);
  }, [isDragging, preventHiding]);

  return (
    <WithVariables
      ref={elementRef}
      className={cn(styles.rndWrapper, { [styles.isDragging]: isDragging || isMouseDown })}
      onMouseDown={onWrapperMouseDown}
      variables={{
        zIndex: zIndex,
      }}
    >
      <div className={styles.contents}>{children}</div>
      <div onMouseDown={onMouseHandleDown("n")} className={cn(styles.rndHandle, styles.rndHandleN)}></div>
      <div onMouseDown={onMouseHandleDown("e")} className={cn(styles.rndHandle, styles.rndHandleE)}></div>
      <div onMouseDown={onMouseHandleDown("w")} className={cn(styles.rndHandle, styles.rndHandleW)}></div>
      <div onMouseDown={onMouseHandleDown("s")} className={cn(styles.rndHandle, styles.rndHandleS)}></div>
      <div onMouseDown={onMouseHandleDown("nw")} className={cn(styles.rndHandle, styles.rndHandleNw)}></div>
      <div onMouseDown={onMouseHandleDown("ne")} className={cn(styles.rndHandle, styles.rndHandleNe)}></div>
      <div onMouseDown={onMouseHandleDown("sw")} className={cn(styles.rndHandle, styles.rndHandleSw)}></div>
      <div onMouseDown={onMouseHandleDown("se")} className={cn(styles.rndHandle, styles.rndHandleSe)}></div>
    </WithVariables>
  );
};
