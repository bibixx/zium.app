import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import { withAs } from "../../../utils/withAs";
import styles from "./DialogContent.module.scss";

interface DialogContentProps {
  children: ReactNode;
  maxWidth?: number;
}
export const DialogContent = withAs("div")<DialogContentProps>(
  ({ children, as: Component, maxWidth, style, ...props }, ref) => {
    return (
      <Component
        className={styles.contentWrapper}
        ref={ref}
        style={maxWidth != null || style != null ? { maxWidth, ...style } : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

interface DialogContentInformationProps {
  title: string;
  subtitle: ReactNode;
  icon?: typeof InformationCircleIcon;
}
export const DialogContentInformation = ({
  title,
  subtitle,
  icon: Icon = ExclamationTriangleIcon,
}: DialogContentInformationProps) => {
  return (
    <div className={styles.wrapper}>
      <Icon width={36} height={36} className={styles.infoIcon} />
      <div className={styles.textWrapper}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </div>
  );
};

interface DialogContentAlertProps {
  title: string;
  subtitle: ReactNode;
  icon?: typeof ExclamationTriangleIcon;
}
export const DialogContentAlert = ({
  title,
  subtitle,
  icon: Icon = ExclamationTriangleIcon,
}: DialogContentAlertProps) => {
  return (
    <div className={styles.wrapper}>
      <Icon width={36} height={36} className={styles.alertIcon} />
      <div className={styles.textWrapper}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </div>
  );
};

interface DialogContentCustomProps {
  title: string;
  children: ReactNode;
}
export const DialogContentCustom = ({ title, children }: DialogContentCustomProps) => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
};

interface DialogContentButtonFooterProps {
  children: ReactNode;
}
export const DialogContentButtonFooter = ({ children }: DialogContentButtonFooterProps) => {
  return <div className={styles.buttonFooter}>{children}</div>;
};
