import classNames from "classnames";
import { ReactNode, useEffect, useState } from "react";
import styles from "./TimedOutWrapper.module.scss";

interface TimedOutWrapperProps {
  transition?: string;
  children: ReactNode;
  timeout: number;
}
export const TimedOutWrapper = ({ transition, children, timeout }: TimedOutWrapperProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, timeout);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [setIsVisible, timeout]);

  return (
    <div style={{ transition }} className={classNames(styles.wrapper, { [styles.isVisible]: isVisible })}>
      {children}
    </div>
  );
};
