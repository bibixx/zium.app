import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import cn from "classnames";
import styles from "./Tooltip.module.scss";

interface TooltipProps extends Omit<TooltipPrimitive.TooltipContentProps, "content"> {
  content?: ReactNode | null | false;
  children: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}
export const Tooltip = ({
  children,
  content,
  sideOffset = 4,
  delayDuration,
  skipDelayDuration,
  disableHoverableContent = true,
  ...props
}: TooltipProps) => {
  if (content == null || content === false) {
    return children;
  }

  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.TooltipContent className={cn(styles.wrapper)} sideOffset={sideOffset} {...props}>
            {content}
          </TooltipPrimitive.TooltipContent>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
