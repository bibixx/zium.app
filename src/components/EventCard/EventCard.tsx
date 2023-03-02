import cn from "classnames";
import { withAs } from "../../utils/withAs";
import styles from "./EventCard.module.scss";

interface EventCardProps {
  pictureUrl: string;
  countryName: string;
  countryId?: string;
  displayDate: string;
  caption?: string;
  description?: string;
}
export const EventCard = withAs("div")<EventCardProps>(
  ({ as: Component, pictureUrl, countryName, countryId, displayDate, caption, description, ...props }) => {
    return (
      <Component className={styles.wrapper} {...props}>
        <div className={styles.heroImageWrapper}>
          <img
            src={`https://f1tv.formula1.com/image-resizer/image/${pictureUrl}?w=400&h=195&q=HI&o=L`}
            alt=""
            className={styles.heroImage}
          />
          <div className={styles.heroImageOverlay} />
        </div>
        <main className={styles.contentWrapper}>
          <div className={styles.header}>
            {countryId && (
              <div className={styles.countryImageWrapper}>
                <img
                  className={cn(styles.countryImage, `country-${countryId}`)}
                  src={`https://ott-img.formula1.com/countries/${countryId}.png`}
                  alt=""
                />
              </div>
            )}
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
    );
  },
);
