import SpinnerSvg from "../../assets/spinner.svg?react";
import styles from "./Spinner.module.scss";

export const Spinner = (props: React.SVGProps<SVGSVGElement>) => {
  return <SpinnerSvg className={styles.spinner} {...props} />;
};
