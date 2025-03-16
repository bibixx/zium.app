import styles from "./DriverTag.module.scss";

type Props = {
  id?: string;
  teamColor: string;
  short: string;
  position?: number;
};

export default function DriverTag({ position, teamColor, short, id }: Props) {
  return (
    <div id={id} className={styles.tag}>
      {position && <div>{position}</div>}

      <div>
        <div style={{ ...(teamColor && { color: `#${teamColor}` }) }}>{short}</div>
      </div>
    </div>
  );
}
