import styles from "./EventCardSkeleton.module.scss";

export const EventCardSkeleton = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.image}></div>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div className={styles.country}></div>
          <div className={styles.headerLines}>
            <div className={styles.headerFirstLine}></div>
            <div className={styles.headerSecondLine}></div>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentFirstLine}></div>
          <div className={styles.contentSecondLine}></div>
        </div>
      </div>
    </div>
  );
};
