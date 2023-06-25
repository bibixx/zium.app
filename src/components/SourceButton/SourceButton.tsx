import { MouseEventHandler, ReactNode } from "react";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import { IconComponent } from "../../types/Icon";
import { DriverImage } from "../DriverImage/DriverImage";
import styles from "./SourceButton.module.scss";

interface SourceButtonProps {
  label: ReactNode;
  color?: string;
  srcList?: string[];
  icon?: IconComponent | null;
  showPlaceholder?: boolean;
  onClick: MouseEventHandler;
  onMouseDown?: MouseEventHandler;
}

export const SourceButton = ({
  label,
  srcList,
  icon: Icon,
  color,
  showPlaceholder,
  onClick,
  onMouseDown,
}: SourceButtonProps) => {
  return (
    <button className={styles.wrapper} onClick={onClick} onMouseDown={onMouseDown}>
      {srcList && (
        <div className={styles.imageWrapper} style={{ backgroundColor: color }}>
          <DriverImage srcList={srcList} />
        </div>
      )}
      {showPlaceholder && (
        <div className={styles.imageWrapper} style={{ backgroundColor: color }}>
          <SquaresPlusIcon height={16} width={16} />
        </div>
      )}
      {Icon && (
        <div className={styles.imageWrapper} style={{ backgroundColor: color }}>
          <Icon height={16} width={16} />
        </div>
      )}
      <div className={styles.label}>{label}</div>
    </button>
  );
};
