import cn from "classnames";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import FocusTrap from "focus-trap-react";

import { SHEET_PORTAL_ID } from "../../constants/portals";
import styles from "./Sheet.module.scss";

interface SheetProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}
export const Sheet = ({ children, onClose, isOpen }: SheetProps) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const $portalContainer = useMemo(() => document.getElementById(SHEET_PORTAL_ID)!, []);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.removeProperty("overflow");
    }
  }, [isOpen]);

  return createPortal(
    <>
      <CSSTransition
        in={isOpen}
        nodeRef={backdropRef}
        addEndListener={(done) => backdropRef.current?.addEventListener("transitionend", done)}
        unmountOnExit
        mountOnEnter
        classNames={{
          enter: styles.backdropEnter,
          enterActive: styles.backdropEnterActive,
          exit: styles.backdropExit,
          exitActive: styles.backdropExitActive,
        }}
      >
        <div className={cn(styles.backdrop)} onClick={onClose} ref={backdropRef}></div>
      </CSSTransition>

      <CSSTransition
        in={isOpen}
        nodeRef={wrapperRef}
        addEndListener={(done) => wrapperRef.current?.addEventListener("transitionend", done)}
        unmountOnExit
        mountOnEnter
        classNames={{
          enter: styles.wrapperEnter,
          enterActive: styles.wrapperEnterActive,
          exit: styles.wrapperExit,
          exitActive: styles.wrapperExitActive,
        }}
      >
        <FocusTrap
          focusTrapOptions={{
            allowOutsideClick: true,
            initialFocus: false,
            escapeDeactivates: false,
          }}
        >
          <div className={cn(styles.wrapper)} ref={wrapperRef}>
            <div>{children}</div>
            <button className={styles.closeButton} onClick={onClose}>
              Close
            </button>
          </div>
        </FocusTrap>
      </CSSTransition>
    </>,
    $portalContainer,
  );
};
