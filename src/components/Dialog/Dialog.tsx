import cn from "classnames";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import FocusTrap from "focus-trap-react";
import { OVERLAYS_PORTAL_ID } from "../../constants/portals";
import { WithVariables } from "../WithVariables/WithVariables";
import styles from "./Dialog.module.scss";

interface DialogProps {
  children: ReactNode;
  isOpen: boolean;
  width?: number | string;
  onClose: () => void;
  onClosed?: () => void;
  initialFocus?: boolean;
}
export const Dialog = ({ children, onClose, onClosed, isOpen, initialFocus = false, width = "auto" }: DialogProps) => {
  const $portalContainer = useMemo(() => document.getElementById(OVERLAYS_PORTAL_ID), []);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  if ($portalContainer == null) {
    throw new Error("$portalContainer not defined");
  }

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
        addEndListener={(done) =>
          wrapperRef.current?.addEventListener("transitionend", (e) => {
            if (e.target === wrapperRef.current) {
              done();
            }
          })
        }
        unmountOnExit
        mountOnEnter
        onExited={onClosed}
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
            initialFocus: initialFocus ? undefined : false,
            escapeDeactivates: false,
          }}
        >
          <WithVariables variables={{ width: addPxIfNeeded(width) }} className={cn(styles.wrapper)} ref={wrapperRef}>
            {children}
          </WithVariables>
        </FocusTrap>
      </CSSTransition>
    </>,
    $portalContainer,
  );
};

function addPxIfNeeded(value: string | number) {
  if (typeof value === "string") {
    return value;
  }

  return `${value}px`;
}
