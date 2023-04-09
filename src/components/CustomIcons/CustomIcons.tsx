import { ReactComponent as ArrowLeft30Svg } from "../../assets/arrow-left-30.svg";
import { ReactComponent as ArrowRight30Svg } from "../../assets/arrow-right-30.svg";
import styles from "./CustomIcons.module.scss";

export const ArrowLeft30Icon = (props: React.SVGProps<SVGSVGElement>) => {
  return <ArrowLeft30Svg className={styles.wrapper} {...props} />;
};

export const ArrowRight30Icon = (props: React.SVGProps<SVGSVGElement>) => {
  return <ArrowRight30Svg className={styles.wrapper} {...props} />;
};
