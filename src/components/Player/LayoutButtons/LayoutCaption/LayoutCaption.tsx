import cn from "classnames";
import { useRef, useState } from "react";
import { useElementSize } from "../../../../hooks/useElementSize/useElementSize";
import { WithVariables } from "../../../WithVariables/WithVariables";
import { getVideoShortcut, getVideosText } from "./LayoutCaption.utils";
import styles from "./LayoutCaption.module.scss";

interface LayoutCaptionProps {
  videosCount: number;
  i: number;
  withShortcutVisible: boolean;
}

export const LayoutCaption = ({ i, videosCount, withShortcutVisible }: LayoutCaptionProps) => {
  const text = getVideosText(videosCount);
  const shortcut = getVideoShortcut(i);

  const captionRef = useRef<HTMLDivElement | null>(null);
  const [captionWidth, setCaptionWidth] = useState(0);
  useElementSize(({ width }) => {
    return setCaptionWidth(width);
  }, captionRef);

  return (
    <WithVariables
      variables={{
        captionWidth: `${captionWidth}px`,
      }}
      className={cn(styles.captionWrapper, { [styles.withShortcutVisible]: withShortcutVisible })}
    >
      <div className={styles.captionVideosCount}>{text}</div>
      <div className={cn(styles.captionVideosCount, styles.captionVideosCountFaded)}>{text}</div>
      <div ref={captionRef} className={styles.captionShortcut}>
        {shortcut}
      </div>
    </WithVariables>
  );
};
