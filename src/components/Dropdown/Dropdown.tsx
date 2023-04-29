import { Placement } from "@popperjs/core";
import { Fragment, ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { CSSTransition } from "react-transition-group";
import { DROPDOWN_PORTAL_ID } from "../../constants/portals";
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
interface DropdownProps {
  width?: number;
  distance?: number;
  skidding?: number;
  placement?: Placement;
  children: (props: DropdownChildrenProps) => JSX.Element;
  options: DropdownSection[] | DropdownSectionElement[];
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

  const $portalContainer = useMemo(() => document.getElementById(DROPDOWN_PORTAL_ID), []);
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
  const sections = useMemo(() => wrapInSectionsIfNeeded(options), [options]);

  if ($portalContainer == null) {
    throw new Error("$portalContainer not defined");
  }

  return (
    <>
      {children({ setRef: setReferenceElement, toggleOpen, isOpen })}
      {createPortal(
        <>
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
            </div>
          </CSSTransition>
          {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}
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

function wrapInSectionsIfNeeded(options: DropdownSection[] | DropdownSectionElement[]): DropdownSection[] {
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
