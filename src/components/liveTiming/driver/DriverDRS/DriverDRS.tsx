import styles from "./DriverDRS.module.scss";

type Props = {
  on: boolean;
  possible: boolean;
  inPit: boolean;
  pitOut: boolean;
  id?: string;
};

export default function DriverDRS({ on, possible, inPit, pitOut, id }: Props) {
  const pit = inPit || pitOut;

  const drsClasses = [
    styles.drs,
    pit ? styles.drsPit : on ? styles.drsActive : possible ? styles.drsPossible : styles.drsInactive,
  ].join(" ");

  return (
    <div id={id} className={drsClasses}>
      <span>{pit ? "PIT" : "DRS"}</span>
    </div>
  );
}
