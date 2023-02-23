import { Season } from "./Season/Season";
import styles from "./Races.module.css";

export const Races = () => {
  return (
    <div className={styles.races}>
      <Season title="Season 2023" seasonId="6603" openByDefault />
      <Season title="Season 2022" seasonId="4319" />
    </div>
  );
};
