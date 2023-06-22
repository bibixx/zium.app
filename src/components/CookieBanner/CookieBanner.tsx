import cn from "classnames";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { Button } from "../Button/Button";
import styles from "./CookieBanner.module.scss";

interface CookieBannerProps {
  position: "top" | "bottom";
  mode: "sticky" | "fixed";
}
export const CookieBanner = ({ position, mode }: CookieBannerProps) => {
  const { setConsent, wasConsentGiven } = useAnalytics();

  if (wasConsentGiven !== null) {
    return null;
  }

  return (
    <div
      className={cn(styles.wrapper, {
        [styles.isOnTop]: position === "top",
        [styles.isOnBottom]: position === "bottom",
        [styles.isSticky]: mode === "sticky",
        [styles.isFixed]: mode === "fixed",
      })}
    >
      <div className={styles.textWrapper}>
        <div className={styles.heading}>🍪 We use cookies</div>
        <div className={styles.body}>
          By clicking on “Allow all cookies”, you agree to the storing of cookies on your device to enhance site
          navigation, analyze site usage, and assist in our marketing efforts.
        </div>
      </div>
      <div className={styles.buttonsWrapper}>
        <Button variant="Secondary" onClick={() => setConsent(false)}>
          Reject non-essential
        </Button>
        <Button variant="Primary" onClick={() => setConsent(true)}>
          Allow all cookies
        </Button>
      </div>
    </div>
  );
};
