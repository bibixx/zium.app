import classNames from "classnames";
import { useImage } from "react-image";
import styles from "./DriverImage.module.scss";

interface DriverImageProps {
  srcList: string[];
  className?: string;
}
export const DriverImage = ({ srcList, className }: DriverImageProps) => {
  const { src, isLoading } = useImage({
    srcList,
    useSuspense: false,
  });

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={classNames(styles.image, { [styles.isLoading]: isLoading }, className)}
    />
  );
};
