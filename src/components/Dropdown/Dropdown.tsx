import { Placement } from "@popperjs/core";
import FocusTrap from "focus-trap-react";
import { Fragment, ReactNode, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { CSSTransition } from "react-transition-group";
import { Key } from "ts-key-enum";
import { OVERLAYS_PORTAL_ID } from "../../constants/portals";
import { ListItem } from "../ListItem/ListItem";
import { WithVariables } from "../WithVariables/WithVariables";
import { isNotFalse } from "../../utils/isNotFalse";
import { UseDropdownStateArguments, useDropdownHotkeys, useDropdownState, usePopperAnchorRef } from "./Dropdown.hooks";
import styles from "./Dropdown.module.scss";

export interface DropdownSectionElement {
  id: string;
  text: ReactNode;
  caption?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export interface DropdownSection {
  id: string;
  options: (DropdownSectionElement | false)[];
}

interface DropdownChildrenProps {
  setRef: (ref: HTMLElement | null) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}
export type DropdownOptions = (DropdownSection | false)[] | DropdownSectionElement[];
interface StatelessDropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  width?: number;
  distance?: number;
  skidding?: number;
  placement?: Placement;
  children: (props: DropdownChildrenProps) => JSX.Element;
  options: DropdownOptions | ((toggleOpen: () => void) => DropdownOptions);
  closeOnClick?: boolean;
}

type DropdownProps = UseDropdownStateArguments &
  Omit<StatelessDropdownProps, "isOpen" | "setIsOpen" | "onOpened" | "onClosed" | "toggleOpen">;

export const Dropdown = ({ onOpened, onClosed, ...props }: DropdownProps) => {
  const state = useDropdownState({ onOpened, onClosed });
  useDropdownHotkeys(state);

  return <StatelessDropdown {...props} {...state} />;
};

export const StatelessDropdown = ({
  isOpen,
  setIsOpen,
  toggleOpen,
  width = 240,
  children,
  placement = "auto",
  distance = 8,
  skidding = 0,
  options,
  closeOnClick = false,
}: StatelessDropdownProps) => {
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
                  isKeyBackward: (e) => {
                    const isShiftTab = e.key === Key.Tab && e.shiftKey;
                    const isUpArrow = e.key === Key.ArrowUp;

                    return isShiftTab || isUpArrow;
                  },
                  isKeyForward: (e) => {
                    const isTabWithoutShift = e.key === Key.Tab && !e.shiftKey;
                    const isUpArrow = e.key === Key.ArrowDown;

                    return isTabWithoutShift || isUpArrow;
                  },
                }}
              >
                <WithVariables className={styles.wrapper} variables={{ width }} ref={backgroundWrapperRef}>
                  {sections.map((section, sectionI) => (
                    <Fragment key={section.id}>
                      {section.options.map((option) => {
                        if (option === false) {
                          return null;
                        }

                        const { id, text, onClick, ...rest } = option;
                        return (
                          <ListItem
                            key={id}
                            onClick={(e: React.MouseEvent) => {
                              onClick?.(e);

                              if (!e.defaultPrevented && closeOnClick) {
                                setIsOpen(false);
                              }
                            }}
                            {...rest}
                          >
                            {text}
                          </ListItem>
                        );
                      })}
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

function isDropdownSections(
  options: (DropdownSection | false)[] | (DropdownSectionElement | false)[],
): options is (DropdownSection | false)[] {
  let hadSection = false;
  let hadOption = false;
  for (const option of options) {
    if (option === false) {
      continue;
    }

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
    return options.filter(isNotFalse);
  }

  return [
    {
      id: "__DEFAULT_SECTION_ID__",
      options: options.filter(isNotFalse),
    },
  ];
}
