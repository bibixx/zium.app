import styles from "./DriverDRS.module.scss";

type Props = {
  on: boolean;
  possible: boolean;
  inPit: boolean;
  pitOut: boolean;
};

export default function DriverDRS({ on, possible, inPit, pitOut }: Props) {
  const pit = inPit || pitOut;

  const drsClasses = [
    styles.drs,
    pit ? styles.drsPit : on ? styles.drsActive : possible ? styles.drsPossible : styles.drsInactive,
  ].join(" ");

  return (
    <span id="walkthrough-driver-drs" className={drsClasses}>
      {pit ? "PIT" : "DRS"}
    </span>
  );
}
