import { useState } from "react";
import { withAs } from "../../utils/withAs";
import { CountryImage } from "../CountryImage/CountryImage";
import { WithVariables } from "../WithVariables/WithVariables";
import { useFormulaImage } from "../../hooks/useFormulaImage/useFormulaImage";
import styles from "./EventCard.module.scss";

interface EventCardProps {
  pictureUrl: string;
  countryName: string;
  countryId?: string;
  displayDate: string;
  caption?: string;
  description?: string;
}
export const EventCard = withAs("button")<EventCardProps>(
  ({ as: Component, pictureUrl, countryName, countryId, displayDate, caption, description, ...props }, ref) => {
    const fullPictureUrl = useFormulaImage(pictureUrl, 400, 195);
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
      >
        <Component className={styles.wrapper} {...props} ref={ref}>
          <div className={styles.heroImageWrapper}>
            <img src={fullPictureUrl} alt="" className={styles.heroImage} draggable={false} />
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
  },
);
