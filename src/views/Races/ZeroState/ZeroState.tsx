import styles from "./ZeroState.module.scss";

export const ZeroState = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.heading}>Box, box!</div>
        <div className={styles.subheading}>
          We haven’t found any events for that name. Try adjusting your search criteria. You can type in a country,
          date, or a full name of the event.
        </div>
      </div>
    </div>
  );
};
