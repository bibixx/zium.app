import { useState } from "react";
import cn from "classnames";
import { useInView } from "react-intersection-observer";
import { withAs } from "../../utils/withAs";
import { CountryImage } from "../CountryImage/CountryImage";
import { WithVariables } from "../WithVariables/WithVariables";
import { PictureConfig, useFormulaImage } from "../../hooks/useFormulaImage/useFormulaImage";
import { useImageLoadState } from "../../hooks/useImageLoadedState/useImageLoadedState";
import styles from "./EventCard.module.scss";

interface EventCardProps {
  pictureConfig: PictureConfig;
  countryName: string;
  countryId?: string;
  displayDate: string;
  caption?: string;
  description?: string;
}
export const EventCard = withAs("button")<EventCardProps>((
  { as: Component, pictureConfig, countryName, countryId, displayDate, caption, description, ...props },
  ref,
) => {
  const [inViewRef, inView] = useInView({ triggerOnce: true, rootMargin: "50% 0px" });
  const src = useFormulaImage(inView ? pictureConfig : undefined, 400, 195);
  const { imgProps, loadingState } = useImageLoadState(src);

  const [cursorPosition, setCursorPosition] = useState<{ x: number | undefined; y: number | undefined }>({
    x: undefined,
    y: undefined,
  });

  return (
    <WithVariables
      className={styles.hoverPositionWrapper}
      variables={{
        "x-pos": cursorPosition.x,
        "y-pos": cursorPosition.y,
      }}
      onMouseMove={(e) => {
        const boundingBox = e.currentTarget.getBoundingClientRect();
        const leftX = e.pageX - (boundingBox.left + window.scrollX);
        const topY = e.pageY - (boundingBox.top + window.scrollY);

        setCursorPosition({
          x: (leftX - boundingBox.width / 2) / (boundingBox.width / 2),
          y: (topY - boundingBox.height / 2) / (boundingBox.height / 2),
        });
      }}
      onMouseLeave={() => {
        setCursorPosition({
          x: undefined,
          y: undefined,
        });
      }}
      ref={inViewRef}
    >
      <Component className={styles.wrapper} {...props} ref={ref}>
        <div className={cn(styles.heroImageWrapper, { [styles.isLoaded]: loadingState === "loaded" })}>
          <img {...imgProps} src={src} alt="" className={styles.heroImage} draggable={false} />
        </div>
        <main className={styles.contentWrapper}>
          <div className={styles.header}>
            {countryId && <CountryImage countryId={countryId} width={40} height={40} />}
            <div className={styles.headerTextContent}>
              <div className={styles.headerFirstLine}>{countryName}</div>
              <div className={styles.headerSecondLine}>
                <div>{displayDate}</div>
                {caption && <div className={styles.headerRound}>{caption}</div>}
              </div>
            </div>
          </div>
          {description && <div className={styles.content}>{description}</div>}
        </main>
      </Component>
    </WithVariables>
  );
});

EventCard.displayName = "EventCard";
