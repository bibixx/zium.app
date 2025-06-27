import cn from "classnames";
import { ImgHTMLAttributes } from "react";
import { useImageLoadState } from "../../hooks/useImageLoadedState/useImageLoadedState";
import styles from "./FadeInImage.module.scss";

interface FormulaImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
  className?: string;
}

export const FadeInImage = ({ src, className, ...props }: FormulaImageProps) => {
  const { imgProps, loadingState } = useImageLoadState(src);

  return (
    <img
      {...imgProps}
      src={src}
      className={cn(styles.image, { [styles.isLoaded]: loadingState === "loaded" }, className)}
      draggable={false}
      alt=""
      {...props}
    />
  );
};
