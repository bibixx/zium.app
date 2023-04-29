import { Placement } from "@popperjs/core";
import FocusTrap from "focus-trap-react";
import { Fragment, ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { CSSTransition } from "react-transition-group";
import { Key } from "ts-key-enum";
import { OVERLAYS_PORTAL_ID } from "../../constants/portals";
import { useHotkeysStack } from "../../hooks/useHotkeysStack/useHotkeysStack";
import { useScopedHotkeys } from "../../hooks/useScopedHotkeys/useScopedHotkeys";
import { ListItem } from "../ListItem/ListItem";
import { WithVariables } from "../WithVariables/WithVariables";
import { usePopperAnchorRef } from "./Dropdown.hooks";
import styles from "./Dropdown.module.scss";

export interface DropdownSectionElement {
  id: string;
  text: ReactNode;
  caption?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownSection {
  id: string;
  options: DropdownSectionElement[];
}

interface DropdownChildrenProps {
  setRef: (ref: HTMLElement | null) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}
type BaseOptions = DropdownSection[] | DropdownSectionElement[];
interface DropdownProps {
  width?: number;
  distance?: number;
  skidding?: number;
  placement?: Placement;
  children: (props: DropdownChildrenProps) => JSX.Element;
  options: BaseOptions | ((toggleOpen: () => void) => BaseOptions);
}
export const Dropdown = ({
  width = 240,
  children,
  placement = "auto",
  distance = 8,
  skidding = 0,
  options,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((oldIsOpen) => !oldIsOpen), []);

  const scope = useHotkeysStack(isOpen, false);
  useScopedHotkeys(Key.Escape, scope, toggleOpen);

  const $portalContainer = useMemo(() => document.getElementById(OVERLAYS_PORTAL_ID), []);
  const backgroundWrapperRef = useRef<HTMLDivElement>(null);

  const { element: referenceElement, updateRef: setReferenceElement } = usePopperAnchorRef<HTMLElement | null>(null);
  const { element: popperElement, updateRef: setPopperElement } = usePopperAnchorRef<HTMLDivElement | null>(null);
  const { styles: popperStyles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [skidding, distance],
        },
      },
    ],
    strategy: "fixed",
    placement,
  });
  const sections = useMemo(() => transformOptionsToSections(options, toggleOpen), [options, toggleOpen]);

  if ($portalContainer == null) {
    throw new Error("$portalContainer not defined");
  }

  return (
    <>
      {children({ setRef: setReferenceElement, toggleOpen, isOpen })}
      {createPortal(
        <>
          {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}
          <CSSTransition
            in={isOpen}
            nodeRef={backgroundWrapperRef}
            addEndListener={(done) => backgroundWrapperRef.current?.addEventListener("transitionend", done)}
            unmountOnExit
            mountOnEnter
            classNames={{
              enter: styles.wrapperEnter,
              enterActive: styles.wrapperEnterActive,
              exit: styles.wrapperExit,
              exitActive: styles.wrapperExitActive,
            }}
          >
            <div
              className={styles.positionWrapper}
              style={popperStyles.popper}
              {...attributes.popper}
              ref={setPopperElement}
            >
              <FocusTrap
                focusTrapOptions={{
                  allowOutsideClick: true,
                  escapeDeactivates: false,
                }}
              >
                <WithVariables className={styles.wrapper} variables={{ width }} ref={backgroundWrapperRef}>
                  {sections.map((section, sectionI) => (
                    <Fragment key={section.id}>
                      {section.options.map(({ id, text, ...rest }) => (
                        <ListItem key={id} {...rest}>
                          {text}
                        </ListItem>
                      ))}
                      {sectionI !== sections.length - 1 && <div className={styles.divider} />}
                    </Fragment>
                  ))}
                </WithVariables>
              </FocusTrap>
            </div>
          </CSSTransition>
        </>,
        $portalContainer,
      )}
    </>
  );
};

function isDropdownSections(options: DropdownSection[] | DropdownSectionElement[]): options is DropdownSection[] {
  let hadSection = false;
  let hadOption = false;
  for (const option of options) {
    if ("options" in option) {
      hadSection = true;
    } else {
      hadOption = true;
    }
  }

  if (hadOption && hadSection) {
    throw new Error("Options had both DropdownSection and DropdownSectionElement");
  }

  return hadSection;
}

function transformOptionsToSections(
  optionsOrFunction: DropdownProps["options"],
  toggleOpen: () => void,
): DropdownSection[] {
  const options = typeof optionsOrFunction === "function" ? optionsOrFunction(toggleOpen) : optionsOrFunction;

  if (isDropdownSections(options)) {
    return options;
  }

  return [
    {
      id: "__DEFAULT_SECTION_ID__",
      options,
    },
  ];
}
