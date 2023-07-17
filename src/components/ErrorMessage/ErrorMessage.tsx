import { useMemo } from "react";
import { FlagIcon } from "@heroicons/react/24/outline";
import { Button } from "../Button/Button";
import { DialogContentAlert } from "../Dialog/DialogContent/DialogContent";
import styles from "./ErrorMessage.module.scss";

const EMAIL_ADDRESS = "zium@zium.app";
const SUBJECT = "zium.app Error Report";

export interface ErrorMessageProps {
  error: Error | string | null | undefined;
}
export const ErrorMessage = ({ error }: ErrorMessageProps) => {
  const errorMessage = useMemo(() => {
    if (error == null) {
      return null;
    }

    if (typeof error === "string") {
      return error;
    }

    return error.stack ?? error.message;
  }, [error]);

  const mailtoUrl = useMemo(() => {
    const fullMessage = `
Log generated from this error

userAgent: ${navigator.userAgent}

${errorMessage}
  `.trim();

    const url = new URL(`mailto:${EMAIL_ADDRESS}`);
    url.searchParams.set("subject", SUBJECT);
    url.searchParams.set("body", fullMessage.substring(0, 1800));

    return url.toString();
  }, [errorMessage]);

  return (
    <div>
      <DialogContentAlert
        title="Red flag! Red flag!"
        subtitle="Looks like we’ve crashed. Please try refreshing the page to see if that gets us back on track, or report the issue using the button below."
        icon={FlagIcon}
      />
      <div className={styles.buttonWrapper}>
        <Button fluid variant="Secondary" as="a" href={mailtoUrl}>
          Report Error
        </Button>
      </div>
    </div>
  );
};
