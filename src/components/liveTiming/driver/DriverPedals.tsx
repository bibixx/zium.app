import styles from "./DriverPedals.module.scss";

type Props = {
  value: number;
  maxValue: number;
  className?: string;
};

export default function DriverPedals({ value, maxValue, className }: Props) {
  const progress = value / maxValue;
  const barClasses = [
    styles.bar,
    className?.includes("bg-red-500")
      ? styles.brake
      : className?.includes("bg-emerald-500")
      ? styles.throttle
      : className?.includes("bg-blue-500")
      ? styles.drs
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.pedals}>
      <div className={barClasses} style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
