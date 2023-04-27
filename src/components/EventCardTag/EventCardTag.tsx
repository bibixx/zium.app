import { ClockIcon, SignalIcon } from "@heroicons/react/20/solid";
import { ReactNode } from "react";
import styles from "./EventCardTag.module.scss";

interface EventCardTagProps {
  children: ReactNode;
  variant: "live" | "upcoming";
}
export const EventCardTag = ({ children, variant }: EventCardTagProps) => {
  const Icon = variant === "live" ? SignalIcon : ClockIcon;
  return (
    <div className={styles.wrapper}>
      <Icon width={20} height={20} />
      <span>{children}</span>
    </div>
  );
};
