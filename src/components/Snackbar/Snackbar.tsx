import { ReactNode, useMemo } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import { OVERLAYS_PORTAL_ID } from "../../constants/portals";
import styles from "./Snackbar.module.scss";

interface SnackbarProps {
  children: ReactNode;
  isOpen: boolean;
}

export const Snackbar = ({ children, isOpen }: SnackbarProps) => {
  const $portalContainer = useMemo(() => document.getElementById(OVERLAYS_PORTAL_ID), []);

  if ($portalContainer == null) {
    throw new Error("$portalContainer not defined");
  }

  return createPortal(
    <CSSTransition
      in={isOpen}
      addEndListener={(node, done) => node.addEventListener("transitionend", done)}
      unmountOnExit
      mountOnEnter
      classNames={{
        enter: styles.wrapperEnter,
        enterActive: styles.wrapperEnterActive,
        exit: styles.wrapperExit,
        exitActive: styles.wrapperExitActive,
      }}
    >
      <div className={styles.wrapper}>{children}</div>
    </CSSTransition>,

    $portalContainer,
  );
};
