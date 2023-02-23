import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import cn from "classnames";
import { useWindowSize } from "../../hooks/useWindowSize";
import { Dimensions } from "../../types/Dimensions";
import { formatPercentToString, roundToNearest, sizePercentToPx, sizePxToPercent } from "./RnDWindow.utils";
import styles from "./RnDWindow.module.css";
import { getStylesWithVariables } from "../WithVariables/WithVariables";
import { useDrag } from "./hooks/useDrag";
import { useResize } from "./hooks/useResize";
import { getTransform } from "./utils/getTransform";
import { Position, Size } from "./RnDWindow.types";

interface RnDWindowProps {
  grid: [number, number] | undefined;
  baseGrid: [number, number];
  children: ReactNode;
  dimensions: Dimensions;
  onChange: (dimensions: Dimensions) => void;
  zIndex: number;
  bringToFront: () => void;
}
export const RnDWindow = ({ dimensions, grid, baseGrid, children, onChange, zIndex, bringToFront }: RnDWindowProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 20, y: 500 });
  const [size, setSize] = useState({ width: 300, height: 200 });

  useEffect(() => {
    const $element = elementRef.current;
    if ($element == null) {
      return;
    }

    $element.style.width = `${size.width}px`;
    $element.style.height = `${size.height}px`;
    $element.style.transform = getTransform(position.x, position.y);
  }, [position, size]);

  const onResizeEnd = useCallback((size: Size, position: Position) => {
    setPosition(position);
    setSize(size);
  }, []);

  const onDragEnd = useCallback((position: Position) => {
    setPosition(position);
  }, []);

  const { onMouseDown: onWrapperMouseDown, isDragging } = useDrag({ elementRef, onDragEnd });
  const { onMouseDown: onMouseHandleDown } = useResize({ elementRef, onResizeEnd });

  useEffect(() => {
    console.log(position, size);
  }, [position, size]);

  return (
    <div
      ref={elementRef}
      className={cn(styles.rndWrapper, { [styles.isDragging]: isDragging })}
      onMouseDown={onWrapperMouseDown}
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
    </div>
  );
};
