import classNames from "classnames";
import { FadeInImage } from "../FadeInImage/FadeInImage";
import { useImage } from "../../hooks/useImage/useImage";
import styles from "./DriverImage.module.scss";

interface DriverImageProps {
  srcList: string[];
  className?: string;
}
export const DriverImage = ({ srcList, className }: DriverImageProps) => {
  const src = useImage(srcList);

  return <FadeInImage src={src} className={classNames(styles.image, className)} />;
};
