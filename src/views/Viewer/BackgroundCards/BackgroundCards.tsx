import styles from "./BackgroundCards.module.scss";

export const BackgroundCards = () => {
  return (
    <div className={styles.background}>
      <div className={styles.card} style={{ gridArea: getGridArea(0, 8, 0, 8) }} />

      <div className={styles.card} style={{ gridArea: getGridArea(0, 4, 8, 12) }} />
      <div className={styles.card} style={{ gridArea: getGridArea(4, 8, 8, 12) }} />

      <div className={styles.card} style={{ gridArea: getGridArea(8, 12, 0, 4) }} />
      <div className={styles.card} style={{ gridArea: getGridArea(8, 12, 4, 8) }} />
      <div className={styles.card} style={{ gridArea: getGridArea(8, 12, 8, 12) }} />

      <div className={styles.card} style={{ gridArea: getGridArea(12, 14, 0, 12) }} />
    </div>
  );
};

function getGridArea(rowStart: number, rowEnd: number, columnStart: number, columnEnd: number) {
  return `${rowStart + 1} / ${columnStart + 1} / ${rowEnd + 1} / ${columnEnd + 1}`;
}
