import { useEffect, useRef } from "react";
import { useWindowSize } from "../../../hooks/useWindowSize";
import styles from "./BackgroundDots.module.scss";
import { drawDots } from "./BackgroundDots.utils";

interface BackgroundDotsProps {
  baseGrid: [number, number];
}
export const BackgroundDots = ({ baseGrid }: BackgroundDotsProps) => {
  const { height: windowHeight, width: windowWidth } = useWindowSize();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current == null) {
      return;
    }

    const $canvas = canvasRef.current;
    const ctx = $canvas.getContext("2d");

    if (ctx == null) {
      return;
    }

    ctx.clearRect(0, 0, windowWidth, windowHeight);
    const color = getComputedStyle($canvas).getPropertyValue("--dotColor");
    ctx.fillStyle = color;
    drawDots(windowHeight, windowWidth, baseGrid, ctx);
  }, [baseGrid, windowHeight, windowWidth, canvasRef]);

  return <canvas className={styles.canvas} width={windowWidth} height={windowHeight} ref={canvasRef} />;
};
