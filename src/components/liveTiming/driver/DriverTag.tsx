import styles from "./DriverTag.module.scss";

type Props = {
  teamColor: string;
  short: string;
  position?: number;
  className?: string;
};

export default function DriverTag({ position, teamColor, short, className }: Props) {
  const tagClasses = [styles.tag, className?.includes("!min-w-full") && styles.fullWidth].filter(Boolean).join(" ");

  return (
    <div id="walkthrough-driver-position" className={tagClasses} style={{ backgroundColor: `#${teamColor}` }}>
      {position && <p className={styles.position}>{position}</p>}

      <div className={styles.driver}>
        <p className={styles.code} style={{ ...(teamColor && { color: `#${teamColor}` }) }}>
          {short}
        </p>
      </div>
    </div>
  );
}
