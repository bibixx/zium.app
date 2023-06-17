import { ReactComponent as LogoSvg } from "../../assets/logo.svg";
import styles from "./Logo.module.scss";

type OptionalHeight = {
  height?: number;
  width: number;
};

type OptionalWidth = {
  height: number;
  width?: number;
};

type BothProvided = {
  height: number;
  width: number;
};

type SizeProps = OptionalHeight | OptionalWidth | BothProvided;
type LogoProps = {
  color?: string;
} & SizeProps &
  React.SVGProps<SVGSVGElement>;
export const Logo = ({ color, height, width, ...props }: LogoProps) => {
  return <LogoSvg className={styles.logo} height={height} width={width} style={{ color }} {...props} />;
};
