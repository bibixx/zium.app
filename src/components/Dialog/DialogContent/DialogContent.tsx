import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import { withAs } from "../../../utils/withAs";
import styles from "./DialogContent.module.scss";

interface DialogContentProps {
  children: ReactNode;
}
export const DialogContent = withAs("div")<DialogContentProps>(({ children, as: Component, ...props }, ref) => {
  return (
    <Component className={styles.contentWrapper} ref={ref} {...props}>
      {children}
    </Component>
  );
});

interface DialogContentInformationProps {
  title: string;
  subtitle: string;
}
export const DialogContentInformation = ({ title, subtitle }: DialogContentInformationProps) => {
  return (
    <div className={styles.wrapper}>
      <InformationCircleIcon width={36} height={36} className={styles.infoIcon} />
      <div className={styles.textWrapper}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </div>
  );
};

interface DialogContentAlertProps {
  title: string;
  subtitle: string;
}
export const DialogContentAlert = ({ title, subtitle }: DialogContentAlertProps) => {
  return (
    <div className={styles.wrapper}>
      <ExclamationTriangleIcon width={36} height={36} className={styles.alertIcon} />
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
