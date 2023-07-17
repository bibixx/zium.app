import cn from "classnames";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import FocusTrap from "focus-trap-react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { OVERLAYS_PORTAL_ID } from "../../constants/portals";
import { Button } from "../Button/Button";
import styles from "./Sheet.module.scss";

interface SheetProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onClosed?: () => void;
  initialFocus?: boolean;
  wrapperClassName?: string;
  noPadding?: boolean;
}
export const Sheet = ({
  children,
  onClose,
  onClosed,
  isOpen,
  wrapperClassName,
  initialFocus = false,
  noPadding,
}: SheetProps) => {
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
        addEndListener={(done) => wrapperRef.current?.addEventListener("transitionend", done)}
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
          <div className={cn(styles.wrapper, { [styles.noPadding]: noPadding })} ref={wrapperRef}>
            <div className={wrapperClassName}>{children}</div>
            <Button
              className={styles.closeButton}
              onClick={onClose}
              variant="Secondary"
              iconLeft={XMarkIcon}
              aria-label="Close"
            />
          </div>
        </FocusTrap>
      </CSSTransition>
    </>,
    $portalContainer,
  );
};
