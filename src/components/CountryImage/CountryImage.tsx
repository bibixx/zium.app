import cn from "classnames";
import styles from "./CountryImage.module.scss";

interface CountryImageProps {
  countryId: string;
  className?: string;
  width: string | number;
  height: string | number;
}
export const CountryImage = ({ countryId, className, width, height }: CountryImageProps) => {
  return (
    <div
      className={styles.countryImageWrapper}
      style={{ width: getSize(width), minWidth: getSize(width), height: getSize(height) }}
    >
      <img
        className={cn(styles.countryImage, `country-${countryId}`, className)}
        draggable={false}
        src={`https://ott-img.formula1.com/countries/${countryId}.png`}
        alt=""
      />
    </div>
  );
};

const getSize = (size: string | number) => (typeof size === "number" ? `${size}px` : size);
